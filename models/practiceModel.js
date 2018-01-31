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
  value: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not integer'
    }
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Practice', PracticeSchema);
