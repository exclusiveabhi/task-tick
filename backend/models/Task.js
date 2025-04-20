const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  priority: { type: String, required: true },
  notificationType: { type: String, required: true },
  notificationEmail: { type: String },
  notificationWhatsApp: { type: String },
  notificationTime: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;