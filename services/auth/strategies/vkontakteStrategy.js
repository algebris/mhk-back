const passport = require('passport'),
  config = require('../../../config/config'),
  User = require('../../../models/userModel'),
  common = require('../common'),
  VKontakteStrategy = require('passport-vkontakte').Strategy;

const vkStrategy = new VKontakteStrategy({
  clientID: config.auth.vk.id,
  scope: ['email'],
  profileFields: ['email', 'city'],
  clientSecret: config.auth.vk.secret,
  callbackURL: 'http://mhk.onsib.ru/api/v1/auth/vkontakte/callback'
},
async (accessToken, refreshToken, params, profile, done) => {
    let user = await User.findOne({'socials.vk': profile.id});

    if(!user && params.email) {
      const VKUser = new User({email: params.email, 'socials': {vk:profile.id}});
      VKUser.save();
      console.log(VKUser);
    }
    done(null, user);
  }
);

module.exports = vkStrategy;