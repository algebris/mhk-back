const mongoose = require('mongoose'),
  Float = require('mongoose-float').loadType(mongoose),
  validator = require('validator');

const ProfileSchema = new mongoose.Schema({
  name: { type: String },
  surname: { type: String },
  occupation: { type: String },
  location: {
    coords: {
      lat: { type: Float },
      lng: { type: Float }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', ProfileSchema);
