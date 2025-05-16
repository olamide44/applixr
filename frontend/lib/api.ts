import axios, { AxiosError } from 'axios';
import { ApiError } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000' || 'https://applixr-backend-production.up.railway.app',
});

// Add a request interceptor to add the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Only set Content-Type for JSON manually; let FormData handle its own
  if (
    !(config.data instanceof FormData) &&
    (!config.headers || !config.headers['Content-Type'])
  ) {
    config.headers = config.headers || {};
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      detail: error.response?.data?.detail || 'An error occurred',
      status: error.response?.status || 500,
    };
  }
  return {
    detail: 'An unexpected error occurred',
    status: 500,
  };
};

export default api;
