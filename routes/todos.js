// routes/todos.js

const express = require('express');
const Todo = require('../models/Todo');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// --------------------
// CREATE Todo
// --------------------
/**
 * @route   POST /api/todos
 * @desc    Create a new todo
 * @access  Private
 */
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, isImportant } = req.body;

  // Basic Validation
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'Title is required and must be a string.' });
  }

  try {
    const newTodo = new Todo({
      userId: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : undefined,
      isImportant: isImportant || false,
    });

    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// --------------------
// READ All Todos
// --------------------
/**
 * @route   GET /api/todos
 * @desc    Get all todos for the authenticated user
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit; // Calculate how many items to skip
  const totalTodos = await Todo.countDocuments({ userId: req.user.id }); // Count total todos for the user

  try {
    const todos = await Todo.find({ userId: req.user.id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by created date, descending

    res.status(200).json({
      total: totalTodos,
      page: parseInt(page),
      limit: parseInt(limit),
      todos,
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});


// --------------------
// READ Single Todo
// --------------------
/**
 * @route   GET /api/todos/:id
 * @desc    Get a single todo by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const todoId = req.params.id;

  try {
    const todo = await Todo.findOne({ _id: todoId, userId: req.user.id });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    // Check if the error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Todo ID.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
});

// --------------------
// UPDATE Todo
// --------------------
/**
 * @route   PUT /api/todos/:id
 * @desc    Update a todo by ID
 * @access  Private
 */
router.put('/:id', authMiddleware, async (req, res) => {
  const todoId = req.params.id;
  const { title, description, isImportant, completed } = req.body;

  // Build the update object dynamically
  const updateFields = {};
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Title must be a non-empty string.' });
    }
    updateFields.title = title.trim();
  }
  if (description !== undefined) {
    if (typeof description !== 'string') {
      return res.status(400).json({ message: 'Description must be a string.' });
    }
    updateFields.description = description.trim();
  }
  if (isImportant !== undefined) {
    if (typeof isImportant !== 'boolean') {
      return res.status(400).json({ message: 'isImportant must be a boolean.' });
    }
    updateFields.isImportant = isImportant;
  }
  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Completed must be a boolean.' });
    }
    updateFields.completed = completed;
  }

  // Ensure at least one field is being updated
  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: 'At least one field must be updated.' });
  }

  try {
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: todoId, userId: req.user.id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    // Check if the error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Todo ID.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
});

// --------------------
// DELETE Todo
// --------------------
/**
 * @route   DELETE /api/todos/:id
 * @desc    Delete a todo by ID
 * @access  Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const todoId = req.params.id;

  try {
    const deletedTodo = await Todo.findOneAndDelete({ _id: todoId, userId: req.user.id });

    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    res.status(200).json({ message: 'Todo successfully deleted.', todo: deletedTodo }); // Send success message
  } catch (error) {
    console.error('Error deleting todo:', error);
    
    // Check if the error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Todo ID.' });
    }
    
    res.status(500).json({ message: 'Server error.' });
  }
});



module.exports = router;
