import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut } = useAuth();

  const handleDevSkip = () => {
    navigate('/dashboard');
  };

  const handleNavClick = (e, section) => {
    if (location.pathname !== '/') {
      e.preventDefault();
      navigate(`/#${section}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 bg-emerald-500 group-hover:bg-emerald-400 rounded-full flex items-center justify-center transition-colors"
              >
                <Trash2 size={20} className="text-white transform rotate-0" />
              </motion.div>
              <span className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">Smarbin</span>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDevSkip}
              className="text-xs text-emerald-300/50 hover:text-emerald-300 transition-colors"
            >
              developer skip to dashboard
            </motion.button>
          </div>
          
          <div className="flex items-center space-x-8">
            <motion.a 
              href="/#about" 
              onClick={(e) => handleNavClick(e, 'about')}
              className="text-gray-300 hover:text-white transition-colors relative group"
              whileHover={{ y: -2 }}
            >
              About
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </motion.a>
            <motion.a 
              href="/#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="text-gray-300 hover:text-white transition-colors relative group"
              whileHover={{ y: -2 }}
            >
              Features
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </motion.a>
            <motion.a 
              href="/#contact" 
              onClick={(e) => handleNavClick(e, 'contact')}
              className="text-gray-300 hover:text-white transition-colors relative group"
              whileHover={{ y: -2 }}
            >
              Contact
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </motion.a>
            {loading ? (
              <div className="text-gray-300">Loading...</div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ y: -2 }}
                >
                  <Link 
                    to="/dashboard"
                    className="text-gray-300 hover:text-white transition-colors relative group"
                  >
                    Dashboard
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition-colors"
                >
                  Logout
                </motion.button>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition-colors"
                >
                  Login
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}