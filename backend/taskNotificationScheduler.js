const Task = require('./models/Task');
const Notification = require('./models/Notification');
const { sendNotificationEmail } = require('./emailService');
const mongoose = require('mongoose');

// Email template function
function getTaskEmailTemplate(task, userEmail) {
  return {
    subject: `Task Reminder: ${task.title}`,
    text: `Hello,\n\nThis is a reminder for your task:\n\nTitle: ${task.title}\nDescription: ${task.description}\nDeadline: ${task.deadline.replace('T', ' ')}\nPriority: ${task.priority}\n\nPlease complete your task before the deadline.\n\n- Task Tick`
  };
}

// Scheduler function
async function checkAndSendTaskNotifications() {
  const now = new Date();
  // Find all tasks that have not been notified and are due for notification
  // We'll assume a 'notified' flag on Task, or you can implement a better system
  const tasks = await Task.find({});
  for (const task of tasks) {
    // Find notification settings for this user
    const notification = await Notification.findOne({ userId: task.userId });
    if (!notification || notification.notificationType !== 'email' || !notification.notificationEmail) continue;
    // Parse deadline as local time string
    if (!task.deadline) continue;
    const deadline = new Date(task.deadline);
    if (isNaN(deadline)) continue;
    // Calculate notification time
    const notifyTime = new Date(deadline.getTime() - notification.notificationTime * 60000);
    // If current time is within 1 minute of notifyTime, send email
    if (
      now >= notifyTime &&
      now < new Date(notifyTime.getTime() + 60000) &&
      !task.notified
    ) {
      const { subject, text } = getTaskEmailTemplate(task, notification.notificationEmail);
      sendNotificationEmail(notification.notificationEmail, subject, text);
      // Mark as notified
      task.notified = true;
      await task.save();
      console.log(`Notification sent for task ${task.title} to ${notification.notificationEmail}`);
    }
  }
}

// Start scheduler (runs every minute)
function startTaskNotificationScheduler() {
  setInterval(checkAndSendTaskNotifications, 60000);
  console.log('Task notification scheduler started.');
}

module.exports = { startTaskNotificationScheduler };
