import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        
        if (data.success) {
          const { setAuth } = useAuthStore.getState();
          setAuth(data.data.user, data.data.accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
