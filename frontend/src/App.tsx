import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContextProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';

// Pages Import
import Home from '@/pages/Home';
import Prediction from '@/pages/Prediction';
import Dashboard from '@/pages/Dashboard';
import CityAnalytics from '@/pages/CityAnalytics';
import Reports from '@/pages/Reports';
import Recommendations from '@/pages/Recommendations';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

const App: React.FC = () => {
  return (
    /* Unified Dynamic Theme Provider */
    <ThemeContextProvider>
      {/* Global Authentication Provider */}
      <AuthProvider>
        <CssBaseline />
        <Router>
          {/* Responsive App Shell Layout */}
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/predict" element={<Prediction />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Clinical Workspaces */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/city-analytics"
                element={
                  <ProtectedRoute>
                    <CityAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AppLayout>
        </Router>
      </AuthProvider>
    </ThemeContextProvider>
  );
};

export default App;
