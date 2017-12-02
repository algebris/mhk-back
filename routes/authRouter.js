const express = require('express'),
  config = require('../config/config'),
  auth = require('../utils/auth'),
  passport = require('passport'),
  jwt = require('jsonwebtoken'),
  router = express.Router();

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
    return user ? res.json({success: true}) : res.status(401).json({success:false, message:'Unauthorized'});
  })(req, res, next);
});

module.exports = router;
