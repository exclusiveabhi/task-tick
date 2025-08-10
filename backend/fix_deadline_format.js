// Script to fix deadline format for existing tasks
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Task = require('./models/Task');

dotenv.config();

async function fixDeadlineFormats() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const tasks = await Task.find({});
    console.log(`Found ${tasks.length} tasks to check`);

    let fixed = 0;
    for (const task of tasks) {
      console.log(`Task: ${task.title}, Current deadline:`, task.deadline, typeof task.deadline);
      
      let needsUpdate = false;
      let newDeadline = task.deadline;

      // If deadline is a Date object or ISO string, convert to local time YYYY-MM-DDTHH:mm
      if (task.deadline instanceof Date) {
        // Convert Date object to local time string
        const year = task.deadline.getFullYear();
        const month = String(task.deadline.getMonth() + 1).padStart(2, '0');
        const day = String(task.deadline.getDate()).padStart(2, '0');
        const hour = String(task.deadline.getHours()).padStart(2, '0');
        const minute = String(task.deadline.getMinutes()).padStart(2, '0');
        newDeadline = `${year}-${month}-${day}T${hour}:${minute}`;
        needsUpdate = true;
      } else if (typeof task.deadline === 'string' && task.deadline.includes('Z')) {
        // Convert ISO string to local time
        const tempDate = new Date(task.deadline);
        const year = tempDate.getFullYear();
        const month = String(tempDate.getMonth() + 1).padStart(2, '0');
        const day = String(tempDate.getDate()).padStart(2, '0');
        const hour = String(tempDate.getHours()).padStart(2, '0');
        const minute = String(tempDate.getMinutes()).padStart(2, '0');
        newDeadline = `${year}-${month}-${day}T${hour}:${minute}`;
        needsUpdate = true;
      } else if (typeof task.deadline === 'string' && task.deadline.includes('GMT')) {
        // Convert timezone string to local time YYYY-MM-DDTHH:mm
        const tempDate = new Date(task.deadline);
        const year = tempDate.getFullYear();
        const month = String(tempDate.getMonth() + 1).padStart(2, '0');
        const day = String(tempDate.getDate()).padStart(2, '0');
        const hour = String(tempDate.getHours()).padStart(2, '0');
        const minute = String(tempDate.getMinutes()).padStart(2, '0');
        newDeadline = `${year}-${month}-${day}T${hour}:${minute}`;
        needsUpdate = true;
      }

      if (needsUpdate) {
        console.log(`Updating task ${task.title}: ${task.deadline} -> ${newDeadline}`);
        await Task.updateOne({ _id: task._id }, { deadline: newDeadline });
        fixed++;
      }
    }

    console.log(`Fixed ${fixed} tasks with deadline format issues`);
    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixDeadlineFormats();
