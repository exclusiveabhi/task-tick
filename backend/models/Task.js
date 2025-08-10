const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { 
    type: mongoose.Schema.Types.Mixed,  // Changed from String to Mixed to prevent auto-conversion
    required: true,
    validate: {
      validator: function(v) {
        // Ensure deadline is always in YYYY-MM-DDTHH:mm format
        return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v);
      },
      message: 'Deadline must be in YYYY-MM-DDTHH:mm format string'
    }
  },
  priority: { type: String, required: true },
  notificationType: { type: String, required: true },
  notificationEmail: { type: String },
  notificationWhatsApp: { type: String },
  notificationTime: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  notified: { type: Boolean, default: false },
}, {
  // Disable automatic type casting
  typecast: false
});

// Pre-save hook to force deadline format
TaskSchema.pre('save', function(next) {
  console.log('DEBUG PRESAVE: Original deadline:', this.deadline, 'type:', typeof this.deadline);
  
  if (this.deadline) {
    let originalDeadline = this.deadline;
    
    // If it's already a correct string, keep it
    if (typeof this.deadline === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(this.deadline)) {
      console.log('DEBUG PRESAVE: Deadline already in correct format');
    }
    // If deadline is a Date object, convert to YYYY-MM-DDTHH:mm
    else if (this.deadline instanceof Date) {
      console.log('DEBUG PRESAVE: Converting Date object to local time string');
      const year = this.deadline.getFullYear();
      const month = String(this.deadline.getMonth() + 1).padStart(2, '0');
      const day = String(this.deadline.getDate()).padStart(2, '0');
      const hour = String(this.deadline.getHours()).padStart(2, '0');
      const minute = String(this.deadline.getMinutes()).padStart(2, '0');
      this.deadline = `${year}-${month}-${day}T${hour}:${minute}`;
    }
    // If deadline is any other string format, try to parse and convert
    else if (typeof this.deadline === 'string') {
      console.log('DEBUG PRESAVE: Converting string to YYYY-MM-DDTHH:mm format');
      try {
        const tempDate = new Date(this.deadline);
        if (!isNaN(tempDate.getTime())) {
          const year = tempDate.getFullYear();
          const month = String(tempDate.getMonth() + 1).padStart(2, '0');
          const day = String(tempDate.getDate()).padStart(2, '0');
          const hour = String(tempDate.getHours()).padStart(2, '0');
          const minute = String(tempDate.getMinutes()).padStart(2, '0');
          this.deadline = `${year}-${month}-${day}T${hour}:${minute}`;
        }
      } catch (e) {
        console.log('DEBUG PRESAVE: Could not parse deadline as date');
      }
    }
    
    // Ensure it's a string and correct format
    this.deadline = String(this.deadline);
    
    // Final validation
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(this.deadline)) {
      const error = new Error(`Invalid deadline format: ${this.deadline}. Must be YYYY-MM-DDTHH:mm`);
      console.log('DEBUG PRESAVE: Validation failed:', error.message);
      return next(error);
    }
  }
  
  console.log('DEBUG PRESAVE: Final deadline:', this.deadline, 'type:', typeof this.deadline);
  next();
});

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;