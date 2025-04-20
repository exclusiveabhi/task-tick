const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notificationType: { type: String, required: true },
  notificationEmail: { type: String },
  notificationWhatsApp: { type: String },
  notificationTime: { type: Number, required: true },
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;