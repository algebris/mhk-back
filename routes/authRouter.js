const express = require('express'),
  config = require('../config/config'),
  auth = require('../services/auth'),
  passport = require('passport'),
  errors = require('../services/errors'),
  FB = require('fb'),
  Vkontakte = require('vkontakte'),
  User = require('../models/userModel'),
  jwt = require('jsonwebtoken');

router = express.Router();
FB.options({
    Promise: require('bluebird')
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if(err) next(err);
    if(!user) {
      res.status(401).json({success:false, message:'Invalid credentials'});
    } else {
      const token = jwt.sign({email:user.email}, config.auth.jwtSecret);
      res.json(token);
    }
  })(req, res, next);
});

router.get('/auth', (req, res, next) => {
  passport.authenticate('jwt', (err, user) => {
    if(req.query.refresh) {
      const token = jwt.sign({email:user.email}, config.auth.jwtSecret);
      return res.json(token);
    }
    return user ? 
      res.json({success: true}) : 
      next(errors.unauthorized());
  })(req, res, next);
});

router.post('/auth/vk', async (req, res, next) => {
  const token = req.body.token || null;
  const email = req.body.email;

  if(!token) {
    return next(errors.unauthorized('Bad token'));
  }
  const vk = Vkontakte(token);

  vk('users.get', {fields: 'uid, firsn_name, photo'}, async (err, profile) => {
    if(err || !profile) 
      return res.json(errors.unauthorized());

    const user = await User.findOne({'socials.vk': profile.id});
    
    if(!user) {
      let userObj = {
        email,
        socials: { vk:profile.id }
      };
      const VKUser = new User(userObj);
      await VKUser.save();

      const payload = email ? {email} : {vk:profile.uid};
      const token = jwt.sign(payload, config.auth.jwtSecret);
      res.json(token);
    } else {
      const payload = user.email ? {email} : {vk: user.socials.vk};
      const token = jwt.sign(payload, config.auth.jwtSecret);
      res.json(token);
    }
  });
});

router.post('/auth/fb', async (req, res, next) => {
  const token = req.body.token || null;
  
  if(!token) {
    return next(errors.unauthorized('Bad token'));
  }
  let profile;
  try {
    FB.setAccessToken(token);
    profile = await FB.api('me', {fields: 'id, name, email, picture, birthday'});    
  } catch(err) {
    return next(errors.unauthorized('Bad Request'));
  }

  if(!profile) {
    return next(errors.unauthorized('Bad token'));
  }
  const email = profile.email
  const user = await User.findOne({'socials.fb': profile.id});

  if(!user) {
    let userObj = {
      email,
      socials: { fb:profile.id }
    };
    const FBUser = new User(userObj);
    await FBUser.save();

    const payload = email ? {email} : {fb:profile.id};
    const jwtToken = jwt.sign(payload, config.auth.jwtSecret);
    
    res.json(jwtToken);
  } else {
    const payload = user.email ? {email} : {fb: user.socials.fb};
    const jwtToken = jwt.sign(payload, config.auth.jwtSecret);
    
    res.json(jwtToken);
  }
});

// router.delete('/tools/user', async (req, res, next) => {
//   let user = await User.remove({email:req.body.email});
//   res.json(user);
// });

// router.get('/tools/users', async (req, res, next) => {
//   let user = await User.find();
//   res.json(user);
// });

module.exports = router;
