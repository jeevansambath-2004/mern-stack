import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Tag, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTodo } from '../../contexts/TodoContext';

const TodoForm = ({ onClose, todo }) => {

  const { createTodo, updateTodo } = useTodo();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState(todo?.tags || []);

  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    
    formState: { errors },
    setValue,
    watch,
  } = useForm({

    defaultValues: {
      title: todo?.title || '',
      description: todo?.description || '',
      priority: todo?.priority || 'medium',
      category: todo?.category || 'General',
      dueDate: todo?.dueDate ? new Date(todo.dueDate) : null,
      notes: todo?.notes || '',
    },
  });

  const priority = watch('priority');

  const onSubmit = async (data) => {

    try {
      setIsSubmitting(true);
      const todoData = {
        ...data,
        tags: tags.filter(tag => tag.trim()),
        dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
      };


      if (todo) {
        await updateTodo(todo._id, todoData);
      } else {
        await createTodo(todoData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="card"
          style={{ width: '100%', maxWidth: '42rem', maxHeight: '90vh', overflowY: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-header flex justify-between items-center">
            <h2 className="card-title">
              {todo ? 'Edit Todo' : 'Add New Todo'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="card-content space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="input"
                placeholder="Enter todo title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-danger-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="input resize-none"
                placeholder="Enter description (optional)"
              />
            </div>

            {/* Priority and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <input
                  {...register('category')}
                  className="input"
                  placeholder="Enter category"
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <DatePicker
                  selected={watch('dueDate')}
                  onChange={(date) => setValue('dueDate', date)}
                  showTimeSelect={false}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select due date"
                  className="input pl-10"
                  minDate={new Date()}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="input flex-1"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="btn btn-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-primary-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="input resize-none"
                placeholder="Add notes (optional)"
              />
            </div>

            {/* Priority Indicator */}
            {priority && (
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <AlertCircle className="w-5 h-5 text-warning-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Priority: <span className="font-medium capitalize">{priority}</span>
                </span>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    {todo ? 'Update Todo' : 'Create Todo'}
                  </div>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TodoForm; 