import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import apiService from '../../services/api';

const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#22c55e', '#a855f7', '#06b6d4', '#f59e0b'];

const AnalyticsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [breakdown, setBreakdown] = useState({ priority: {}, category: {} });
  const [trend, setTrend] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ breakdown }, { trend }] = await Promise.all([
          apiService.getTodoBreakdown(),
          apiService.getTodoTrend(14),
        ]);
        setBreakdown(breakdown);
        setTrend(trend);
        setError(null);
      } catch (e) {
        console.error('Analytics fetch error:', e);
        setError(e?.response?.data?.error || 'Analytics service unavailable');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const priorityData = useMemo(() => (
    [
      { name: 'Urgent', value: breakdown.priority.urgent || 0 },
      { name: 'High', value: breakdown.priority.high || 0 },
      { name: 'Medium', value: breakdown.priority.medium || 0 },
      { name: 'Low', value: breakdown.priority.low || 0 },
    ]
  ), [breakdown]);

  const categoryData = useMemo(() => (
    Object.entries(breakdown.category || {})
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  ), [breakdown]);

  const trendData = useMemo(() => (
    (trend || []).map(d => ({ date: d.date.slice(5), count: d.count }))
  ), [trend]);

  if (loading) {
    return <div className="card"><div className="card-content">Loading analytics...</div></div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Analytics</h3>
          <p className="card-description">We couldn't load analytics right now.</p>
        </div>
        <div className="card-content text-sm text-gray-500 dark:text-gray-400">
          {String(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Priority Breakdown - Pie */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Priority Breakdown</h3>
          <p className="card-description">Distribution across priorities</p>
        </div>
        <div className="card-content" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" outerRadius={80} label>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Categories - Bar */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Top Categories</h3>
          <p className="card-description">Most used categories</p>
        </div>
        <div className="card-content" style={{ height: 280 }}>
          {categoryData.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">No categories yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Completion Trend - Line */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Completion Trend (14 days)</h3>
          <p className="card-description">Tasks completed per day</p>
        </div>
        <div className="card-content" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 16, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Total completed: {trendData.reduce((sum, d) => sum + d.count, 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
