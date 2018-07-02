const _ = require('lodash'),
  Promise = require('bluebird'),
  express = require('express'),
  User = require('../models/userModel'),
  errors = require('../services/errors'),
  mailerService = require('../services/mailer'),
  validator = require('validator'),
  passport = require('passport'),
  bunyan = require('bunyan'),
  fs = require('fs-extra'),
  crypto = require('crypto'),
  multer = require('multer'),
  sanitizer = require('sanitizer'),
  log = bunyan.createLogger({name: 'MHK.userRouter'}),
  geo = require('../services/geo'),
  router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: '15MB'
}).single('avatar');

const UPLOADS_DIR = 'uploads/avatars';
const MAGIC_NUMBERS = {
  jpg: 'ffd8ffe0',
  jpeg: 'ffd8ffe1',
  png: '89504e47',
  gif: '47494638'
};

String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g, '');
};

router.patch('/password', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const email = req.user.email;

  if(email && req.body.password) {
    let Account = await User.findOne({email});
    if(Account) {
      Account.password = req.body.password;
      Account.save();
    }
    res.json({success: true});
  }
});

router.post('/password/request', async (req, res, next) => {
  if(!req.body.email || !validator.isEmail(req.body.email)) {
    return next(errors.badRequest('Invalid Email'));
  }
  try {
    await mailerService.restorePassword(req.body.email);
    res.json({success:true});
  } catch(e) {
    log.error(e);
    next(e);
  }
});

router.post('/password/update', async (req, res, next) => {
  if(!req.body.password && !req.body.email && !req.body.key) {
    return next(errors.badRequest());
  }
  const user = await User.findOne({email:req.body.email, passwordRestoreHash:req.body.key});
  if(!user) 
    return next(errors.badRequest());
  
  user.password = req.body.password;
  user.passwordRestoreHash = undefined;

  const result = await user.save();
  log.error(result);
  
  res.json({success:true});
});

router.post('/signup', async (req, res, next) => {
  try {
    const resend = _.get(req.query, 'resend', null),
      password = _.get(req.body, 'password', null),
      email = _.get(req.body, 'email', null);

    if(!password)
      return res.status(409).json({success:false, message:'Bad password'});

    if(!validator.isEmail(email))
      return res.status(409).json({success:false, message:'Bad email'});
    
    const user = await User.findOne({email:email});

    if(user && resend) {
      await mailerService.resendConfirmation(user);
      return res.json({success:true});
    }

    if(user)
      return res.status(409).json({success: false, message:'Mail address exists'});

    await mailerService.signUp(email, password)
      .catch(() => {
        throw new Error('Error sending email');
      });
    
    res.json({success: true});
  } catch (err) {
    next(err);
  }
});

router.get('/signup', async (req, res, next) => {
  const key = _.get(req.query, 'key');
  
  if(!key) next({message: 'Bad key'});

  const user = await mailerService.checkSignup(key);
  if(user)
    res.json({success:true, message:'Signed up', email: user.email});
  else
    next({message: 'Bad key'});
});

router.get('/', passport.authenticate('jwt'), async (req, res, next) => {
  const user = await User.findOne({email: req.user.email}, {profile:1});
  if(!user) return next({message: 'Bad user\'s JWT'});
  res.json(user);
});

router.put('/', passport.authenticate('jwt'), async (req, res, next) => {
  const user = (await User.findOne({email: req.user.email}, {profile:1})).toObject();
  if(!user) return next(errors.resourceNotFoundError('User not found'));
  let profile = _.get(user, 'profile', {});

  upload(req, res, async err => {
    if(err) 
      return next(errors.badRequest('Upload file error'));

    // Check fullName field
    if(req.body.fullName) {
      const fullName = sanitizer.sanitize(req.body.fullName).trim();
      if(fullName.length > 0)
        profile.fullName = fullName;
    }

    // Check locality
    if(req.body.placeId) {
      try {
        const Place = new geo.Place(req.body.placeId);
        await Place.lookup();

        if(Place.name) {
          profile.locality = _.pick(Place, ['id', 'name', 'address']);
        }
      } catch(err) {
        log.error(err);
      }
    }

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
        // TODO: Should be changed using native library ImageMagic
        log.error(`Image file is invalid, check this magic (4bytes from beginning) number: ${magic}`);
        return next(errors.badRequest('Image file is invalid'));
      }

      profile.avatar = `/images/avatars/${filename}`;
    }

    await User.findOneAndUpdate({_id:user._id}, {'$set':{profile}}, {multi:true});
    res.json(profile);
  });
});

module.exports = router;
