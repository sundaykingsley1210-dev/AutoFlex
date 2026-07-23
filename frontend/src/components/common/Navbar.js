import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCar, FaBars, FaTimes, FaUser, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); setIsOpen(false); };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <FaCar className="text-primary-400 text-2xl" />
            <span className="text-xl font-bold gradient-text">AutoFlex</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-secondary-300 hover:text-white transition">Home</Link>
            <Link to="/vehicles" className="text-secondary-300 hover:text-white transition">Vehicles</Link>
            <Link to="/calculator" className="text-secondary-300 hover:text-white transition">Calculator</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2 text-secondary-300 hover:text-white transition">
                  <FaTachometerAlt /> Dashboard
                </Link>
                <span className="text-secondary-400 text-sm">{user?.firstName}</span>
                <button onClick={handleLogout} className="flex items-center gap-2 text-secondary-300 hover:text-red-400 transition">
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-secondary-300 hover:text-white transition">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass border-t border-secondary-700">
          <div className="px-4 py-4 space-y-3">
            <Link to="/" onClick={() => setIsOpen(false)} className="block text-secondary-300 hover:text-white">Home</Link>
            <Link to="/vehicles" onClick={() => setIsOpen(false)} className="block text-secondary-300 hover:text-white">Vehicles</Link>
            <Link to="/calculator" onClick={() => setIsOpen(false)} className="block text-secondary-300 hover:text-white">Calculator</Link>
            {isAuthenticated ? (
              <>
                <Link to={isAdmin ? '/admin' : '/dashboard'} onClick={() => setIsOpen(false)} className="block text-secondary-300 hover:text-white">Dashboard</Link>
                <button onClick={handleLogout} className="block text-red-400 hover:text-red-300">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-secondary-300 hover:text-white">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block btn-primary text-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
