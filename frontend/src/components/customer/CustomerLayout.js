import React, { useState, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaMoneyBillWave, FaFileAlt, FaBell, FaUser, FaBars, FaTimes, FaCar, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard', exact: true },
  { to: '/dashboard/payments', icon: FaMoneyBillWave, label: 'Payments' },
  { to: '/dashboard/applications', icon: FaFileAlt, label: 'Applications' },
  { to: '/dashboard/notifications', icon: FaBell, label: 'Notifications' },
  { to: '/dashboard/profile', icon: FaUser, label: 'Profile' },
];

const SidebarNav = React.memo(({ onNavigate }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = useCallback((item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 lg:p-6 border-b border-secondary-700/50">
        <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <FaCar className="text-white text-lg" />
          </div>
          <div>
            <span className="text-lg font-bold gradient-text">AutoFlex</span>
            <p className="text-xs text-secondary-400">Customer Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                  : 'text-secondary-300 hover:bg-secondary-700/50 hover:text-white'
              }`}
            >
              <Icon className="text-lg flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 lg:p-4 border-t border-secondary-700/50">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-10 h-10 bg-primary-600/30 border border-primary-500/30 rounded-full flex items-center justify-center text-primary-400 font-bold flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-secondary-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition">
          <FaSignOutAlt className="flex-shrink-0" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
});

const CustomerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const currentLabel = useMemo(() => {
    const item = navItems.find(n => location.pathname === n.to || (!n.exact && location.pathname.startsWith(n.to)));
    return item?.label || 'Dashboard';
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-secondary-900">
      {/* Desktop sidebar - always visible on lg+ */}
      <aside className="hidden lg:flex w-64 bg-secondary-800/50 border-r border-secondary-700/50 flex-col fixed top-16 bottom-0 left-0 z-30">
        <SidebarNav />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSidebar} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-secondary-800 flex flex-col shadow-2xl z-10">
            <div className="absolute top-4 right-4 z-20">
              <button onClick={closeSidebar} className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary-700 text-secondary-300 hover:text-white transition">
                <FaTimes size={16} />
              </button>
            </div>
            <SidebarNav onNavigate={closeSidebar} />
          </aside>
        </div>
      )}

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-secondary-800/90 backdrop-blur border-b border-secondary-700/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-secondary-700/50 text-white hover:bg-secondary-700 transition">
            <FaBars size={18} />
          </button>
          <span className="text-sm font-semibold text-white">{currentLabel}</span>
          <div className="w-10" />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
