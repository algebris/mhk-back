const express = require('express'),
  config = require('../config/config'),
  _ = require('lodash'),
  auth = require('../services/auth'),
  passport = require('passport'),
  errors = require('../services/errors'),
  validator = require('validator'),
  User = require('../models/userModel'),
  moment = require('moment'),
  Practice = require('../models/practiceModel'),

TIMER_MODEL = {
  value: time => _.toInteger(time), 
  startedAt: date => validator.toDate(date)
},

// Check that item
// - Should have similar properties to _model
// - Pass transformers & validators from _model
transformTimerRecord = (item, _model) => {
  if(_.isEmpty(_model)) return;
  const fields = _.keys(_model);

  if(!fields.every(k => k in item)) return;
  
  return _.chain(item)
    .pick(fields)
    .mapValues((val, key) => _model[key](val))
    .value();
},

// Process array of items, pass them through "transformTimerRecord"
// Silently remove all null results from set.
filterTimerData = data => _.transform(data, (acc, item) => {
  const result = transformTimerRecord(item, TIMER_MODEL);
  if(result && _.every(result, val => !!val)) acc.push(result);
}, []),

// For every record check it's time intersections to existing DB records
checkTimeBounds = (data, bounds) => _.transform(data, (acc, item) => {
  const now = (new Date()).toISOString();
  const matched = moment(item.startedAt).isBetween(bounds.createdAt, now);
  if(matched) acc.push(item);
  //TODO: check overlapping with other time fractions
  // Practice.find({startedAt: {
  //   $gte: ISODate(bounds.createdAt),
  //   $lt: ISODate(now),
  // }});
}, []);


router.post('/meditation', (req, res, next) => {
  passport.authenticate('jwt', async (err, user) => {
    let data = [];
    if(!user) {
      return next(errors.forbidden());
    }
    if(!_.isArray(req.body)) {
      if(_.keys(TIMER_MODEL).every(k => k in req.body)) {
        data = [req.body];
      } else {
        return next(errors.badRequest('Bad data'));
      }
    } else
      data = req.body

    data = filterTimerData(data);

    user = await User.findOne({email: user.email});
    if(!user) {
      return next(errors.badRequest('User unknown'));
    }

    data = checkTimeBounds(data, user);

    const extendObj = {user: user._id, practice: 'meditation'};
    data = _.map(data, item => _.assignIn(item, extendObj));
    
    await Practice.insertMany(data);

    res.json(_.chain(data).map(obj => _.pick(obj, ['value', 'startedAt'])));

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

    user = await User.findOne({email: user.email});

    if(!user) {
      return next(errors.badRequest('User unknown'));
    }

    let practice = await Practice.find({user: user._id, practice: 'meditation'}, {_id: 0, value:1, startedAt:1})
      .limit(condition.limit)
      .skip(condition.offset)
      .catch(err => next(err));
      
      res.json(practice);

  })(req, res, next);
});

router.post('/kirtan', (req, res, next) => {
  passport.authenticate('jwt', async (err, user) => {
    let data = [];
    if(!user) {
      return next(errors.forbidden());
    }
    if(!_.isArray(req.body)) {
      if(_.keys(TIMER_MODEL).every(k => k in req.body)) {
        data = [req.body];
      } else {
        return next(errors.badRequest('Bad data'));
      }
    } else
      data = req.body

    data = filterTimerData(data);

    user = await User.findOne({email: user.email});
    if(!user) {
      return next(errors.badRequest('User unknown'));
    }

    data = checkTimeBounds(data, user);

    const extendObj = {user: user._id, practice: 'kirtan'};
    data = _.map(data, item => _.assignIn(item, extendObj));
    
    await Practice.insertMany(data);

    res.json(_.chain(data).map(obj => _.pick(obj, ['value', 'startedAt'])));

  })(req, res, next);
});

router.get('/kirtan', (req, res, next) => {
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

    user = await User.findOne({email: user.email});

    if(!user) {
      return next(errors.badRequest('User unknown'));
    }

    let practice = await Practice.find({user: user._id, practice: 'kirtan'}, {_id: 0, value:1, startedAt:1})
      .limit(condition.limit)
      .skip(condition.offset)
      .catch(err => next(err));
      
      res.json(practice);

  })(req, res, next);
});


module.exports = router;