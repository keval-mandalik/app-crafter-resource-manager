import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '../../../contexts/AuthContext';

import { STORAGE_KEYS } from '../../../utils/constants';

// Mock the API module
vi.mock('../../../services/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

// Test component to render inside protected route
const ProtectedContent: React.FC = () => (
  <div data-testid="protected-content">Protected Content</div>
);

const renderProtectedRoute = (initialEntries: string[] = ['/protected']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Property Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * **Feature: frontend-resource-manager, Property 4: Route protection enforcement**
   * For any protected route access without authentication, the application should redirect to the login page
   */
  it('Property 4: Route protection enforcement', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }).map(
          paths => paths.map(path => `/${path.replace(/[^a-zA-Z0-9-_]/g, '')}`)
        ),
        async (protectedPaths) => {
          for (const path of protectedPaths) {
            // Clear localStorage to ensure no authentication
            localStorage.clear();

            renderProtectedRoute([path]);

            // Wait for auth initialization and verify redirect behavior
            await waitFor(() => {
              // Should not show protected content
              expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
            });

            // Should show loading initially, then redirect (no protected content)
            expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 38: Route protection consistency**
   * For any routing configuration, the application should implement proper route protection based on authentication status
   */
  it('Property 38: Route protection consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          user: fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            email: fc.emailAddress(),
            role: fc.constantFrom('CONTENT_MANAGER', 'VIEWER'),
            createdAt: fc.date().map(d => d.toISOString()),
            updatedAt: fc.date().map(d => d.toISOString()),
          }),
          token: fc.string({ minLength: 20, maxLength: 200 }),
          protectedPath: fc.string({ minLength: 1, maxLength: 50 }).map(
            path => `/${path.replace(/[^a-zA-Z0-9-_]/g, '')}`
          ),
        }),
        async ({ user, token, protectedPath }) => {
          // Test with authentication
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

          renderProtectedRoute([protectedPath]);

          // Wait for auth initialization and verify protected content is shown
          await waitFor(() => {
            expect(screen.getByTestId('protected-content')).toBeInTheDocument();
          });

          // Clear auth and test without authentication
          localStorage.clear();

          renderProtectedRoute([protectedPath]);

          // Wait for auth initialization and verify redirect behavior
          await waitFor(() => {
            // Should not show protected content when not authenticated
            expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});