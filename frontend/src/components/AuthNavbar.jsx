import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Gamepad2, ChevronDown, Gift, LineChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function AuthNavbar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showGameMenu, setShowGameMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const handleDevSkip = () => {
    navigate('/');
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
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
              developer skip to landing
            </motion.button>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ y: -2 }}
            >
              <Link 
                to="/analysis"
                className="text-white hover:text-emerald-400 transition-colors flex items-center gap-2"
              >
                <LineChart size={20} />
                Analysis
              </Link>
            </motion.div>
            <div className="relative">
              <motion.button 
                onClick={() => setShowGameMenu(!showGameMenu)}
                className="text-white hover:text-emerald-400 transition-colors flex items-center gap-2"
                whileHover={{ y: -2 }}
              >
                <Gamepad2 size={20} />
                Games
                <ChevronDown size={16} className={`transform transition-transform ${showGameMenu ? 'rotate-180' : ''}`} />
              </motion.button>
              
              {showGameMenu && (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={menuVariants}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-black border border-emerald-600/30 rounded-lg shadow-lg py-2"
                >
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="block w-full"
                  >
                    <Link 
                      to="/game/snake"
                      className="block px-4 py-2 text-white hover:bg-emerald-900/50 transition-colors"
                      onClick={() => setShowGameMenu(false)}
                    >
                      Snake
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="block w-full"
                  >
                    <Link 
                      to="/game/minesweeper"
                      className="block px-4 py-2 text-white hover:bg-emerald-900/50 transition-colors"
                      onClick={() => setShowGameMenu(false)}
                    >
                      Minesweeper
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="block w-full"
                  >
                    <Link 
                      to="/game/tetris"
                      className="block px-4 py-2 text-white hover:bg-emerald-900/50 transition-colors"
                      onClick={() => setShowGameMenu(false)}
                    >
                      Tetris
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </div>
            <motion.div
              whileHover={{ y: -2 }}
            >
              <Link 
                to="/redeem"
                className="text-white hover:text-emerald-400 transition-colors flex items-center gap-2"
              >
                <Gift size={20} />
                Redeem
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
        </div>
      </div>
    </nav>
  );
}