const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const notificationRoutes = require("./service/notifications");
const cron = require("node-cron");
const Task = require("./models/Task");
const nodemailer = require("nodemailer");
const { getTaskReminderEmail } = require("./templates/email_template");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (req.method === "POST" && req.url.includes("tasks")) {
  }
  next();
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
async function sendNotificationEmail(to, subject, htmlContent) {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log("DEBUG SMTP CONFIG:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.EMAIL_USER,
  });
  try {
    let info = await transporter.sendMail({
      from: '"Abhishek Rajpoot" <no-reply@taskmanagement.com>',
      to: to,
      subject: subject,
      html: htmlContent,
    });
    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("EMAIL SEND ERROR:", err);
  }
}

async function sendTaskReminderEmail(task) {
  let deadlineDisplay = task.deadline;
  if (
    typeof task.deadline === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(task.deadline)
  ) {
    const [datePart, timePart] = task.deadline.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    const deadlineDate = new Date(year, month - 1, day, hour, minute, 0, 0);
    deadlineDisplay = deadlineDate.toLocaleString();
  } else if (typeof task.deadline === "string") {
    const deadlineDate = new Date(task.deadline);
    if (!isNaN(deadlineDate.getTime())) {
      deadlineDisplay = deadlineDate.toLocaleString();
    }
  }

  const emailSubject = `Reminder for task: ${task.title}`;
  const emailBody = getTaskReminderEmail({
    title: task.title,
    description: task.description,
    deadlineDisplay,
  });
  await sendNotificationEmail(task.notificationEmail, emailSubject, emailBody);
}

cron.schedule("* * * * *", async () => {
  const now = new Date();
  try {
    const tasks = await Task.find({
      notificationType: "email",
      notified: { $ne: true },
    });

    for (const task of tasks) {
      let deadline = task.deadline;
      let deadlineDate = null;
      if (deadline instanceof Date) {
        const utcTime = deadline.toISOString();
        const timeMatch = utcTime.match(
          /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
        );
        if (timeMatch) {
          const [, year, month, day, hour, minute] = timeMatch.map(Number);
          deadlineDate = new Date(year, month - 1, day, hour, minute, 0, 0);
        } else {
          deadlineDate = deadline;
        }
      } else if (
        typeof deadline === "string" &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(deadline)
      ) {
        const [datePart, timePart] = deadline.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);
        deadlineDate = new Date(year, month - 1, day, hour, minute, 0, 0);
      } else if (
        typeof deadline === "string" &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(deadline)
      ) {
        deadlineDate = new Date(deadline);
      } else if (typeof deadline === "string") {
        deadlineDate = new Date(deadline);
      } else if (typeof deadline === "object" && deadline !== null) {
        try {
          deadlineDate = new Date(deadline);
        } catch (e) {}
      }

      if (!deadlineDate || isNaN(deadlineDate.getTime())) {
        continue;
      }
      const notifyTime = new Date(
        deadlineDate.getTime() - (task.notificationTime || 0) * 60000
      );
      const nowStr =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0") +
        "T" +
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0");
      const notifyStr =
        notifyTime.getFullYear() +
        "-" +
        String(notifyTime.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(notifyTime.getDate()).padStart(2, "0") +
        "T" +
        String(notifyTime.getHours()).padStart(2, "0") +
        ":" +
        String(notifyTime.getMinutes()).padStart(2, "0");

      if (nowStr === notifyStr && task.notificationEmail) {
        await sendTaskReminderEmail(task);
        task.notified = true;
        await task.save();
      }
    }
  } catch (err) {
    console.error("Error in cron job:", err);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
