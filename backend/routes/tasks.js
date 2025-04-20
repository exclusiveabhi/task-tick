const express = require('express');
const Task = require('../models/Task');
const Notification = require('../models/Notification'); // Ensure Notification model is imported
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new task
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, deadline, priority } = req.body;
    const notification = await Notification.findOne({ userId: req.user.id });

    if (!notification) {
      return res.status(400).json({ error: 'Notification settings not found' });
    }

    const task = new Task({
      userId: req.user.id,
      title,
      description,
      deadline,
      priority,
      notificationType: notification.notificationType,
      notificationEmail: notification.notificationEmail,
      notificationWhatsApp: notification.notificationWhatsApp,
      notificationTime: notification.notificationTime,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error('Failed to create task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get all tasks for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.status(200).json(tasks);
  } catch (err) {
    console.error('Failed to fetch tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

module.exports = router;