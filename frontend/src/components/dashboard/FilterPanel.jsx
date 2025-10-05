import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Filter, Search } from 'lucide-react';
import { useTodo } from '../../contexts/TodoContext';

const FilterPanel = ({ onClose }) => {
  const { setFilters, categories } = useTodo();
  const [filters, setLocalFilters] = useState({
    completed: '',
    priority: '',
    category: '',
    search: '',
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setLocalFilters(newFilters);
    
    // Convert to API format
    const apiFilters = {};
    if (newFilters.completed !== '') {
      apiFilters.completed = newFilters.completed === 'true';
    }
    if (newFilters.priority !== '') {
      apiFilters.priority = newFilters.priority;
    }
    if (newFilters.category !== '') {
      apiFilters.category = newFilters.category;
    }
    if (newFilters.search !== '') {
      apiFilters.search = newFilters.search;
    }
    
    setFilters(apiFilters);
  };

  const clearFilters = () => {
    setLocalFilters({
      completed: '',
      priority: '',
      category: '',
      search: '',
    });
    setFilters({});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card"
    >
      <div className="card-header flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-primary-600" />
          <h3 className="card-title">Filters</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="card-content space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input pl-10"
              placeholder="Search todos..."
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.completed}
            onChange={(e) => handleFilterChange('completed', e.target.value)}
            className="input"
          >
            <option value="">All</option>
            <option value="false">Pending</option>
            <option value="true">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="input"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={clearFilters}
            className="btn btn-secondary"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterPanel; 