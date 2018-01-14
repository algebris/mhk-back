const passport = require('passport'),
  config = require('../../config/config'),
  User = require('../../models/userModel'),
  passportJWT = require("passport-jwt"),
  LocalStrategy = require('passport-local').Strategy,
  JwtStrategy = require('passport-jwt').Strategy,
  VKontakteStrategy = require('passport-vkontakte').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;

const jwtOptions = {
  secretOrKey: config.auth.jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT')
};

const getPayload = user => ({
    email: user.email,
  });

const localStrategy = new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false
}, (email, password, done) => {
  User.findOne({email}, (err, user) => {
    if(err) return done(err);
    if(!user || !user.checkPassword(password)) return done(null, false, {message: 'User not found'});
    return done(null, getPayload(user));
  });
});

const jwtStrategy = new JwtStrategy(jwtOptions, (payload, done) => {
  User.findOne(payload.id, (err, user) => {
    if(err) return done(err);
    if(user) {
      done(null, getPayload(user));
    } else {
      done(null, false);
    }
  });
});

const vkStrategy = new VKontakteStrategy({
  clientID: 6331961,
  clientSecret: 'vVHhicQ3iiN8hSgki9ZS',
  callbackURL: 'http://mhk.onsib.ru/api/v1/auth/vkontakte/callback'
},
(accessToken, refreshToken, params, profile, done) => {
  User.findOrCreate({ vkontakteId: profile.id })
    .then(function (user) { done(null, user); })
    .catch(done);
});

passport.use(localStrategy);
passport.use(jwtStrategy);
passport.use(vkStrategy);

module.exports = {
  initialize: passport.initialize(),
  authenticate: passport.authenticate('jwt', { session: false }),
};
