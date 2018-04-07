const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  expiredAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);
