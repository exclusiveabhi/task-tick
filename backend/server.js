const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const notificationRoutes = require('./notifications');
const cron = require('node-cron');
const Task = require('./models/Task');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`=== REQUEST: ${req.method} ${req.url} ===`);
  if (req.method === 'POST' && req.url.includes('tasks')) {
    console.log('=== TASK POST REQUEST BODY:', JSON.stringify(req.body));
  }
  next();
});

const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

// Function to send notification email
async function sendNotificationEmail(to, subject, htmlContent) {
  // Create a transporter object using SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Debug: log SMTP config (do not log password in production)
  console.log('DEBUG SMTP CONFIG:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.EMAIL_USER
  });

  // Send mail with defined transport object
  try {
    let info = await transporter.sendMail({
      from: '"Abhishek Rajpoot" <no-reply@taskmanagement.com>', // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      html: htmlContent, // html body
    });
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    console.error('EMAIL SEND ERROR:', err);
  }
}

// Function to send task reminder email
async function sendTaskReminderEmail(task) {
  // Format deadline properly for email
  let deadlineDisplay = task.deadline;
  if (typeof task.deadline === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(task.deadline)) {
    // Parse as local time and format nicely
    const [datePart, timePart] = task.deadline.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const deadlineDate = new Date(year, month - 1, day, hour, minute, 0, 0);
    deadlineDisplay = deadlineDate.toLocaleString();
  } else if (typeof task.deadline === 'string') {
    const deadlineDate = new Date(task.deadline);
    if (!isNaN(deadlineDate.getTime())) {
      deadlineDisplay = deadlineDate.toLocaleString();
    }
  }

  const emailSubject = `Reminder for task: ${task.title}`;
  const emailBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear User,</p>
        <p>This is a reminder for your upcoming task:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Title:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${task.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Description:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${task.description}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Deadline:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${deadlineDisplay}</td>
          </tr>
        </table>
        <p>You received this email because you saved this email for notifications on the Task Tick</p>
        <p>Best regards,</p>
        <p>Team Task Tick</p>
      </body>
    </html>
  `;

  await sendNotificationEmail(task.notificationEmail, emailSubject, emailBody);
}

// Cron Job for Email Notifications
cron.schedule('* * * * *', async () => {
   const now = new Date(); // Current time
   try {
     // Fetch tasks with email notifications and not yet notified
     const tasks = await Task.find({
       notificationType: 'email',
       notified: { $ne: true },
     });
     console.log('DEBUG CRON: Found tasks for notification:', tasks.length);
     for (const task of tasks) {
       // Print the actual deadline value for debugging
       console.log('DEBUG CRON: Task', task.title, 'deadline value:', task.deadline, 'type:', typeof task.deadline, 'length:', task.deadline?.length);
       let deadline = task.deadline;
       let deadlineDate = null;
       
       // Debug: Print the exact deadline format
       console.log('DEBUG CRON: Raw deadline:', JSON.stringify(deadline), 'typeof:', typeof deadline);
       
       // Handle different deadline formats
       if (deadline instanceof Date) {
         // Case 1: Date object - this is tricky because it might be stored as UTC but meant as local
         // If the stored date shows a time that's 5.5 hours behind what user intended,
         // it means it was stored as UTC but should be interpreted as local
         // Extract the time components and treat them as local time
         const utcTime = deadline.toISOString(); // e.g., "2025-08-10T12:20:00.000Z"
         const timeMatch = utcTime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
         if (timeMatch) {
           const [, year, month, day, hour, minute] = timeMatch.map(Number);
           deadlineDate = new Date(year, month - 1, day, hour, minute, 0, 0);
           console.log('DEBUG CRON: Extracted local time from Date object:', deadlineDate.toLocaleString());
         } else {
           deadlineDate = deadline;
           console.log('DEBUG CRON: Using Date object directly (fallback):', deadlineDate.toLocaleString());
         }
       } else if (typeof deadline === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(deadline)) {
         // Case 2: Perfect format "YYYY-MM-DDTHH:mm" - parse as local time
         const [datePart, timePart] = deadline.split('T');
         const [year, month, day] = datePart.split('-').map(Number);
         const [hour, minute] = timePart.split(':').map(Number);
         deadlineDate = new Date(year, month - 1, day, hour, minute, 0, 0);
         console.log('DEBUG CRON: Parsed string as local time YYYY-MM-DDTHH:mm:', deadlineDate.toLocaleString());
       } else if (typeof deadline === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(deadline)) {
         // Case 3: UTC/ISO format like "YYYY-MM-DDTHH:mm:ss.sssZ" - parse as UTC then convert to local
         deadlineDate = new Date(deadline);
         console.log('DEBUG CRON: Parsed UTC/ISO string:', deadlineDate.toLocaleString());
       } else if (typeof deadline === 'string') {
         // Case 4: Any other string format - try to parse
         deadlineDate = new Date(deadline);
         console.log('DEBUG CRON: Parsed any string format:', deadlineDate.toLocaleString());
       } else if (typeof deadline === 'object' && deadline !== null) {
         // Case 5: Object that might be a Date-like object
         try {
           deadlineDate = new Date(deadline);
           console.log('DEBUG CRON: Converted object to Date:', deadlineDate.toLocaleString());
         } catch (e) {
           console.log('DEBUG CRON: Failed to convert object to Date:', e.message);
         }
       }
       
       if (!deadlineDate || isNaN(deadlineDate.getTime())) {
         console.log('DEBUG CRON: Skipping task due to invalid deadline date:', deadline);
         continue;
       }
       
       // Calculate notification time
       const notifyTime = new Date(deadlineDate.getTime() - (task.notificationTime || 0) * 60000);
       
       // Compare to now (rounded to minute)
       const nowStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + 'T' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
       const notifyStr = notifyTime.getFullYear() + '-' + String(notifyTime.getMonth() + 1).padStart(2, '0') + '-' + String(notifyTime.getDate()).padStart(2, '0') + 'T' + String(notifyTime.getHours()).padStart(2, '0') + ':' + String(notifyTime.getMinutes()).padStart(2, '0');
       
       console.log('DEBUG CRON: nowStr', nowStr, 'notifyStr', notifyStr, 'task:', task.title);
       
       if (nowStr === notifyStr && task.notificationEmail) {
         console.log('DEBUG CRON: Sending email for', task.title, 'to', task.notificationEmail);
         await sendTaskReminderEmail(task);
         task.notified = true;
         await task.save();
         console.log(`Email sent to ${task.notificationEmail} for task "${task.title}" at ${nowStr}`);
       }
     }
   } catch (err) {
     console.error('Error in cron job:', err);
   }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('=== SERVER STARTED WITH ENHANCED DEBUGGING ===');
});