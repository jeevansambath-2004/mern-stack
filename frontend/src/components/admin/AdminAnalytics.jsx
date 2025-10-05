import React, { useEffect, useMemo, useState } from 'react';
import apiService from '../../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perUser, setPerUser] = useState([]);
  const [perPriority, setPerPriority] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { perUser, perPriority } = await apiService.getAdminAnalytics();
        setPerUser(perUser);
        setPerPriority(perPriority);
        setError(null);
      } catch (e) {
        setError(e?.response?.data?.error || 'Failed to load admin analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const topUsers = useMemo(() => perUser.slice(0, 8), [perUser]);
  const completedByUser = useMemo(
    () => perUser
      .map(u => ({ username: u.username, completed: u.completed }))
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 10),
    [perUser]
  );

  if (loading) {
    return <div className="card"><div className="card-content">Loading admin analytics...</div></div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Admin Analytics</h3>
          <p className="card-description">We couldn't load analytics right now.</p>
        </div>
        <div className="card-content text-sm text-gray-500 dark:text-gray-400">{String(error)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Completed by User (Top 10)</h3>
          <p className="card-description">Number of tasks completed per user</p>
        </div>
        <div className="card-content" style={{ height: 360 }}>
          {completedByUser.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">No completed tasks yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completedByUser} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey={(d) => `${d.username}`} width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">By Priority</h3>
          <p className="card-description">Completed vs Pending across priorities</p>
        </div>
        <div className="card-content" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perPriority} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill="#ef4444" name="Pending" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">By User (Top 8)</h3>
          <p className="card-description">Completed vs Pending tasks per user</p>
        </div>
        <div className="card-content" style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topUsers} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey={(d) => `${d.username}`}
                width={120}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#3b82f6" name="Completed" />
              <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Total users: {perUser.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
