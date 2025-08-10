// Script to delete all tasks with invalid deadline format
const mongoose = require('mongoose');
const Task = require('./models/Task');
require('dotenv').config();

async function cleanInvalidTasks() {
  await mongoose.connect(process.env.MONGODB_URI);
  const allTasks = await Task.find({});
  const deadlineRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  let deleted = 0;
  for (const task of allTasks) {
    if (typeof task.deadline !== 'string' || !deadlineRegex.test(task.deadline)) {
      await Task.deleteOne({ _id: task._id });
      console.log('Deleted task:', task.title, '| deadline:', task.deadline);
      deleted++;
    }
  }
  console.log('Done. Deleted', deleted, 'tasks with invalid deadline format.');
  process.exit(0);
}

cleanInvalidTasks();
