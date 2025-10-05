import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, CheckCircle2, Undo2 } from 'lucide-react';
import apiService from '../../services/api';

const StatusBadge = ({ completed }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${completed ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
    {completed ? 'Completed' : 'Pending'}
  </span>
);

const AdminTasks = () => {
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, itemsPerPage: 20, totalItems: 0 });
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', userId: '', completed: '', priority: '', category: '' });

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.itemsPerPage || 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      if (filters.search) params.search = filters.search;
      if (filters.userId) params.userId = filters.userId;
      if (filters.completed !== '') params.completed = filters.completed === 'true';
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;

      const { todos, pagination: p } = await apiService.getAdminTodos(params);
      setTodos(todos);
      setPagination(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load users for filter
    const getUsers = async () => {
      try {
        const { users } = await apiService.getAllUsers();
        setUsers(users);
      } catch {}
    };
    getUsers();
  }, []);

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleToggle = async (id) => {
    await apiService.adminToggleTodo(id);
    await load(pagination.currentPage);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await apiService.adminDeleteTodo(id);
    await load(pagination.currentPage);
  };

  const categories = useMemo(() => {
    const set = new Set();
    todos.forEach(t => t.category && set.add(t.category));
    return Array.from(set);
  }, [todos]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Manage Tasks</h2>

      <div className="card mb-4">
        <div className="card-content grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search title, description, tags"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <select className="input" value={filters.userId} onChange={(e) => setFilters(p => ({ ...p, userId: e.target.value }))}>
            <option value="">All Users</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.username} ({u.email})</option>
            ))}
          </select>
          <select className="input" value={filters.completed} onChange={(e) => setFilters(p => ({ ...p, completed: e.target.value }))}>
            <option value="">All Status</option>
            <option value="true">Completed</option>
            <option value="false">Pending</option>
          </select>
          <select className="input" value={filters.priority} onChange={(e) => setFilters(p => ({ ...p, priority: e.target.value }))}>
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select className="input" value={filters.category} onChange={(e) => setFilters(p => ({ ...p, category: e.target.value }))}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-content overflow-auto">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Priority</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Due</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {todos.map(t => (
                  <tr key={t._id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-2 pr-4">
                      <div className="font-medium text-gray-900 dark:text-white">{t.title}</div>
                      {t.description && (
                        <div className="text-gray-500 dark:text-gray-400 truncate max-w-md">{t.description}</div>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{t.user?.username}</td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300 capitalize">{t.priority}</td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{t.category}</td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{t.dueDate ? new Date(t.dueDate).toLocaleString() : '-'}</td>
                    <td className="py-2 pr-4"><StatusBadge completed={t.completed} /></td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleToggle(t._id)}
                          title={t.completed ? 'Mark as Pending' : 'Mark as Completed'}
                        >
                          {t.completed ? <Undo2 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(t._id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                {todos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500 dark:text-gray-400">No tasks found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="card-footer flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalItems} items
          </div>
          <div className="flex gap-2">
            <button disabled={pagination.currentPage <= 1} className="btn btn-secondary btn-sm disabled:opacity-50" onClick={() => load(pagination.currentPage - 1)}>Prev</button>
            <button disabled={pagination.currentPage >= pagination.totalPages} className="btn btn-secondary btn-sm disabled:opacity-50" onClick={() => load(pagination.currentPage + 1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTasks;
