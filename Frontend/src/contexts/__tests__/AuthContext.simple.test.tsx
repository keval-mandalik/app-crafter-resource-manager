import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';
import { api } from '../../services/api';
import type { User, AuthResponse, ApiResponse } from '../../types';
import { STORAGE_KEYS } from '../../utils/constants';

// Mock the API module
vi.mock('../../services/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

// Simple test component
const TestComponent: React.FC = () => {
  const { user, isAuthenticated, login, logout, error, isLoading } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      <div data-testid="user-info">
        {user ? `${user.name} (${user.email})` : 'no-user'}
      </div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button
        data-testid="login-btn"
        onClick={() => login({ email: 'test@example.com', password: 'password123' })}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

const renderWithAuth = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext Simple Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with not authenticated state', async () => {
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent('no-user');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('should handle successful login', async () => {
    const mockUser: User = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'CONTENT_MANAGER' as any,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    const mockResponse: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Login successful',
      data: { user: mockUser, token: 'test-token' },
    };

    mockApi.post.mockResolvedValueOnce(mockResponse);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    const loginBtn = screen.getByTestId('login-btn');
    await userEvent.click(loginBtn);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent('Test User (test@example.com)');
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('test-token');
  });
});