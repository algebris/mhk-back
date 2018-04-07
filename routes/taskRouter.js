const _ = require('lodash'),
  express = require('express'),
  passport = require('passport'),
  errors = require('../services/errors'),
  Task = require('../models/taskModel'),
  User = require('../models/userModel'),
  UserTask = require('../models/userTaskModel'),
  sanitizer = require('sanitizer'),
  moment = require('moment'),
  fs = require('fs-extra'),
  crypto = require('crypto'),
  multer = require('multer'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'MHK.taskRouter'});

const router = express.Router();
// const upload = multer({ dest: './uploads/task', limits: '20MB' });
// const removeImage = async filePath => fs.remove(filePath).catch(err => console.error(err));
const UPLOADS_DIR = 'uploads/tasks';

//todo: check wether this list is complete & valid
const MAGIC_NUMBERS = {
  jpg: 'ffd8ffe0',
  jpeg: 'ffd8ffe1',
  png: '89504e47',
  gif: '47494638'
};

String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g, '');
};

// TASK ENTITY /api/v1/task

router.post('/', passport.authenticate('jwt'), async (req, res, next) => {
  let taskObj = {};
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: '15MB'
  }).single('image');
  
  upload(req, res, async err => {
    if(err) return next(errors.badRequest('Upload file error'));

    // Check completion date
    const expiredAt = (req.body.expired_at && !_.isEmpty(req.body.expired_at.trim())) ? 
      moment(req.body.expired_at).endOf('day') : undefined;
      // moment(req.body.expited_at, moment.HTML5_FMT.DATE) : undefined;

    if(expiredAt !== undefined && !expiredAt.isValid()) {
      return next(errors.badRequest('Invalid form data'));
    }
    //todo: check wether date is valid (approve criterion)
    taskObj.expiredAt = expiredAt;

    // Check title, description fields
    const title = sanitizer.sanitize(req.body.title).trim();
    const description = sanitizer.sanitize(req.body.description).trim();
    
    if(title.length == 0 || description.length == 0) {
      return next(errors.badRequest('Text fields shouldn\'t be empty'));
    }
    
    taskObj = _.assign(taskObj, {title, description});

    // Check image 
    if(req.file) {
      const buffer = req.file.buffer;
      const magic = buffer.toString('hex', 0, 4);
      const ext = _.invert(MAGIC_NUMBERS)[magic];
      let filename = crypto.pseudoRandomBytes(16).toString('hex') + `.${ext}`;
      
      if (ext) {
        try {
          fs.outputFileSync(`./${UPLOADS_DIR}/${filename}`, buffer, 'binary');
        } catch(err) {
          log.error('Error writing file', err);
          return next(errors.badRequest());
        }
      } else {
        log.error(`Image file is invalid, check this magic (4bytes from beginning) number: ${magic}`);
        return next(errors.badRequest('Image file is invalid'));
      }
      taskObj = _.assign(taskObj, {image: `/${UPLOADS_DIR}/${filename}`});
    }
    
    // save Task model
    const model = new Task(taskObj);
    const saveResult = await model.save(taskObj);
    //todo: catch db error
    res.json(_.pick(saveResult, ['id','expiredAt','title','description','image']));
  });
});

router.get('/',  passport.authenticate('jwt'), async (req, res) => {
  // get all active tasks
  const user = await User.findOne({email: req.user.email});
  const type = req.query.type || 'all';
  const offset = req.query.offset || 0;
  const count = req.query.count || 10;

  // compare if there are new taks for this user
  let liveTasks = await Task.find({expiredAt: { $gte: moment() }}, {_id: true});
  let savedTasks = await UserTask.find({user: user._id});

  const listOfSavedTasks = _.chain(savedTasks)
    .map('task')
    .map(_.toString)
    .value();

  liveTasks = _.chain(liveTasks)
    .map('_id')
    .map(_.toString)
    .difference(listOfSavedTasks)
    .value();

  // if so update DB inserting a new records to UserTasks joint table & to User.tasks
  if(liveTasks.length > 0) {
    const newTasks = _.map(liveTasks, task => ({task: task, user: user._id}));
    const newUsersTasks = await UserTask.insertMany(newTasks);

    user.tasks = user.tasks.concat(_.map(newUsersTasks, '_id'));
    await user.save();
  }

  let result = await User.deepPopulate(user, 'tasks.task');
  result = result.filterTasks({type, offset, count});
  res.json(result);
});

module.exports = router;