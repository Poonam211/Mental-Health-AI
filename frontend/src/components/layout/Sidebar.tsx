import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiActivity, FiDatabase, FiHome, FiInfo, FiMail, 
  FiMapPin, FiSmile, FiFileText, FiChevronLeft, FiChevronRight,
  FiLogOut
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const navItems = [
    { name: 'Home', path: '/', icon: <FiHome className="w-5 h-5" />, protected: false },
    { name: 'Assessment', path: '/predict', icon: <FiActivity className="w-5 h-5" />, protected: false },
    { name: 'Dashboard', path: '/dashboard', icon: <FiDatabase className="w-5 h-5" />, protected: true },
    { name: 'City Analytics', path: '/city-analytics', icon: <FiMapPin className="w-5 h-5" />, protected: true },
    { name: 'Reports', path: '/reports', icon: <FiFileText className="w-5 h-5" />, protected: true },
    { name: 'Recommendations', path: '/recommendations', icon: <FiSmile className="w-5 h-5" />, protected: true },
    { name: 'About', path: '/about', icon: <FiInfo className="w-5 h-5" />, protected: false },
    { name: 'Contact', path: '/contact', icon: <FiMail className="w-5 h-5" />, protected: false },
  ];

  const filteredNavItems = navItems.filter(item => !item.protected || isAuthenticated);

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-colors duration-350">
      <div className="flex-grow pt-4 pb-6 overflow-y-auto">
        {/* Navigation Items */}
        <nav className="px-3 space-y-1.5 relative">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={`relative flex items-center rounded-xl font-bold text-sm transition-all duration-250 py-3 z-10 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/35 hover:text-slate-950 dark:hover:text-white'
                } ${collapsed ? 'justify-center px-0' : 'px-4 space-x-3'}`}
                title={collapsed ? item.name : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-indigo-600 dark:bg-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-600/15 dark:shadow-none"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <div className="flex-shrink-0 z-10">{item.icon}</div>
                {!collapsed && (
                  <span className="truncate z-10">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout button if authenticated */}
      {isAuthenticated && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={logout}
            className={`w-full py-2.5 flex items-center rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-700 font-bold transition-all duration-200 ${
              collapsed ? 'justify-center px-0' : 'px-4 space-x-3'
            }`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <div className="flex-shrink-0"><FiLogOut className="w-5 h-5" /></div>
            {!collapsed && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      )}

      {/* Collapse Toggle Button (Desktop Only) */}
      <div className="hidden md:block p-3 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onToggleCollapse}
          className="w-full py-2.5 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 font-bold"
        >
          {collapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent Side Panel) */}
      <aside 
        className={`hidden md:block h-[calc(100vh-64px)] sticky top-16 flex-shrink-0 transition-all duration-300 z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Slide-out Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Dark Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
              onClick={onMobileClose}
            />
            {/* Drawer Panel */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-800"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
