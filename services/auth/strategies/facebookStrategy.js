const passport = require('passport'),
  conf = require(`${APP_DIR}/config/config`),
  User = require(`${APP_DIR}/models/userModel`),
  common = require('../common'),
  FacebookStrategy = require('passport-facebook').Strategy;

const fbStrategy = new FacebookStrategy({
  clientID: conf.auth.fb.id,
  clientSecret: conf.auth.fb.secret,
  callbackURL: 'http://mhk.onsib.ru/api/v1/auth/facebook'
},
function(accessToken, refreshToken, profile, done) {
  done(null, user);
});

module.exports = fbStrategy;