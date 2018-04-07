const _ = require('lodash'),
  express = require('express'),
  User = require('../models/userModel'),
  errors = require('../services/errors'),
  mailerService = require('../services/mailer'),
  validator = require('validator'),
  passport = require('passport'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'MHK.userRouter'}),
  router = express.Router();

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

module.exports = router;
