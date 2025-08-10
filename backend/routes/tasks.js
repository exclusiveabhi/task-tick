const express = require('express');
const Task = require('../models/Task');
const Notification = require('../models/Notification'); // Ensure Notification model is imported
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

console.log('=== TASK ROUTES MODULE LOADED WITH ENHANCED DEBUGGING ===');

// Create a new task
router.post('/', verifyToken, async (req, res) => {
  console.log('=== TASK CREATION ROUTE HIT ===');
  try {
    let { title, description, deadline, priority } = req.body;
    
    console.log('DEBUG STEP 1: Raw req.body:', JSON.stringify(req.body));
    console.log('DEBUG STEP 2: deadline from body:', deadline, 'type:', typeof deadline, 'length:', deadline?.length);
    
    // Enforce deadline format: YYYY-MM-DDTHH:mm
    const deadlineRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    if (typeof deadline !== 'string' || !deadlineRegex.test(deadline)) {
      console.log('DEBUG STEP ERROR: Invalid deadline format:', deadline);
      return res.status(400).json({ error: 'Invalid deadline format. Must be YYYY-MM-DDTHH:mm' });
    }
    
    // Force deadline to remain as exact string (prevent any conversion)
    deadline = String(deadline);
    console.log('DEBUG STEP 3: deadline after String():', deadline, 'type:', typeof deadline, 'length:', deadline.length);
    
    const notification = await Notification.findOne({ userId: req.user.id });

    if (!notification) {
      return res.status(400).json({ error: 'Notification settings not found' });
    }

    console.log('DEBUG STEP 4: About to create Task object');
    const task = new Task({
      userId: req.user.id,
      title,
      description,
      deadline: deadline, // Ensure it's the exact string
      priority,
      notificationType: notification.notificationType,
      notificationEmail: notification.notificationEmail,
      notificationWhatsApp: notification.notificationWhatsApp,
      notificationTime: notification.notificationTime,
    });
    
    console.log('DEBUG STEP 5: Task object created, deadline in task:', task.deadline, 'type:', typeof task.deadline);
    
    await task.save();
    console.log('DEBUG STEP 6: Task saved successfully');
    
    // Log what was actually saved
    const savedTask = await Task.findById(task._id);
    console.log('DEBUG STEP 7: Task retrieved from DB, deadline:', savedTask.deadline, 'type:', typeof savedTask.deadline, 'length:', savedTask.deadline?.length);
    console.log('=== TASK CREATION COMPLETE ===');
    
    res.status(201).json(task);
  } catch (err) {
    console.error('=== TASK CREATION ERROR ===', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get all tasks for a user
router.get('/', verifyToken, async (req, res) => {
  try {
  const tasks = await Task.find({ userId: req.user.id });
  console.log('DEBUG: GET /api/tasks - tasks:', tasks.map(t => ({ deadline: t.deadline, type: typeof t.deadline })));
  res.status(200).json(tasks);
  } catch (err) {
    console.error('Failed to fetch tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

module.exports = router;