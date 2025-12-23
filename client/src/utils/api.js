import axios from 'axios';

const isDev = import.meta.env.DEV;
const rawProductionUrl = import.meta.env.VITE_API_URL || 'https://infastcrmm.onrender.com';
const normalizedProductionUrl = rawProductionUrl.replace(/\/+$/, '');
const ensureApiPath = normalizedProductionUrl.endsWith('/api')
  ? normalizedProductionUrl
  : `${normalizedProductionUrl}/api`;
const baseURL = isDev ? 'http://localhost:5000/api' : ensureApiPath;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

