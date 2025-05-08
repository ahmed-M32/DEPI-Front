import axiosInstance from "./axiosConfig";

const API_URL = "https://depi-back-production-fb68.up.railway.app/api/auth";

export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('authToken', token);
    } else {
        localStorage.removeItem('authToken');
    }
};

export const getStoredToken = () => {
    return localStorage.getItem('authToken');
};

const getAxiosConfig = {
    withCredentials: true,
   
}

/**
 * Login user
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Response object
 */
export const login = async (credentials) => {
    try {
        const response = await axiosInstance.post(`/login`, credentials);
        if (response.data?.data?.token) {
            setAuthToken(response.data.data.token);
        }
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to login"
        };
    }
};

/**
 * Register new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Response object
 */
export const register = async (userData) => {
    try {
        const response = await axiosInstance.post(`/signup`, userData);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to register"
        };
    }
};

/**
 * Get current user data
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Response object
 */
export const getCurrentUser = async () => {
    try {
        const response = await axiosInstance.get(`/me`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to get current user"
        };
    }
};

/**
 * Logout user
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Response object
 */
export const logout = async () => {
    try {
        const response = await axiosInstance.post(`/logout`, {});
        setAuthToken(null); 
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to logout"
        };
    }
};
