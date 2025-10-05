import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, X, LogOut, Bell, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTodo } from '../../contexts/TodoContext';
import TodoList from './TodoList';
import TodoForm from './TodoForm';
import StatsCard from './StatsCard';
import AnalyticsPanel from './AnalyticsPanel';
import FilterPanel from './FilterPanel';
import Sidebar from './Sidebar';
// LoadingSpinner not used here

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { 
    todos, 
    stats, 
    setFilters, 
    loading: todoLoading,
    notifications,
    overdueCount,
    dueTodayCount,
  } = useTodo();
  
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Removed TaskDetails panel; no need to track selectedTodo
  const searchRef = useRef(null);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (searchTerm) {
      setFilters({ search: searchTerm });
    } else {
      setFilters({ search: undefined });
    }
    // `setFilters` from context is not stable; including it here creates a render loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleLogout = () => {
    logout();
  };

  // Keyboard shortcuts: '/' to focus search
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowFilters(false);
        setShowNotifs(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) {
      document.addEventListener('mousedown', onClick);
      return () => document.removeEventListener('mousedown', onClick);
    }
  }, [showNotifs]);

  const filteredTodos = todos.filter(todo => {
    if (searchTerm) {
      return todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             todo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             todo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return true;
  });

  // Removed unused pending/completed calculations to satisfy ESLint

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                TODO LIST
              </motion.h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <motion.div 
                className="relative group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" />
                <motion.input
                  type="text"
                  placeholder="Search todos... (Press '/' to focus)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-64 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 hover:shadow-md"
                  ref={searchRef}
                  whileFocus={{ scale: 1.02 }}
                />
                {searchTerm && (
                  <motion.button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors duration-200"
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </motion.div>

              {/* Admin Panel Link (visible to admins) */}
              {user?.role === 'admin' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link 
                    to="/admin" 
                    className="btn btn-primary btn-sm shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 relative overflow-hidden group"
                  >
                    <motion.span 
                      className="relative z-10"
                      whileHover={{ x: 2 }}
                    >
                      Admin Panel
                    </motion.span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                  </Link>
                </motion.div>
              )}

              {/* Filter Button */}
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`btn btn-sm transition-all duration-300 ${
                  showFilters 
                    ? 'btn-primary shadow-lg' 
                    : 'btn-secondary hover:btn-primary'
                }`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  animate={{ rotate: showFilters ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                </motion.div>
                Filters
              </motion.button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNotifs((s) => !s)}
                    className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications?.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-danger-600 text-white text-xs font-semibold rounded-full px-1.5 py-0.5">
                        {notifications.length}
                      </span>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showNotifs && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Due Tasks</h3>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="mr-3">Overdue: {overdueCount}</span>
                              <span>Today: {dueTodayCount}</span>
                            </div>
                          </div>
                        </div>
                        <div className="max-h-80 overflow-auto">
                          {notifications && notifications.length > 0 ? (
                            notifications.map((t) => {
                              const due = new Date(t.dueDate);
                              const isOver = due < new Date();
                              return (
                                <div key={t._id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-default">
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0 pr-3">
                                      <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                                        {isOver && <AlertTriangle className="w-4 h-4 text-danger-600 mr-1" />}
                                        <span className="truncate">{t.title}</span>
                                      </div>
                                      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 flex items-center">
                                        <CalendarIcon className="w-3 h-3 mr-1" />
                                        <span>
                                          {due.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                          {` `}
                                          {due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      className="text-xs text-primary-600 hover:underline flex-shrink-0"
                                      onClick={() => {
                                        setShowNotifs(false);
                                        // optional: could focus or filter; for now open edit modal for quick action
                                        setEditingTodo(t);
                                        setShowTodoForm(true);
                                      }}
                                    >
                                      View
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No due tasks 🎉</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {user?.username ? user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '?'}
                  </div>
                  <span>{user?.username}</span>
                  {user?.role === 'admin' && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                      Admin
                    </span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="board max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="dashboard-grid">
          {/* Left Sidebar */}
          <div className="panel">
            <Sidebar onAdd={() => setShowTodoForm(true)} />
          </div>

          {/* Center: Todo List */}
          <div>
            {/* Add New Task button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-accent shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 relative overflow-hidden group"
                onClick={() => { setEditingTodo(null); setShowTodoForm(true); }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  className="flex items-center"
                  whileHover={{ x: 2 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 90, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Plus className="w-4 h-4" style={{ marginRight: 8 }} />
                  </motion.div>
                  Add New Task
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              </motion.button>
            </div>
            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <FilterPanel onClose={() => setShowFilters(false)} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Todo List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800"
              whileHover={{ y: -2 }}
            >
              <motion.div 
                className="card-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <motion.h2 
                  className="card-title text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.02 }}
                >
                  {searchTerm ? `Search Results for "${searchTerm}"` : 'Today'}
                </motion.h2>
                <motion.p 
                  className="card-description"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  {todoLoading ? (
                    <span className="flex items-center">
                      <motion.div
                        className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Loading...
                    </span>
                  ) : (
                    <motion.span
                      key={filteredTodos.length}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-medium text-primary-600 dark:text-primary-400"
                    >
                      {filteredTodos.length} todos found
                    </motion.span>
                  )}
                </motion.p>
              </motion.div>
              
              <div className="card-content">
                {todoLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="list-row">
                        <div className="skeleton skeleton-circle" style={{ width: 20, height: 20 }}></div>
                        <div className="flex-1">
                          <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                          <div className="skeleton skeleton-text" style={{ width: '70%', marginTop: 8 }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredTodos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No todos found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchTerm 
                        ? 'Try adjusting your search terms'
                        : 'Get started by creating your first todo'
                      }
                    </p>
                    {!searchTerm && (
                      <motion.button
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                          y: -2
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowTodoForm(true)}
                        className="btn btn-primary shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 relative overflow-hidden group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                      >
                        <motion.div
                          className="flex items-center relative z-10"
                          whileHover={{ x: 2 }}
                        >
                          <motion.div
                            animate={{ rotate: [0, 180, 360] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                          </motion.div>
                          Add Your First Todo
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                      </motion.button>
                    )}
                  </div>
                ) : (
                  <TodoList todos={filteredTodos} onEdit={(t) => { setEditingTodo(t); setShowTodoForm(true); }} />
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Details Pane */}
          <div className="panel">
            <StatsCard stats={stats} />
            <div className="mt-6">
              <AnalyticsPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-50 group"
        onClick={() => { setEditingTodo(null); setShowTodoForm(true); }}
        whileHover={{ 
          scale: 1.1,
          rotate: 90,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <motion.div
          animate={{ rotate: [0, 180, 360] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
      </motion.button>

      {/* Todo Form Modal */}
      <AnimatePresence>
        {showTodoForm && (
          <TodoForm onClose={() => { setShowTodoForm(false); setEditingTodo(null); }} todo={editingTodo} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard; 