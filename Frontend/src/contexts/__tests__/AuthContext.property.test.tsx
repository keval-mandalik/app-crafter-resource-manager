import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';
import { api } from '../../services/api';
import type { AuthResponse, ApiResponse } from '../../types';
import { STORAGE_KEYS } from '../../utils/constants';

// Mock the API module
vi.mock('../../services/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

// Test component that uses the auth context
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

describe('AuthContext Property Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    localStorage.clear();
    cleanup();
  });

  /**
   * **Feature: frontend-resource-manager, Property 1: Valid login authentication flow**
   * For any valid user credentials, submitting the login form should result in successful authentication and redirection to the resources page
   */
  it('Property 1: Valid login authentication flow', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          user: fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }),
            name: fc.string({ minLength: 1, maxLength: 20 }),
            email: fc.constant('test@example.com'),
            role: fc.constantFrom('CONTENT_MANAGER', 'VIEWER'),
            createdAt: fc.constant('2023-01-01T00:00:00Z'),
            updatedAt: fc.constant('2023-01-01T00:00:00Z'),
          }),
          token: fc.string({ minLength: 10, maxLength: 50 }),
        }),
        async ({ user, token }) => {
          // Clear any previous state
          cleanup();
          localStorage.clear();
          vi.clearAllMocks();
          
          const mockResponse: ApiResponse<AuthResponse> = {
            success: true,
            message: 'Login successful',
            data: { user, token },
          };
          mockApi.post.mockResolvedValueOnce(mockResponse);

          const { unmount } = renderWithAuth();

          try {
            await waitFor(() => {
              expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
            });

            const loginBtn = screen.getByTestId('login-btn');
            await userEvent.click(loginBtn);

            await waitFor(() => {
              expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
            });

            expect(screen.getByTestId('user-info')).toHaveTextContent(`${user.name} (${user.email})`);
            expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe(token);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 3 }
    );
  }, 10000);

  /**
   * **Feature: frontend-resource-manager, Property 2: Invalid login rejection**
   * For any invalid user credentials, submitting the login form should display an error message and prevent authentication
   */
  it('Property 2: Invalid login rejection', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 30 }),
        async (errorMessage) => {
          // Clear any previous state
          cleanup();
          localStorage.clear();
          vi.clearAllMocks();
          
          const mockError = new Error(errorMessage);
          mockApi.post.mockRejectedValueOnce(mockError);

          const { unmount } = renderWithAuth();

          try {
            await waitFor(() => {
              expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
            });

            const loginBtn = screen.getByTestId('login-btn');
            await userEvent.click(loginBtn);

            await waitFor(() => {
              expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
            });

            expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
            expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 3 }
    );
  }, 10000);

  /**
   * **Feature: frontend-resource-manager, Property 5: Logout token cleanup**
   * For any logout action, the authentication token should be cleared and the user should be redirected to the login page
   */
  it('Property 5: Logout token cleanup', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          user: fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }),
            name: fc.string({ minLength: 1, maxLength: 20 }),
            email: fc.constant('test@example.com'),
            role: fc.constantFrom('CONTENT_MANAGER', 'VIEWER'),
            createdAt: fc.constant('2023-01-01T00:00:00Z'),
            updatedAt: fc.constant('2023-01-01T00:00:00Z'),
          }),
          token: fc.string({ minLength: 10, maxLength: 50 }),
        }),
        async ({ user, token }) => {
          // Clear any previous state
          cleanup();
          localStorage.clear();
          vi.clearAllMocks();
          
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

          const { unmount } = renderWithAuth();

          try {
            await waitFor(() => {
              expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
            });

            const logoutBtn = screen.getByTestId('logout-btn');
            await userEvent.click(logoutBtn);

            await waitFor(() => {
              expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
            });

            expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();
            expect(localStorage.getItem(STORAGE_KEYS.USER_DATA)).toBeNull();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 3 }
    );
  }, 10000);
});