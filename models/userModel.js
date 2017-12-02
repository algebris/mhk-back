const mongoose = require('mongoose'),
  crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  displayName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: String,
  salt: String,
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

module.exports = mongoose.model('User', UserSchema);
