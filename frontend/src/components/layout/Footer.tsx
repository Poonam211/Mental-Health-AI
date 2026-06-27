import React from 'react';
import { Link } from 'react-router-dom';
import { Divider } from '@mui/material';
import { FiActivity, FiDatabase, FiMapPin, FiSmile, FiInfo, FiMail } from 'react-icons/fi';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-850 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300 py-12 mt-auto font-medium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Company Bio & Clinical Disclaimer */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="bg-indigo-600 text-white p-2.5 rounded-xl flex items-center justify-center">
                <span className="text-base leading-none">🧠</span>
              </div>
              <h1 className="text-base font-black text-slate-900 dark:text-white leading-tight tracking-tight">MentalHealth.AI</h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              MentalHealth.AI is a clinical diagnostic intelligence observatory. This system evaluates psychiatric risk scales (PHQ-9 & GAD-7) using machine learning. It is **NOT** a substitute for professional clinical medical advice, psychiatric diagnosis, or therapy.
            </p>
          </div>

          {/* Product Navigation */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Observatory Tools</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/predict" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1.5 transition-colors">
                  <FiActivity className="w-3.5 h-3.5" />
                  <span>Risk Assessment</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1.5 transition-colors">
                  <FiDatabase className="w-3.5 h-3.5" />
                  <span>National Observatory</span>
                </Link>
              </li>
              <li>
                <Link to="/city-analytics" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1.5 transition-colors">
                  <FiMapPin className="w-3.5 h-3.5" />
                  <span>Geographic Mapping</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resources & Help</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/recommendations" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1.5 transition-colors">
                  <FiSmile className="w-3.5 h-3.5" />
                  <span>Mindfulness & Coping</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1.5 transition-colors">
                  <FiInfo className="w-3.5 h-3.5" />
                  <span>About System</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1.5 transition-colors">
                  <FiMail className="w-3.5 h-3.5" />
                  <span>Contact Support</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Divider className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 text-xs text-slate-400 dark:text-slate-500">
          <p>&copy; {new Date().getFullYear()} MentalHealth.AI. All rights reserved.</p>
          <p>Decoupled React + Vite Client &bull; FastAPI Analytics Server</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
