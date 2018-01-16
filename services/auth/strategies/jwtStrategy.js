const passport = require('passport'),
  config = require('../../../config/config'),
  User = require('../../../models/userModel'),
  common = require('../common'),
  JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;

const jwtOptions = {
  secretOrKey: config.auth.jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT')
};

const jwtStrategy = new JwtStrategy(jwtOptions, (payload, done) => {
  User.findOne(payload.id, (err, user) => {
    if(err) return done(err);
    if(user) {
      done(null, common.getPayload(user));
    } else {
      done(null, false);
    }
  });
});

module.exports = jwtStrategy;