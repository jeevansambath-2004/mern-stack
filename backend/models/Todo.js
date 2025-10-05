const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Todo title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true
  }],
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  position: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
todoSchema.index({ user: 1, completed: 1, dueDate: 1 });
todoSchema.index({ user: 1, category: 1 });
todoSchema.index({ user: 1, priority: 1 });

// Virtual for overdue status
todoSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.completed) return false;
  return new Date() > this.dueDate;
});

// Method to mark as completed
todoSchema.methods.markAsCompleted = function() {
  this.completed = true;
  this.completedAt = new Date();
  return this.save();
};

// Method to mark as incomplete
todoSchema.methods.markAsIncomplete = function() {
  this.completed = false;
  this.completedAt = undefined;
  return this.save();
};

// Static method to get todos by user with filters
todoSchema.statics.getTodosByUser = function(userId, filters = {}) {
  const query = { user: userId };
  
  if (filters.completed !== undefined) {
    query.completed = filters.completed;
  }
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { tags: { $in: [new RegExp(filters.search, 'i')] } }
    ];
  }
  
  return this.find(query).sort({ position: 1, createdAt: -1 });
};

// Ensure virtual fields are serialized
todoSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Todo', todoSchema);