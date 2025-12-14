import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import ResourceList from '../ResourceList';
import type { Resource, ResourceListResponse, User } from '../../../types';

// Mock the hooks
vi.mock('../../../hooks/useResources', () => ({
  useDeleteResource: () => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
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
    role: 'VIEWER',
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

describe('ResourceList Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Generators for property-based testing
  const resourceTypeArb = fc.constantFrom('Article', 'Video', 'Tutorial');
  const resourceStatusArb = fc.constantFrom('Draft', 'Published', 'Archived');
  const userRoleArb = fc.constantFrom('CONTENT_MANAGER', 'VIEWER');

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

  const userArb = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    email: fc.emailAddress(),
    role: userRoleArb,
    createdAt: fc.integer({ min: 1577836800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
    updatedAt: fc.integer({ min: 1577836800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
  });

  const resourceListResponseArb = fc.record({
    items: fc.array(resourceArb, { minLength: 0, maxLength: 20 }),
    pagination: fc.record({
      page: fc.integer({ min: 1, max: 10 }),
      limit: fc.integer({ min: 1, max: 50 }),
      total: fc.integer({ min: 0, max: 1000 }),
      totalPages: fc.integer({ min: 0, max: 100 }),
    }),
  });

  describe('Property 20: VIEWER resource list display', () => {
    /**
     * **Feature: frontend-resource-manager, Property 20: VIEWER resource list display**
     * For any VIEWER accessing the resources page, the application should display 
     * a paginated list of published resources
     * **Validates: Requirements 5.1**
     */
    it('should display resource list for VIEWER users without edit/delete actions', () => {
      fc.assert(
        fc.property(
          resourceListResponseArb,
          userArb.filter(user => user.role === 'VIEWER'),
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

            // Should display all resources
            data.items.forEach(resource => {
              expect(screen.getByText(resource.title)).toBeInTheDocument();
              expect(screen.getByText(resource.description)).toBeInTheDocument();
            });

            // Should not display edit/delete buttons for VIEWER
            expect(screen.queryByText('Edit')).not.toBeInTheDocument();
            expect(screen.queryByText('Delete')).not.toBeInTheDocument();
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should display edit/delete actions for CONTENT_MANAGER users', () => {
      fc.assert(
        fc.property(
          resourceListResponseArb.filter(data => data.items.length > 0),
          userArb.filter(user => user.role === 'CONTENT_MANAGER'),
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

            // Should display edit/delete buttons for CONTENT_MANAGER
            const editButtons = screen.getAllByText('Edit');
            const deleteButtons = screen.getAllByText('Delete');
            
            expect(editButtons).toHaveLength(data.items.length);
            expect(deleteButtons).toHaveLength(data.items.length);
          }
        ),
        { numRuns: 5 }
      );
    });
  });

  describe('Property 25: Complete resource detail display', () => {
    /**
     * **Feature: frontend-resource-manager, Property 25: Complete resource detail display**
     * For any resource clicked by a user, the application should display 
     * the complete resource details including all fields
     * **Validates: Requirements 6.1**
     */
    it('should display all resource fields in resource cards', () => {
      const resource: Resource = {
        id: 'test-id',
        title: 'Test Resource',
        description: 'Test Description',
        type: 'Article',
        url: 'https://example.com',
        tags: 'test, example',
        status: 'Published',
        createdByUserId: '1',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const data: ResourceListResponse = {
        items: [resource],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      const user: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'VIEWER',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
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

      // Should display title and description
      expect(screen.getByText(resource.title)).toBeInTheDocument();
      expect(screen.getByText(resource.description)).toBeInTheDocument();
      
      // Should display type and status badges
      expect(screen.getByText(resource.type)).toBeInTheDocument();
      expect(screen.getByText(resource.status)).toBeInTheDocument();
      
      // Should display URL as clickable link
      const urlLink = screen.getByRole('link', { name: resource.url });
      expect(urlLink).toBeInTheDocument();
      expect(urlLink).toHaveAttribute('href', resource.url);
      expect(urlLink).toHaveAttribute('target', '_blank');
      
      // Should display creation date
      const createdDate = new Date(resource.createdAt).toLocaleDateString();
      expect(screen.getByText(createdDate)).toBeInTheDocument();
    });
  });

  describe('Property 27: Tag display formatting', () => {
    /**
     * **Feature: frontend-resource-manager, Property 27: Tag display formatting**
     * For any resource with tags, the application should display them in a readable format
     * **Validates: Requirements 6.3**
     */
    it('should format and display tags correctly', () => {
      const tags = ['react', 'typescript', 'testing'];
      const tagsString = tags.join(', ');
      const resource: Resource = {
        id: '1',
        title: 'Test Resource',
        description: 'Test Description',
        type: 'Article',
        url: 'https://example.com',
        tags: tagsString,
        status: 'Published',
        createdByUserId: '1',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const data: ResourceListResponse = {
        items: [resource],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      const user: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'VIEWER',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
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

      // Each tag should be displayed as a separate element
      tags.forEach(tag => {
        expect(screen.getByText(tag.trim())).toBeInTheDocument();
      });
    });
  });

  describe('Property 33: API loading indicators', () => {
    /**
     * **Feature: frontend-resource-manager, Property 33: API loading indicators**
     * For any API request in progress, the application should display loading indicators to inform users
     * **Validates: Requirements 9.1**
     */
    it('should display loading skeleton when isLoading is true', () => {
      const user: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'VIEWER',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      render(
        <TestWrapper user={user}>
          <ResourceList
            data={undefined}
            isLoading={true}
            error={null}
          />
        </TestWrapper>
      );

      // Should display loading skeletons
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Property 34: API error message display', () => {
    /**
     * **Feature: frontend-resource-manager, Property 34: API error message display**
     * For any failed API request, the application should display user-friendly error messages 
     * with actionable information
     * **Validates: Requirements 9.2**
     */
    it('should display error message when error occurs', () => {
      const errorMessage = 'Network connection failed';
      const error = new Error(errorMessage);
      const user: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'VIEWER',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };
      
      render(
        <TestWrapper user={user}>
          <ResourceList
            data={undefined}
            isLoading={false}
            error={error}
            onRefresh={vi.fn()}
          />
        </TestWrapper>
      );

      // Should display error message
      expect(screen.getByText('Failed to load resources')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      
      // Should display retry button
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });
  });

  describe('Empty state handling', () => {
    it('should display appropriate empty state for CONTENT_MANAGER', () => {
      const user: User = {
        id: '1',
        name: 'Content Manager',
        email: 'cm@example.com',
        role: 'CONTENT_MANAGER',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const emptyData: ResourceListResponse = {
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      render(
        <TestWrapper user={user}>
          <ResourceList
            data={emptyData}
            isLoading={false}
            error={null}
          />
        </TestWrapper>
      );

      // Should display empty state message
      expect(screen.getByText('No resources found')).toBeInTheDocument();
      expect(screen.getByText('Create Resource')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating your first resource.')).toBeInTheDocument();
    });

    it('should display appropriate empty state for VIEWER', () => {
      const user: User = {
        id: '1',
        name: 'Viewer',
        email: 'viewer@example.com',
        role: 'VIEWER',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const emptyData: ResourceListResponse = {
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      render(
        <TestWrapper user={user}>
          <ResourceList
            data={emptyData}
            isLoading={false}
            error={null}
          />
        </TestWrapper>
      );

      // Should display empty state message
      expect(screen.getByText('No resources found')).toBeInTheDocument();
      expect(screen.getByText('No resources are available at the moment.')).toBeInTheDocument();
      expect(screen.queryByText('Create Resource')).not.toBeInTheDocument();
    });
  });

  describe('User interaction properties', () => {
    it('should handle edit button clicks for CONTENT_MANAGER', async () => {
      const user: User = {
        id: '1',
        name: 'Content Manager',
        email: 'cm@example.com',
        role: 'CONTENT_MANAGER',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const resource: Resource = {
        id: 'test-resource-id',
        title: 'Test Resource',
        description: 'Test Description',
        type: 'Article',
        url: 'https://example.com',
        tags: 'test, example',
        status: 'Published',
        createdByUserId: '1',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

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

      // Click edit button
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);

      // Should navigate to edit page
      expect(mockNavigate).toHaveBeenCalledWith('/resources/test-resource-id/edit');
    });

    it('should handle delete confirmation flow for CONTENT_MANAGER', async () => {
      const user: User = {
        id: '1',
        name: 'Content Manager',
        email: 'cm@example.com',
        role: 'CONTENT_MANAGER',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const resource: Resource = {
        id: 'test-resource-id',
        title: 'Test Resource',
        description: 'Test Description',
        type: 'Article',
        url: 'https://example.com',
        tags: 'test, example',
        status: 'Published',
        createdByUserId: '1',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

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

      // Should show confirmation modal
      await waitFor(() => {
        expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to archive this resource/)).toBeInTheDocument();
      });

      // Should have cancel and confirm buttons
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });
  });
});