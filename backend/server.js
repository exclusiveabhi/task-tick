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

const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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

  // Send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Abhishek Rajpoot" <no-reply@taskmanagement.com>', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: htmlContent, // html body
  });

  console.log('Message sent: %s', info.messageId);
}

// Function to send task reminder email
async function sendTaskReminderEmail(task) {
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
            <td style="padding: 8px; border: 1px solid #ddd;">${task.deadline.toLocaleString()}</td>
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
    // Fetch tasks with email notifications and deadlines in the future
    const tasks = await Task.find({
      notificationType: 'email',
      deadline: { $gt: now }, // Deadlines that are still in the future
    });

    for (const task of tasks) {
      // Calculate the exact notification time
      const notificationTimeInMs = task.notificationTime * 60000; // Convert minutes to milliseconds
      const notificationTime = new Date(task.deadline.getTime() - notificationTimeInMs);

      // Check if the current time matches the notification time
      if (
        now.toISOString().slice(0, 16) === notificationTime.toISOString().slice(0, 16) // Match to the nearest minute
      ) {
        if (task.notificationEmail) {
          // Send the notification email
          await sendTaskReminderEmail(task);
          console.log(`Email sent to ${task.notificationEmail} for task "${task.title}"`);
        }
      }
    }
  } catch (err) {
    console.error('Error in cron job:', err);
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});