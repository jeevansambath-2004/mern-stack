import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle, TrendingUp, Target } from 'lucide-react';

const StatsCard = ({ stats }) => {
  if (!stats) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Statistics</h3>
        </div>
        <div className="card-content">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading statistics...
          </div>
        </div>
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total',
      value: stats.total,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100 dark:bg-success-900',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100 dark:bg-warning-900',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100 dark:bg-danger-900',
    },
    {
      label: 'High Priority',
      value: stats.highPriority,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
    {
      label: 'Urgent',
      value: stats.urgent,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900',
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Statistics</h3>
        <p className="card-description">Your todo progress overview</p>
      </div>
      <div className="card-content">
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className={`p-2 rounded-full ${item.bgColor}`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Completion Rate
            </span>
            <span className="text-sm font-bold text-primary-600">
              {stats.completionRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.completionRate}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">
                {stats.completed}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Completed Today
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600">
                {stats.pending}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Still Pending
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 