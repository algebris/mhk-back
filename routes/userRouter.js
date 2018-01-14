const _ = require('lodash'),
  express = require('express'),
  cfg = require('../config/config'),
  User = require('../models/userModel'),
  auth = require('../services/auth/auth'),
  multer = require('multer'),
  mailerService = require('../services/mailer'),
  validator = require('validator'),
  router = express.Router();

const upload = multer({ dest: cfg.storagePath, limits: '100MB' });

router.post('/profile', auth.authenticate, upload.single('avatar'), (req, res, next) => {
  console.log(req.file, req.body, req.user);
  next(null)
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
      const resend = await mailerService.resendConfirmation(user);
      return res.json({success:true});
    }

    if(user)
      return res.status(409).json({success: false, message:'Mail address exists'});

    await mailerService.signUp(email, password)
      .catch(err => {throw new Error('Error sending email')});
    
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

module.exports = router;
