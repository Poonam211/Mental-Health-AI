import React from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { mode, toggleTheme } = useAppTheme();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-850/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <div className="flex items-center space-x-3">
            {/* Mobile Hamburger menu toggle (Hidden on desktop) */}
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 focus:outline-none"
            >
              <FiMenu className="w-5.5 h-5.5" />
            </button>

            {/* Application Logo */}
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="bg-indigo-600 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none">
                <span className="text-xl leading-none">🧠</span>
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900 dark:text-white leading-tight tracking-tight">MentalHealth.AI</h1>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">Clinical Intelligence</p>
              </div>
            </Link>
          </div>

          {/* Right Header Navigation controls */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-white transition-all duration-200"
              title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {mode === 'light' ? <FiMoon className="w-4.5 h-4.5" /> : <FiSun className="w-4.5 h-4.5" />}
            </button>
            
            {/* Authenticated User Profile Avatar & Sign Out */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2.5">
                {/* Avatar Widget */}
                <div 
                  className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-black text-xs uppercase tracking-wider shadow-inner"
                  title={`Logged in as ${user?.username}`}
                >
                  {user?.username ? user.username.slice(0, 2).toUpperCase() : 'AD'}
                </div>
                {/* Red Sign Out Action */}
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-700 transition-all duration-200"
                  title="Sign Out"
                >
                  <FiLogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              /* Unauthenticated Guest Sign In Button */
              <Link
                to="/login"
                className="px-4 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 dark:shadow-none transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
