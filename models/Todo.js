const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    }, // Optional: Add a description field
    completed: { 
      type: Boolean, 
      default: false 
    },
    isImportant: { 
      type: Boolean, 
      default: false 
    }, // Indicates if the task is important
  },
  { 
    timestamps: true // Automatically adds createdAt and updatedAt 
  }
);

module.exports = mongoose.model('Todo', todoSchema);
