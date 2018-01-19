const express = require('express'),
  config = require('../config/config'),
  auth = require('../services/auth'),
  passport = require('passport'),
  errors = require('../services/errors'),
  jwt = require('jsonwebtoken');

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
    if(req.query.refresh) {
      const token = jwt.sign({email:user.email}, config.auth.jwtSecret);
      return res.json(token);
    }
    return user ? 
      res.json({success: true}) : 
      next(errors.unauthorized());
  })(req, res, next);
});

module.exports = router;
