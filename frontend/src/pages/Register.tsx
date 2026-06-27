import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight, FiPlusCircle } from 'react-icons/fi';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Front-end validations
    if (!username.trim() || !password || !confirmPassword) {
      setErrorMessage('Please fill in all registration fields.');
      return;
    }

    if (username.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      setErrorMessage('Username can only contain letters, numbers, underscores, and hyphens.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      // Register will create the user and trigger auto-login
      await register(username, password);
      // Auto-login takes them straight into the dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. The username may already be in use.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Premium Relational Card Wrapper */}
      <div className="bg-white dark:bg-slate-850/90 border border-slate-200 dark:border-slate-750 rounded-3xl shadow-xl shadow-slate-100 dark:shadow-none p-8 md:p-10 backdrop-blur-md transition-colors duration-300">
        
        {/* Workspace Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-indigo-600 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none mb-4.5">
            <FiPlusCircle className="w-6.5 h-6.5" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            Account Registration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1.5 uppercase tracking-wider">
            Register Clinical Administrator
          </p>
        </div>

        {/* Dynamic Error Alert Banner */}
        {errorMessage && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold leading-relaxed flex items-center space-x-2 animate-fadeIn">
            <span>⚠️</span>
            <p className="flex-grow">{errorMessage}</p>
          </div>
        )}

        {/* Registration Inputs */}
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
                placeholder="Choose alphanumeric username"
                disabled={submitting}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-550 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-600/10 font-bold text-sm transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <FiLock className="w-4.5 h-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
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

          {/* Confirm Password Input Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <FiLock className="w-4.5 h-4.5" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                disabled={submitting}
                className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-550 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-600/10 font-bold text-sm transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={submitting}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
              >
                {showConfirmPassword ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
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
                <span>Register and Login</span>
                <FiArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>

        {/* Redirection Prompt */}
        <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-850 text-center">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-black"
            >
              Sign In Instead
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
