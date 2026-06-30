import axios from 'axios';

// Create Axios client targeting our FastAPI backend
const api = axios.create({
  // In development, the requests are proxied via Vite (see vite.config.ts)
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically inject authorization headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = error.response?.data?.detail || error.message || 'An unknown error occurred';
    console.error('API Request Failed:', errorMsg);
    
    // Create a standard Error object and attach the response so that
    // AuthContext can inspect it (e.g. to check for 401 status)
    const customError = new Error(errorMsg);
    (customError as any).response = error.response;
    return Promise.reject(customError);
  }
);


export default api;
export const predictAssessment = (payload: any) => api.post('/assessment/predict', payload);
export const getReports = () => api.get('/reports');
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getAnalyticsDemographics = () => api.get('/analytics/demographics');
export const getMapData = () => api.get('/map/data');
export const getRecommendations = (payload: any) => api.post('/recommendations', payload);
