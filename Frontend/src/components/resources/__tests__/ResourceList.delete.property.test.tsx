import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import ResourceList from '../ResourceList';
import type { Resource, ResourceListResponse, User } from '../../../types';

// Mock the hooks
const mockDeleteMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

vi.mock('../../../hooks/useResources', () => ({
  useDeleteResource: () => mockDeleteMutation,
}));

// Mock the AuthContext hook
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => {
    const context = React.useContext(MockAuthContext);
    return context;
  },
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock AuthContext for testing
const MockAuthContext = React.createContext<{
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  logout: () => {},
  error: null,
  clearError: () => {},
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; user?: User }> = ({ 
  children, 
  user = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'CONTENT_MANAGER',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  }
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const mockAuthValue = {
    user,
    isAuthenticated: !!user,
    isLoading: false,
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
    error: null,
    clearError: vi.fn(),
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MockAuthContext.Provider value={mockAuthValue}>
          {children}
        </MockAuthContext.Provider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ResourceList Delete Functionality Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteMutation.mutateAsync.mockResolvedValue(undefined);
    mockDeleteMutation.isPending = false;
  });

  // Generators for property-based testing
  const resourceTypeArb = fc.constantFrom('Article', 'Video', 'Tutorial');
  const resourceStatusArb = fc.constantFrom('Draft', 'Published', 'Archived');

  const resourceArb = fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 200 }),
    description: fc.string({ minLength: 1, maxLength: 1000 }),
    type: resourceTypeArb,
    url: fc.webUrl(),
    tags: fc.string({ maxLength: 500 }),
    status: resourceStatusArb,
    createdByUserId: fc.uuid(),
    createdAt: fc.integer({ min: 1577836800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
    updatedAt: fc.integer({ min: 1577836800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
  });

  const contentManagerUserArb = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    email: fc.emailAddress(),
    role: fc.constant('CONTENT_MANAGER' as const),
    createdAt: fc.integer({ min: 1577836800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
    updatedAt: fc.integer({ min: 1577836800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
  });

  const resourceListResponseArb = fc.record({
    items: fc.array(resourceArb, { minLength: 1, maxLength: 5 }),
    pagination: fc.record({
      page: fc.integer({ min: 1, max: 10 }),
      limit: fc.integer({ min: 1, max: 50 }),
      total: fc.integer({ min: 1, max: 1000 }),
      totalPages: fc.integer({ min: 1, max: 100 }),
    }),
  });

  describe('Property 15: Delete confirmation requirement', () => {
    /**
     * **Feature: frontend-resource-manager, Property 15: Delete confirmation requirement**
     * For any delete action by a CONTENT_MANAGER, the application should display 
     * a confirmation dialog before proceeding
     * **Validates: Requirements 4.1**
     */
    it('should display confirmation dialog when delete button is clicked', () => {
      fc.assert(
        fc.property(
          resourceListResponseArb,
          contentManagerUserArb,
          (data, user) => {
            render(
              <TestWrapper user={user}>
                <ResourceList
                  data={data}
                  isLoading={false}
                  error={null}
                />
              </TestWrapper>
            );

            // Click the first delete button
            const deleteButtons = screen.getAllByText('Delete');
            fireEvent.click(deleteButtons[0]);

            // Should display confirmation modal
            expect(screen.getByText('Archive Resource')).toBeInTheDocument();
            expect(screen.getByText(/Are you sure you want to archive/)).toBeInTheDocument();
            expect(screen.getByText('Cancel')).toBeInTheDocument();
            expect(screen.getByText('Archive')).toBeInTheDocument();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should include resource title in confirmation message', () => {
      fc.assert(
        fc.property(
          resourceArb,
          contentManagerUserArb,
          (resource, user) => {
            const data: ResourceListResponse = {
              items: [resource],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
              },
            };

            render(
              <TestWrapper user={user}>
                <ResourceList
                  data={data}
                  isLoading={false}
                  error={null}
                />
              </TestWrapper>
            );

            // Click delete button
            const deleteButton = screen.getByText('Delete');
            fireEvent.click(deleteButton);

            // Should include resource title in confirmation message
            expect(screen.getByText(new RegExp(resource.title))).toBeInTheDocument();
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Property 17: Successful deletion UI update', () => {
    /**
     * **Feature: frontend-resource-manager, Property 17: Successful deletion UI update**
     * For any successful archive operation, the application should remove the resource 
     * from the active list view
     * **Validates: Requirements 4.3**
     */
    it('should call delete mutation when confirmed', async () => {
      fc.assert(
        fc.property(
          resourceArb,
          contentManagerUserArb,
          async (resource, user) => {
            const data: ResourceListResponse = {
              items: [resource],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
              },
            };

            render(
              <TestWrapper user={user}>
                <ResourceList
                  data={data}
                  isLoading={false}
                  error={null}
                />
              </TestWrapper>
            );

            // Click delete button
            const deleteButton = screen.getByText('Delete');
            fireEvent.click(deleteButton);

            // Click confirm button
            const confirmButton = screen.getByText('Archive');
            fireEvent.click(confirmButton);

            // Should call delete mutation with correct resource ID
            await waitFor(() => {
              expect(mockDeleteMutation.mutateAsync).toHaveBeenCalledWith(resource.id);
            });
          }
        ),
        { numRuns: 5 }
      );
    });
  });

  describe('Property 18: Failed deletion error handling', () => {
    /**
     * **Feature: frontend-resource-manager, Property 18: Failed deletion error handling**
     * For any failed archive operation, the application should display an error message 
     * and maintain the current state
     * **Validates: Requirements 4.4**
     */
    it('should handle delete errors gracefully', async () => {
      const deleteError = new Error('Network error occurred');
      mockDeleteMutation.mutateAsync.mockRejectedValue(deleteError);

      fc.assert(
        fc.property(
          resourceArb,
          contentManagerUserArb,
          async (resource, user) => {
            const data: ResourceListResponse = {
              items: [resource],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
              },
            };

            // Spy on console.error to verify error logging
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            render(
              <TestWrapper user={user}>
                <ResourceList
                  data={data}
                  isLoading={false}
                  error={null}
                />
              </TestWrapper>
            );

            // Click delete button
            const deleteButton = screen.getByText('Delete');
            fireEvent.click(deleteButton);

            // Click confirm button
            const confirmButton = screen.getByText('Archive');
            fireEvent.click(confirmButton);

            // Should log error to console
            await waitFor(() => {
              expect(consoleSpy).toHaveBeenCalledWith('Failed to delete resource:', deleteError);
            });

            consoleSpy.mockRestore();
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should maintain current state when delete fails', async () => {
      const deleteError = new Error('Network error occurred');
      mockDeleteMutation.mutateAsync.mockRejectedValue(deleteError);

      fc.assert(
        fc.property(
          resourceArb,
          contentManagerUserArb,
          async (resource, user) => {
            const data: ResourceListResponse = {
              items: [resource],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
              },
            };

            render(
              <TestWrapper user={user}>
                <ResourceList
                  data={data}
                  isLoading={false}
                  error={null}
                />
              </TestWrapper>
            );

            // Resource should be visible initially
            expect(screen.getByText(resource.title)).toBeInTheDocument();

            // Click delete button
            const deleteButton = screen.getByText('Delete');
            fireEvent.click(deleteButton);

            // Click confirm button
            const confirmButton = screen.getByText('Archive');
            fireEvent.click(confirmButton);

            // Wait for error handling
            await waitFor(() => {
              expect(mockDeleteMutation.mutateAsync).toHaveBeenCalled();
            });

            // Resource should still be visible (state maintained)
            expect(screen.getByText(resource.title)).toBeInTheDocument();
          }
        ),
        { numRuns: 5 }
      );
    });
  });

  describe('Property 19: Delete cancellation', () => {
    /**
     * **Feature: frontend-resource-manager, Property 19: Delete cancellation**
     * For any deletion cancellation, the application should close the dialog 
     * without making changes
     * **Validates: Requirements 4.5**
     */
    it('should close modal and not call delete when cancelled', () => {
      fc.assert(
        fc.property(
          resourceArb,
          contentManagerUserArb,
          (resource, user) => {
            const data: ResourceListResponse = {
              items: [resource],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
              },
            };

            render(
              <TestWrapper user={user}>
                <ResourceList
                  data={data}
                  isLoading={false}
                  error={null}
                />
              </TestWrapper>
            );

            // Click delete button
            const deleteButton = screen.getByText('Delete');
            fireEvent.click(deleteButton);

            // Modal should be visible
            expect(screen.getByText('Archive Resource')).toBeInTheDocument();

            // Click cancel button
            const cancelButton = screen.getByText('Cancel');
            fireEvent.click(cancelButton);

            // Modal should be closed
            expect(screen.queryByText('Archive Resource')).not.toBeInTheDocument();
            
            // Delete mutation should not have been called
            expect(mockDeleteMutation.mutateAsync).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should close modal when clicking outside or pressing escape', () => {
      fc.assert(
        fc.property(
          resourceArb,
          contentManagerUserArb,
          (resource, user) => {
            const data: ResourceListResponse = {
              items: [resource],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
              },
            };

            render(
              <TestWrapper user={user}>
                <ResourceList
                  data={data}
                  isLoading={false}
                  error={null}
                />
              </TestWrapper>
            );

            // Click delete button
            const deleteButton = screen.getByText('Delete');
            fireEvent.click(deleteButton);

            // Modal should be visible
            expect(screen.getByText('Archive Resource')).toBeInTheDocument();

            // Press escape key
            fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

            // Modal should be closed
            expect(screen.queryByText('Archive Resource')).not.toBeInTheDocument();
            
            // Delete mutation should not have been called
            expect(mockDeleteMutation.mutateAsync).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Loading state during delete operation', () => {
    it('should show loading state during delete operation', () => {
      fc.assert(
        fc.property(
          resourceArb,
          contentManagerUserArb,
          (resource, user) => {
            // Set mutation to pending state
            mockDeleteMutation.isPending = true;

            const data: ResourceListResponse = {
              items: [resource],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
              },
            };

            render(
              <TestWrapper user={user}>
                <ResourceList
                  data={data}
                  isLoading={false}
                  error={null}
                />
              </TestWrapper>
            );

            // Click delete button
            const deleteButton = screen.getByText('Delete');
            fireEvent.click(deleteButton);

            // Should show loading state in confirmation modal
            expect(screen.getByText('Loading...')).toBeInTheDocument();
            
            // Buttons should be disabled during loading
            const cancelButton = screen.getByText('Cancel');
            const confirmButton = screen.getByRole('button', { name: /Loading/ });
            
            expect(cancelButton).toBeDisabled();
            expect(confirmButton).toBeDisabled();
          }
        ),
        { numRuns: 5 }
      );
    });
  });
});