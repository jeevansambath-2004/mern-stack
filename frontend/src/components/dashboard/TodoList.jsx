import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Trash2, Edit, Calendar, AlertTriangle } from 'lucide-react';
import { useTodo } from '../../contexts/TodoContext';
import { format } from 'date-fns';

const TodoList = ({ todos, onSelect, onEdit = () => {} }) => {

  const { toggleTodo, deleteTodo } = useTodo();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'priority-low';
      case 'medium':
        return 'priority-medium';
      case 'high':
        return 'priority-high';
      case 'urgent':
        return 'priority-urgent';
      default:
        return 'priority-medium';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {todos.map((todo, index) => (
          <motion.div
            key={todo._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.1 }}
            className={`list-flat transition-all duration-200 ${todo.completed ? 'opacity-75' : ''}`}
          >
            <div className="todo-item flex items-center w-full space-x-3">

                {/* Checkbox */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleTodo(todo._id)}
                  className={`p-1 rounded-full transition-colors ${
                    todo.completed
                      ? 'text-success-600 hover:text-success-700'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {todo.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </motion.button>

                {/* Content */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect && onSelect(todo)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-medium ${
                          todo.completed
                            ? 'line-through text-gray-500'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {todo.title}
                      </h3>

                      {todo.description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {todo.description}
                        </p>
                      )}

                      {/* Tags removed in row UI for cleaner look */}

                      {/* Meta Information */}
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        {/* Category */}
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                          {todo.category}
                        </span>

                        {/* Priority */}
                        <span className={`flex items-center px-2 py-1 rounded-full ${getPriorityColor(todo.priority)}`}>
                          {getPriorityIcon(todo.priority)}
                          <span className="ml-1 capitalize">{todo.priority}</span>
                        </span>

                        {/* Due Date */}
                        {todo.dueDate && (
                          <span className={`flex items-center ${
                            isOverdue(todo.dueDate) && !todo.completed ? 'text-danger-600' : ''
                          }`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(todo.dueDate), 'MMM dd, yyyy')}
                            {isOverdue(todo.dueDate) && !todo.completed && (
                              <span className="ml-1 text-danger-600">(Overdue)</span>
                            )}
                          </span>
                        )}

                        {/* Completion Date */}
                        {todo.completed && todo.completedAt && (
                          <span className="flex items-center text-success-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed {format(new Date(todo.completedAt), 'MMM dd')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEdit && onEdit(todo)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Edit todo"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deleteTodo(todo._id)}
                        className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                        title="Delete todo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {todos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-500 dark:text-gray-400"
        >
          No todos found
        </motion.div>
      )}
    </div>
  );
};

export default TodoList; 