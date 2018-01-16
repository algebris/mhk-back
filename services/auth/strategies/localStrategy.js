const passport = require('passport'),
  config = require(`${APP_DIR}/config/config`),
  User = require(`${APP_DIR}/models/userModel`),
  common = require('../common'),
  LocalStrategy = require('passport-local').Strategy;

const localStrategy = new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false
}, (email, password, done) => {
  User.findOne({email}, (err, user) => {
    if(err) return done(err);
    if(!user || !user.checkPassword(password)) return done(null, false, {message: 'User not found'});
    return done(null, common.getPayload(user));
  });
});

module.exports = localStrategy;