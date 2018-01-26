const mongoose = require('mongoose'),
  validator = require('validator');

const PracticeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  practice: {
    type: String,
    required: true,
    enum: ['kirtan', 'meditation']
  },
  time: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not integer'
    }
  },
  created: {
    type: Date,
    required: true,
    default: Date.now 
  }
});

module.exports = mongoose.model('Practice', PracticeSchema);
