const mongoose = require('mongoose'),
  validator = require('validator'),
  crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  regHash: String,
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: false,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email',
      isAsync: false
    }
  },
  passwordHash: String,
  salt: String,
  signupHash: String,
  passwordRestoreHash: String,
  socials: {type: mongoose.Schema.Types.Mixed, default: {}},
  practice: [{type: mongoose.Schema.Types.ObjectId, ref: 'Practice'}]
}, {
  timestamps: true
});

UserSchema.virtual('id')
  .get(function () {
    return this._id;
  });

UserSchema.virtual('password')
  .set(function (password) {
    this._plainPassword = password;
    if (password) {
      this.salt = crypto.randomBytes(128).toString('base64');
      this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1');
    } else {
      this.salt = undefined;
      this.passwordHash = undefined;
    }
  })
  .get(function () {
    return this._plainPassword;
  });

UserSchema.methods.checkPassword = function (password) {
  if (!password) return false;
  if (!this.passwordHash) return false;
  return crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1') == this.passwordHash;
};

UserSchema.virtual('signupKey')
  .set(function(value) {
    if(value)
      this.signupHash = crypto.randomBytes(64).toString('hex');
    else
      this.signupHash = undefined;
  })
  .get(function() {
    return this.signupHash;
  });

module.exports = mongoose.model('User', UserSchema);
