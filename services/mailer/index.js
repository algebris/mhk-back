const 
  config = require('../../config/config'),
  User = require('../../models/userModel'),
  sender = require('./sender');

const signUp = async (email) => {
  const found = await User.findOne({email});
  if(found)
    return Promise.reject('User exists');
  
  const userModel = new User({email, signupKey: true});
  const user = await userModel.save();

  if(user)
    return sender.signupLetter(user.email, user.signupHash);
};

const checkSignup = async signupKey => {
  const user = await User.findOne({signupHash: signupKey});

  if(user) {
    const res = await user.update({$unset: {signupHash: true}});
    return res ? user : null;
  }
  else
    return null;
};

const resendConfirmation = async user => {
  if(!user) return false;

  const now = new Date();
  let diffMinutes = Math.floor((now - user.createdAt) / 60000);
  
  if(diffMinutes < 5) {
    return new Error('Too fast signup calls');
  }
  
  return sender.signupLetter(user.email, user.signupHash);
};

module.exports = {signUp, resendConfirmation, checkSignup};