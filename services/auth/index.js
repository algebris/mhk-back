const passport = require('passport'),
  requireAll = require('require-all'),
  config = require(`${APP_DIR}/config/config`),
  errors = require(`${APP_DIR}/services/errors`),
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

const jwt = (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user, info, status) => {
    if(!user && info instanceof Error)
      next(info);
    else
      next(null, user);
  })(req, res, next);
};

module.exports = { strategies, jwt };
