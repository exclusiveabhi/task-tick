const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { sendNotificationEmail } = require("./emailService");
const mongoose = require("mongoose");
function getTaskEmailTemplate(task, userEmail) {
  return {
    subject: `Task Reminder: ${task.title}`,
    text: `Hello,\n\nThis is a reminder for your task:\n\nTitle: ${
      task.title
    }\nDescription: ${task.description}\nDeadline: ${task.deadline.replace(
      "T",
      " "
    )}\nPriority: ${
      task.priority
    }\n\nPlease complete your task before the deadline.\n\n- Task Tick`,
  };
}
async function checkAndSendTaskNotifications() {
  const now = new Date();
  const tasks = await Task.find({});
  for (const task of tasks) {
    const notification = await Notification.findOne({ userId: task.userId });
    if (
      !notification ||
      notification.notificationType !== "email" ||
      !notification.notificationEmail
    )
      continue;
    if (!task.deadline) continue;
    const deadline = new Date(task.deadline);
    if (isNaN(deadline)) continue;
    const notifyTime = new Date(
      deadline.getTime() - notification.notificationTime * 60000
    );
    if (
      now >= notifyTime &&
      now < new Date(notifyTime.getTime() + 60000) &&
      !task.notified
    ) {
      const { subject, text } = getTaskEmailTemplate(
        task,
        notification.notificationEmail
      );
      sendNotificationEmail(notification.notificationEmail, subject, text);
      task.notified = true;
      await task.save();
    }
  }
}
function startTaskNotificationScheduler() {
  setInterval(checkAndSendTaskNotifications, 60000);
}

module.exports = { startTaskNotificationScheduler };
