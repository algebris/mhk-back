const express = require('express'),
  config = require('../config/config'),
  auth = require('../services/auth'),
  passport = require('passport'),
  errors = require('../services/errors'),
  validator = require('validator'),
  User = require('../models/userModel'),
  Practice = require('../models/practiceModel')

router.post('/meditation', (req, res, next) => {
  passport.authenticate('jwt', async (err, user) => {
    if(!user) {
      return next(errors.forbidden());
    }

    if(!req.body.time && validator.isInt(req.body.time)) {
      return next(errors.badRequest('Bad time value'));
    }

    user = await User.findOne({email: user.email});
    if(!user) {
      return next(errors.badRequest('User unknown'));
    }

    let practice = new Practice({user: user._id, practice: 'meditation', time: req.body.time});
    practice.save()
      .then(r => {
        res.json({success: true});
      })
      .catch(err => next(err));
  })(req, res, next);
});

router.get('/meditation', (req, res, next) => {
  passport.authenticate('jwt', async (err, user) => {
    if(!user) {
      return next(errors.forbidden());
    }
    let condition = {};
    
    if(req.query.limit && validator.isInt(req.query.limit)) {
      condition.limit = parseInt(req.query.limit, 10) || 0;
    }
    
    if(req.query.offset && validator.isInt(req.query.offset)) {
      condition.offset = parseInt(req.query.offset, 10) || 0;
    }

    user = await User.find({email: user.email});

    if(!user) {
      return next(errors.badRequest('User unknown'));
    }

    let practice = await Practice.find({}, {_id: 0, time:1, created:1})
      .limit(condition.limit)
      .skip(condition.offset)
      .catch(err => next(err));
      
      res.json(practice);

  })(req, res, next);
});

module.exports = router;