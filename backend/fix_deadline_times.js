// Script to fix deadline times to match UI display
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Task = require('./models/Task');

dotenv.config();

async function fixDeadlineTimes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fix specific tasks to match UI times
    const corrections = [
      { title: 'nxcnsjnc', correctTime: '11:15' },
      { title: 'dasdasd', correctTime: '11:17' },
      { title: 'hnbnbn', correctTime: '11:20' },
      { title: 'with new time in the ui', correctTime: '11:30' },
      { title: 'with new time in the ui 2', correctTime: '11:32' },
      { title: 'with new time in the ui 3', correctTime: '11:35' }
    ];

    for (const correction of corrections) {
      const task = await Task.findOne({ title: correction.title });
      if (task) {
        const newDeadline = `2025-08-10T${correction.correctTime}`;
        console.log(`Updating ${task.title}: ${task.deadline} -> ${newDeadline}`);
        await Task.updateOne({ _id: task._id }, { deadline: newDeadline });
      }
    }

    console.log('Fixed all deadline times to match UI');
    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixDeadlineTimes();
