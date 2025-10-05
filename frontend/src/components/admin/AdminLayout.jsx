import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
              {user?.username} ({user?.role})
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3">
          <nav className="card p-2 admin-nav">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Users
            </NavLink>
            <NavLink
              to="/admin/tasks"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Tasks
            </NavLink>
            <NavLink
              to="/admin/analytics"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Analytics
            </NavLink>
          </nav>
        </aside>
        <main className="col-span-12 md:col-span-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
