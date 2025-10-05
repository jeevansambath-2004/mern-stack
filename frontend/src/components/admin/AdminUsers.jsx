import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import apiService from '../../services/api';

const RoleBadge = ({ role }) => (
  <span
    className={`px-2 py-0.5 rounded text-xs font-medium ${
      role === 'admin'
        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }`}
  >
    {role}
  </span>
);

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { users } = await apiService.getAllUsers();
      setUsers(users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    if (!window.confirm(`Change role to ${role}?`)) return;
    setUpdating(id);
    try {
      await apiService.updateUserRole(id, role);
      await fetchUsers();
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div className="card"><div className="card-content">Loading users...</div></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Users</h2>
      <div className="card">
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                  <th className="py-2 pr-4">Username</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="py-3 pr-4 text-gray-900 dark:text-gray-100">{u.username}</td>
                    <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{u.email}</td>
                    <td className="py-3 pr-4"><RoleBadge role={u.role} /></td>
                    <td className="py-3 pr-4 space-x-2">
                      <button
                        className="btn btn-sm"
                        disabled={updating === u._id || u.role === 'user'}
                        onClick={() => handleRoleChange(u._id, 'user')}
                      >
                        Set User
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={updating === u._id || u.role === 'admin'}
                        onClick={() => handleRoleChange(u._id, 'admin')}
                      >
                        Set Admin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminUsers;
