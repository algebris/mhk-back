const passport = require('passport'),
  requireAll = require('require-all'),
  config = require(`${APP_DIR}/config/config`),
  User = require(`${APP_DIR}/models/userModel`);

const strategies = requireAll({
  dirname: __dirname + '/strategies',
  filter: /(.+)Strategy\.js$/,
});

passport.serializeUser(function(user, done) {
  done(null, user.email);
});

passport.deserializeUser(function(email, done) {
  User.findOne({email})
    .then(function (user) { done(null, user); })
    .catch(done);
});

module.exports = { strategies };
