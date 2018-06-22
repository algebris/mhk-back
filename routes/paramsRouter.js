const _ = require('lodash'),
  express = require('express'),
  passport = require('passport'),
  User = require('../models/userModel'),
  errors = require('../services/errors'),
  router = express.Router();

router.get('/', passport.authenticate('jwt'), async (req, res) => {
  const user = await User.findOne({email:req.user.email}, {params:1});
  if(!user || !user.params)
    return res.json({});
  res.json(user.params);
});

router.post('/', passport.authenticate('jwt'), async (req, res, next) => {
  const user = await User.findOne({email:req.user.email}, {params:1});
  if(!user) {
    return next(
      errors.resourceNotFoundError('User record not found')
    );
  }
  const output = _.assign(user.params, req.body);
  await User.update({email:req.user.email}, {params: output}, {upsert: true});
  res.json(output);
});

router.delete('/', passport.authenticate('jwt'), async (req, res, next) => {
  const user = await User.findOne({email:req.user.email}, {params:1});
  // check if user exists
  if(!user) {
    return next(
      errors.resourceNotFoundError('User record not found')
    );
  }
  // flush all fields if ?all=true
  if(req.query.all) {
    await User.update({_id:user._id}, {params: {}});
    return res.json({});
  }
  // delete keys by incoming object properties
  if(req.body && _.isObject(req.body)) {
    let params = {};
    const keysList = _.keys(req.body);
    if(_.isObject(user.params)) {
      params = _.omit(user.params, keysList);
    }
    await User.update({_id:user._id}, {params});
    res.json(params);
  } else {
    next(errors.badRequest());
  }
});

module.exports = router;