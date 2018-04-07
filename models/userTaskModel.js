const mongoose = require('mongoose');

const UserTaskSchema = new mongoose.Schema({
  task: {type: mongoose.Schema.Types.ObjectId, ref: 'Task'},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  completedAt: Date,
  pickedAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('UserTask', UserTaskSchema);
