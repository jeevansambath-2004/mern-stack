import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import AnalyticsPanel from '../dashboard/AnalyticsPanel';
import AdminAnalytics from './AdminAnalytics';

const StatCard = ({ title, value }) => (
  <div className="card">
    <div className="card-content">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { stats } = await apiService.getAdminStats();
        setStats(stats);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="card"><div className="card-content">Loading...</div></div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={stats?.usersCount ?? 0} />
        <StatCard title="Admins" value={stats?.adminsCount ?? 0} />
        <StatCard title="Total Todos" value={stats?.todosCount ?? 0} />
      </div>
      <div className="mt-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Analytics</h3>
            <p className="card-description">Breakdowns and trends across the app</p>
          </div>
          <div className="card-content">
            <AnalyticsPanel />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Admin Analytics</h3>
            <p className="card-description">Completed vs Pending by user and by priority</p>
          </div>
          <div className="card-content">
            <AdminAnalytics />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
