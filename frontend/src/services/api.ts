import axios from 'axios';

// Create Axios client targeting our FastAPI backend
const api = axios.create({
  // In development, the requests are proxied via Vite (see vite.config.ts)
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = error.response?.data?.detail || error.message || 'An unknown error occurred';
    console.error('API Request Failed:', errorMsg);
    return Promise.reject(errorMsg);
  }
);

export default api;
export const predictAssessment = (payload: any) => api.post('/assessment/predict', payload);
export const getReports = () => api.get('/reports');
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getAnalyticsDemographics = () => api.get('/analytics/demographics');
export const getMapData = () => api.get('/map/data');
export const getRecommendations = (payload: any) => api.post('/recommendations', payload);
