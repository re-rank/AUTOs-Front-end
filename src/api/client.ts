import axios from 'axios';

const AUTH_PATHS = ['/api/auth/login', '/api/auth/register'];

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

apiClient.interceptors.request.use((config) => {
  const isAuthPath = AUTH_PATHS.some((p) => config.url?.includes(p));
  if (!isAuthPath) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthPath = AUTH_PATHS.some((p) => error.config?.url?.includes(p));
    if (error.response?.status === 401 && !isAuthPath) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
