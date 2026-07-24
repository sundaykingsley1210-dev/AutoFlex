import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaMoneyBillWave, FaFileAlt, FaBell, FaUser, FaCalendarAlt, FaBars, FaTimes, FaCar, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const CustomerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: '/dashboard/payments', icon: <FaMoneyBillWave />, label: 'Payments' },
    { to: '/dashboard/applications', icon: <FaFileAlt />, label: 'Applications' },
    { to: '/dashboard/notifications', icon: <FaBell />, label: 'Notifications' },
    { to: '/dashboard/profile', icon: <FaUser />, label: 'Profile' },
  ];

  const isActive = (path) => location.pathname === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-secondary-700/50">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <FaCar className="text-white text-lg" />
          </div>
          <div>
            <span className="text-lg font-bold gradient-text">AutoFlex</span>
            <p className="text-xs text-secondary-400">Customer Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive(item.to)
                ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                : 'text-secondary-300 hover:bg-secondary-700/50 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-secondary-700/50">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 bg-secondary-600 rounded-full flex items-center justify-center text-white font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-secondary-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition">
          <FaSignOutAlt />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-secondary-800/50 border-r border-secondary-700/50 flex-col fixed top-16 bottom-0 left-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-secondary-800 flex flex-col overflow-y-auto animate-slide-in">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white">
              <FaTimes size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-secondary-800/80 backdrop-blur border-b border-secondary-700/50 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="text-white">
          <FaBars size={20} />
        </button>
        <span className="text-sm font-medium text-secondary-300">
          {navItems.find(n => isActive(n.to))?.label || 'Dashboard'}
        </span>
        <div className="w-6" />
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        <div className="pt-12 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
