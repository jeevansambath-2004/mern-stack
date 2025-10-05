const express = require('express');
const { body, validationResult } = require('express-validator');
const Todo = require('../models/Todo');
const { auth } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// @route   GET /api/todos
// @desc    Get all todos for authenticated user with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      completed, 
      category, 
      priority, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {};
    if (completed !== undefined) filters.completed = completed === 'true';
    if (category) filters.category = category;
    if (priority) filters.priority = priority;
    if (search) filters.search = search;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const todos = await Todo.getTodosByUser(req.user._id, filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortOptions);

    const total = await Todo.countDocuments({ user: req.user._id, ...filters });

    res.json({
      todos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({
      error: 'Server error while fetching todos'
    });
  }
});

// @route   POST /api/todos
// @desc    Create a new todo
// @access  Private
router.post('/', auth, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      title,
      description,
      priority = 'medium',
      category = 'General',
      tags = [],
      dueDate,
      notes
    } = req.body;

    // Get the highest position for new todo
    const lastTodo = await Todo.findOne({ user: req.user._id })
      .sort({ position: -1 })
      .select('position');
    
    const position = lastTodo ? lastTodo.position + 1 : 0;

    const todo = new Todo({
      title,
      description,
      priority,
      category,
      tags: tags.filter(tag => tag.trim()),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
      user: req.user._id,
      position
    });

    await todo.save();

    res.status(201).json({
      message: 'Todo created successfully',
      todo
    });

  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({
      error: 'Server error while creating todo'
    });
  }
});

// @route   GET /api/todos/stats/overview
// @desc    Get todo statistics for the user
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const [
      totalTodos,
      completedTodos,
      pendingTodos,
      overdueTodos,
      highPriorityTodos,
      urgentTodos
    ] = await Promise.all([
      Todo.countDocuments({ user: req.user._id }),
      Todo.countDocuments({ user: req.user._id, completed: true }),
      Todo.countDocuments({ user: req.user._id, completed: false }),
      Todo.countDocuments({
        user: req.user._id,
        completed: false,
        dueDate: { $lt: new Date() }
      }),
      Todo.countDocuments({
        user: req.user._id,
        completed: false,
        priority: 'high'
      }),
      Todo.countDocuments({
        user: req.user._id,
        completed: false,
        priority: 'urgent'
      })
    ]);

    const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

    res.json({
      stats: {
        total: totalTodos,
        completed: completedTodos,
        pending: pendingTodos,
        overdue: overdueTodos,
        highPriority: highPriorityTodos,
        urgent: urgentTodos,
        completionRate: Math.round(completionRate * 100) / 100
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Server error while fetching statistics'
    });
  }
});

// @route   GET /api/todos/stats/breakdown
// @desc    Get per-user breakdown by priority and category
// @access  Private
router.get('/stats/breakdown', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const [byPriority, byCategory] = await Promise.all([
      Todo.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Todo.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    const priorityMap = { low: 0, medium: 0, high: 0, urgent: 0 };
    byPriority.forEach((p) => { if (p && p._id) priorityMap[p._id] = p.count; });

    const categoryMap = {};
    byCategory.forEach((c) => { categoryMap[c._id || 'General'] = c.count; });

    res.json({ breakdown: { priority: priorityMap, category: categoryMap } });
  } catch (error) {
    console.error('Get breakdown stats error:', error);
    res.status(500).json({ error: 'Server error while fetching breakdown stats' });
  }
});

// @route   GET /api/todos/stats/trend
// @desc    Get per-user completion trend over last N days
// @access  Private
router.get('/stats/trend', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const days = Math.min(parseInt(req.query.days || '14', 10), 90);
    const since = new Date();
    since.setDate(since.getDate() - days + 1);

    const data = await Todo.aggregate([
      { $match: { user: userId, completed: true, completedAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const result = [];
    for (let i = 0; i < days; i += 1) {
      const d = new Date(since.getFullYear(), since.getMonth(), since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const found = data.find((x) => x._id === key);
      result.push({ date: key, count: found ? found.count : 0 });
    }

    res.json({ trend: result });
  } catch (error) {
    console.error('Get trend stats error:', error);
    res.status(500).json({ error: 'Server error while fetching trend stats' });
  }
});

// @route   GET /api/todos/categories
// @desc    Get all categories for the user
// @access  Private
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Todo.distinct('category', { user: req.user._id });
    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/todos/:id
// @desc    Get a specific todo
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        error: 'Todo not found'
      });
    }

    res.json({ todo });

  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({
      error: 'Server error while fetching todo'
    });
  }
});

// @route   PUT /api/todos/:id
// @desc    Update a todo
// @access  Private
router.put('/:id', auth, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        error: 'Todo not found'
      });
    }

    const updateData = { ...req.body };
    if (updateData.tags) {
      updateData.tags = updateData.tags.filter(tag => tag.trim());
    }
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Todo updated successfully',
      todo: updatedTodo
    });

  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({
      error: 'Server error while updating todo'
    });
  }
});

// @route   PATCH /api/todos/:id/toggle
// @desc    Toggle todo completion status
// @access  Private
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        error: 'Todo not found'
      });
    }

    const wasCompleted = todo.completed;

    if (todo.completed) {
      await todo.markAsIncomplete();
    } else {
      await todo.markAsCompleted();
    }

    // Send email notification for both completion and incompletion
    if (!wasCompleted && todo.completed) {
      // Todo was just completed
      try {
        emailService.sendTodoCompletionNotification(
          req.user.email,
          todo.title,
          req.user.username
        ).catch(emailError => {
          console.error('Failed to send completion email:', emailError);
          // Don't fail the request if email fails
        });
      } catch (emailError) {
        console.error('Error initiating completion email send:', emailError);
        // Don't fail the request if email fails
      }
    } else if (wasCompleted && !todo.completed) {
      // Todo was just marked as incomplete
      try {
        emailService.sendTodoIncompleteNotification(
          req.user.email,
          todo.title,
          req.user.username
        ).catch(emailError => {
          console.error('Failed to send incomplete email:', emailError);
          // Don't fail the request if email fails
        });
      } catch (emailError) {
        console.error('Error initiating incomplete email send:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      message: `Todo ${todo.completed ? 'completed' : 'marked as incomplete'}`,
      todo
    });

  } catch (error) {
    console.error('Toggle todo error:', error);
    res.status(500).json({
      error: 'Server error while toggling todo'
    });
  }
});

// @route   DELETE /api/todos/:id
// @desc    Delete a todo
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        error: 'Todo not found'
      });
    }

    res.json({
      message: 'Todo deleted successfully'
    });

  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({
      error: 'Server error while deleting todo'
    });
  }
});

module.exports = router;