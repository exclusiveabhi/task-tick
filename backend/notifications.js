const express = require('express');
const Notification = require('./models/Notification');
const { verifyToken } = require('./middleware/authMiddleware');

const router = express.Router();

// Save or update notification settings
router.post('/', verifyToken, async (req, res) => {
  try {
    const { notificationType, notificationEmail, notificationWhatsApp, notificationTime } = req.body;
    let notification = await Notification.findOne({ userId: req.user.id });
    if (notification) {
      notification.notificationType = notificationType;
      notification.notificationEmail = notificationEmail;
      notification.notificationWhatsApp = notificationWhatsApp;
      notification.notificationTime = notificationTime;
    } else {
      notification = new Notification({
        userId: req.user.id,
        notificationType,
        notificationEmail,
        notificationWhatsApp,
        notificationTime,
      });
    }
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error('Failed to save notification settings:', err);
    res.status(500).json({ error: 'Failed to save notification settings' });
  }
});

// Get notification settings for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({ userId: req.user.id });
    if (!notification) {
      return res.status(404).json({ error: 'Notification settings not found' });
    }
    res.status(200).json(notification);
  } catch (err) {
    console.error('Failed to fetch notification settings:', err);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

module.exports = router;