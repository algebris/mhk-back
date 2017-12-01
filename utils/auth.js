const passport = require('passport'),
  config = require('../config/config'),
  User = require('../models/userModel'),
  passportJWT = require("passport-jwt"),
  LocalStrategy = require('passport-local'),
  JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;

const jwtOptions = {
  secretOrKey: config.auth.jwtSecret,
  jwtFromRequest: ExtractJwt.fromHeader()
};

module.exports = () => {
  const jwtStrategy = new JwtStrategy(jwtOptions, (payload, done) => {
    let user = User.findOne(payload.id, (err, user) => {
      if(err) return done(err);

      if(user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  
    // if(user) {
    //   return done(null, {
    //     id: user.id
    //   });
    // } else {
    //   return done(new Error('User not found'), null);
    // }
  });

  const localStrategy = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false
  }, (email, password, done) => {
    User.findOne({email}, (err, user) => {
      if(err) return done(err);
      if(!user || user.checkPassword(password)) return done(null, false, {message:'User not found'});
      return done(null, user);
    })
  });

  passport.use(jwtStrategy);
  passport.use(localStrategy);

  return {
    initialize: () => passport.initialize(),
    authenticate: () => passport.authenticate('jwt', { session: false })
  }
};