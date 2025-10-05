const express = require('express');
const { auth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const User = require('../models/User');
const Todo = require('../models/Todo');

const router = express.Router();

// @route   GET /api/admin/users
// @desc    List all users (basic fields)
// @access  Admin
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ error: 'Server error while listing users' });
  }
});

// @route   PATCH /api/admin/users/:id/role
// @desc    Update a user's role
// @access  Admin
router.patch('/users/:id/role', auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (req.params.id === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ error: 'Admins cannot demote themselves' });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true, select: '-password' }
    );

    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Role updated', user: updated });
  } catch (error) {
    console.error('Admin update role error:', error);
    res.status(500).json({ error: 'Server error while updating role' });
  }
});

// @route   GET /api/admin/stats
// @desc    Overall app stats
// @access  Admin
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const [usersCount, todosCount, adminsCount] = await Promise.all([
      User.countDocuments({}),
      Todo.countDocuments({}),
      User.countDocuments({ role: 'admin' }),
    ]);
    res.json({ stats: { usersCount, adminsCount, todosCount } });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Server error while fetching stats' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Admin-wide analytics: per-user and per-priority completed/pending
// @access  Admin
router.get('/analytics', auth, requireAdmin, async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: { user: '$user', completed: '$completed', priority: '$priority' },
          count: { $sum: 1 },
        },
      },
    ];

    const grouped = await Todo.aggregate(pipeline);

    // Map users for names/emails
    const users = await User.find({}, 'username email').lean();
    const userMap = new Map(users.map(u => [String(u._id), u]));

    const perUserMap = new Map();
    const perPriorityMap = new Map();

    for (const g of grouped) {
      const userId = g._id.user ? String(g._id.user) : null;
      const completed = !!g._id.completed;
      const priority = g._id.priority || 'uncategorized';
      const count = g.count || 0;

      if (userId) {
        if (!perUserMap.has(userId)) {
          const u = userMap.get(userId) || {};
          perUserMap.set(userId, { userId, username: u.username || 'Unknown', email: u.email || '', completed: 0, pending: 0 });
        }
        const entry = perUserMap.get(userId);
        if (completed) entry.completed += count; else entry.pending += count;
      }

      if (!perPriorityMap.has(priority)) {
        perPriorityMap.set(priority, { priority, completed: 0, pending: 0 });
      }
      const pEntry = perPriorityMap.get(priority);
      if (completed) pEntry.completed += count; else pEntry.pending += count;
    }

    const perUser = Array.from(perUserMap.values())
      .map(e => ({ ...e, total: e.completed + e.pending }))
      .sort((a, b) => b.total - a.total);

    const priorityOrder = ['urgent', 'high', 'medium', 'low', 'uncategorized'];
    const perPriority = Array.from(perPriorityMap.values())
      .sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));

    res.json({ perUser, perPriority });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Server error while fetching analytics' });
  }
});

// @route   GET /api/admin/todos
// @desc    List todos across all users with filters and pagination
// @access  Admin
router.get('/todos', auth, requireAdmin, async (req, res) => {
  try {
    const {
      userId,
      completed,
      priority,
      category,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};
    if (userId) query.user = userId;
    if (completed !== undefined) query.completed = completed === 'true';
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [todos, total] = await Promise.all([
      Todo.find(query)
        .populate('user', 'username email role')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sortOptions),
      Todo.countDocuments(query),
    ]);

    res.json({
      todos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Admin list todos error:', error);
    res.status(500).json({ error: 'Server error while listing todos' });
  }
});

// @route   PATCH /api/admin/todos/:id/toggle
// @desc    Toggle a todo's completion (any user)
// @access  Admin
router.patch('/todos/:id/toggle', auth, requireAdmin, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    if (todo.completed) {
      await todo.markAsIncomplete();
    } else {
      await todo.markAsCompleted();
    }
    res.json({ message: 'Todo toggled', todo });
  } catch (error) {
    console.error('Admin toggle todo error:', error);
    res.status(500).json({ error: 'Server error while toggling todo' });
  }
});

// @route   DELETE /api/admin/todos/:id
// @desc    Delete a todo (any user)
// @access  Admin
router.delete('/todos/:id', auth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Todo.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Todo not found' });
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    console.error('Admin delete todo error:', error);
    res.status(500).json({ error: 'Server error while deleting todo' });
  }
});

module.exports = router;
