import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

// Mengambil base URL dari environment variable
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor Request: Menyisipkan JWT token ke header Authorization
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor Response: Menangani response 401 (token expired/invalid)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Logout otomatis jika token expired atau tidak valid
      useAuthStore.getState().logout();
      window.location.href = '/login'; // redirect ke login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
