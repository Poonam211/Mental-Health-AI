import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight, FiActivity } from 'react-icons/fi';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get the redirect path from history state (defaults to /dashboard)
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please fill in all credentials.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await login(username, password);
      // Seamlessly redirect back to their original target page or dashboard
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Premium Glassmorphic Card Container */}
      <div className="bg-white dark:bg-slate-850/90 border border-slate-200 dark:border-slate-750 rounded-3xl shadow-xl shadow-slate-100 dark:shadow-none p-8 md:p-10 backdrop-blur-md transition-colors duration-300">
        
        {/* Workspace Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-indigo-600 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none mb-4.5">
            <FiActivity className="w-6.5 h-6.5 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            Clinical Workspace
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1.5 uppercase tracking-wider">
            Mental Health Intelligence Portal
          </p>
        </div>

        {/* Dynamic Error Alert Banner */}
        {errorMessage && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold leading-relaxed flex items-center space-x-2 animate-fadeIn">
            <span>⚠️</span>
            <p className="flex-grow">{errorMessage}</p>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <FiUser className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter clinical username"
                disabled={submitting}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-550 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-600/10 font-bold text-sm transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <FiLock className="w-4.5 h-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={submitting}
                className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-550 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-600/10 font-bold text-sm transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={submitting}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Submission Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm tracking-wide shadow-lg shadow-indigo-100 dark:shadow-none transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5.5 h-5.5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <FiArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>

        {/* Redirection / Registration Workspace Prompt */}
        <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-850 text-center">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Need workspace access?{' '}
            <Link
              to="/register"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-black"
            >
              Request Registration
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
