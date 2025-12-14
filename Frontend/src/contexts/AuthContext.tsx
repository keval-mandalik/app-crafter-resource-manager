import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, LoginCredentials } from '../types';
import { api } from '../services/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData) as User;
            setUser(parsedUser);
          } catch (parseError) {
            // If user data is corrupted, clear everything
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post<any>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Backend returns { status: 1, message: "...", data: { access_token, user } }
      if (response.status === 1 && response.data) {
        const { access_token: token, user: userData } = response.data;
        
        // Store token and user data
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        
        setUser(userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    
    // Clear state
    setUser(null);
    setError(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};