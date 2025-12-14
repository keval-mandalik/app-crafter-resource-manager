import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiResponse } from '../types';

// Token management utilities
export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },
  
  setToken: (token: string): void => {
    localStorage.setItem('authToken', token);
  },
  
  clearToken: (): void => {
    localStorage.removeItem('authToken');
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  }
};

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and retry logic
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle authentication errors
    if (error.response?.status === 401) {
      tokenManager.clearToken();
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Retry logic for network failures (5xx errors or network errors)
    if (
      (!error.response || error.response.status >= 500) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      
      // Exponential backoff: wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return apiClient(originalRequest);
    }

    // Handle other HTTP errors
    if (error.response) {
      const errorMessage = getErrorMessage(error.response);
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).status = error.response.status;
      (enhancedError as any).data = error.response.data;
      return Promise.reject(enhancedError);
    }

    // Handle network errors
    if (error.request) {
      const networkError = new Error('Network error: Please check your internet connection and try again.');
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  }
);

// Helper function to extract user-friendly error messages
function getErrorMessage(response: AxiosResponse): string {
  const data = response.data as ApiResponse<any>;
  
  // If the response follows our API format, use the message
  if (data && typeof data.message === 'string') {
    return data.message;
  }

  // Fallback to status-based messages
  switch (response.status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. The resource may already exist.';
    case 422:
      return 'Validation failed. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

// Enhanced API client with typed responses
export const api = {
  // Generic request method with proper typing
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await apiClient(config);
    return response.data;
  },

  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get(url, config);
    return response.data;
  },

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post(url, data, config);
    return response.data;
  },

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.put(url, data, config);
    return response.data;
  },

  // PATCH request
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.patch(url, data, config);
    return response.data;
  },

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete(url, config);
    return response.data;
  }
};

export default apiClient;
