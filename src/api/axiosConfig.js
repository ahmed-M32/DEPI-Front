import axios from 'axios';
import { getStoredToken } from './auth';

const API_URL = 'https://depi-back-production-fb68.up.railway.app/api';

// Create axios instance with withCredentials set to true to send cookies with every request
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This ensures cookies are sent with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in a custom header as a fallback
// This way, if cookies aren't working, the backend can still authenticate using this header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      // Add token to a custom header
      config.headers['X-Auth-Token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
