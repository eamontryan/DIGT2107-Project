const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priority: { type: String, required: true },
  dueDate: { type: String, required: true },
  dueTime: { type: String },
  synced: { type: Boolean, default: false },
});

module.exports = mongoose.model('Task', taskSchema);s