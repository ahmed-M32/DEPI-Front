import axios from 'axios';

const API_URL = 'https://depi-back-production-fb68.up.railway.app/api';

// Create axios instance with withCredentials set to true to send cookies with every request
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This ensures cookies are sent with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// We don't need to manually add the token to headers since it will be in cookies
// The browser will automatically send cookies with requests when withCredentials is true

export default axiosInstance;
