import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import ResourceDetailPage from '../ResourceDetailPage';
import { AuthProvider } from '../../contexts/AuthContext';
import type { Resource, ResourceType, ResourceStatus } from '../../types';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

// Mock the hooks to control their behavior
vi.mock('../../hooks/useResources', () => ({
  useResource: vi.fn(),
}));

vi.mock('../../hooks/useActivities', () => ({
  useResourceActivities: vi.fn(),
}));

import { useParams } from 'react-router-dom';
import { useResource } from '../../hooks/useResources';
import { useResourceActivities } from '../../hooks/useActivities';

const mockUseParams = vi.mocked(useParams);
const mockUseResource = vi.mocked(useResource);
const mockUseResourceActivities = vi.mocked(useResourceActivities);

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Generators for property-based testing
const resourceTypeArb = fc.constantFrom('Article', 'Video', 'Tutorial') as fc.Arbitrary<ResourceType>;
const resourceStatusArb = fc.constantFrom('Draft', 'Published', 'Archived') as fc.Arbitrary<ResourceStatus>;

const resourceArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  description: fc.string({ minLength: 1, maxLength: 1000 }),
  type: resourceTypeArb,
  url: fc.webUrl(),
  tags: fc.string({ maxLength: 200 }),
  status: resourceStatusArb,
  createdByUserId: fc.string({ minLength: 1, maxLength: 50 }),
  createdAt: fc.date().map(d => d.toISOString()),
  updatedAt: fc.date().map(d => d.toISOString()),
}) as fc.Arbitrary<Resource>;

describe('ResourceDetailPage Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  /**
   * **Feature: frontend-resource-manager, Property 25: Complete resource detail display**
   * For any resource clicked by a user, the application should display the complete resource details including all fields
   * **Validates: Requirements 6.1**
   */
  it('Property 25: displays complete resource details for any valid resource', () => {
    fc.assert(
      fc.property(resourceArb, (resource) => {
        // Mock useParams to return the resource ID
        mockUseParams.mockReturnValue({ id: resource.id });

        // Mock successful resource loading
        mockUseResource.mockReturnValue({
          data: resource,
          isLoading: false,
          error: null,
          isError: false,
          isSuccess: true,
        } as any);

        mockUseResourceActivities.mockReturnValue({
          data: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
          isLoading: false,
          error: null,
        } as any);

        render(
          <TestWrapper>
            <ResourceDetailPage />
          </TestWrapper>
        );

        // Verify all resource fields are displayed
        expect(screen.getByText(resource.title)).toBeInTheDocument();
        expect(screen.getByText(resource.description)).toBeInTheDocument();
        expect(screen.getByText(resource.status)).toBeInTheDocument();
        expect(screen.getByText(resource.type)).toBeInTheDocument();
        
        // Verify URL is displayed and clickable
        const urlLink = screen.getByRole('link', { name: resource.url });
        expect(urlLink).toBeInTheDocument();
        expect(urlLink).toHaveAttribute('href', resource.url);
        expect(urlLink).toHaveAttribute('target', '_blank');
        
        cleanup();
      }),
      { numRuns: 5 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 26: Metadata display completeness**
   * For any resource detail view, the application should show creation and update timestamps with user information
   * **Validates: Requirements 6.2**
   */
  it('Property 26: displays complete metadata including timestamps and user information', () => {
    fc.assert(
      fc.property(resourceArb, (resource) => {
        // Mock useParams to return the resource ID
        mockUseParams.mockReturnValue({ id: resource.id });

        mockUseResource.mockReturnValue({
          data: resource,
          isLoading: false,
          error: null,
          isError: false,
          isSuccess: true,
        } as any);

        mockUseResourceActivities.mockReturnValue({
          data: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
          isLoading: false,
          error: null,
        } as any);

        render(
          <TestWrapper>
            <ResourceDetailPage />
          </TestWrapper>
        );

        // Verify metadata section exists
        expect(screen.getByText('Metadata')).toBeInTheDocument();
        
        // Verify creation and update timestamps are displayed
        expect(screen.getByText('Created')).toBeInTheDocument();
        expect(screen.getByText('Last Updated')).toBeInTheDocument();
        
        // Verify user information is displayed
        expect(screen.getByText('Created By')).toBeInTheDocument();
        expect(screen.getByText(`User ID: ${resource.createdByUserId}`)).toBeInTheDocument();
        
        // Verify resource ID is displayed
        expect(screen.getByText('Resource ID')).toBeInTheDocument();
        expect(screen.getByText(resource.id)).toBeInTheDocument();
        
        cleanup();
      }),
      { numRuns: 5 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 27: Tag display formatting**
   * For any resource with tags, the application should display them in a readable format
   * **Validates: Requirements 6.3**
   */
  it('Property 27: displays tags in readable format when tags are present', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 50 }),
          title: fc.string({ minLength: 1, maxLength: 200 }),
          description: fc.string({ minLength: 1, maxLength: 1000 }),
          type: resourceTypeArb,
          url: fc.webUrl(),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 })
            .map(tags => tags.join(', ')),
          status: resourceStatusArb,
          createdByUserId: fc.string({ minLength: 1, maxLength: 50 }),
          createdAt: fc.date().map(d => d.toISOString()),
          updatedAt: fc.date().map(d => d.toISOString()),
        }),
        (resource) => {
          // Mock useParams to return the resource ID
          mockUseParams.mockReturnValue({ id: resource.id });

          mockUseResource.mockReturnValue({
            data: resource,
            isLoading: false,
            error: null,
            isError: false,
            isSuccess: true,
          } as any);

          mockUseResourceActivities.mockReturnValue({
            data: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
            isLoading: false,
            error: null,
          } as any);

          render(
            <TestWrapper>
              <ResourceDetailPage />
            </TestWrapper>
          );

          if (resource.tags && resource.tags.trim()) {
            // Verify Tags section exists when tags are present
            expect(screen.getByText('Tags')).toBeInTheDocument();
            
            // Verify individual tags are displayed as badges
            const expectedTags = resource.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            expectedTags.forEach(tag => {
              expect(screen.getByText(tag)).toBeInTheDocument();
            });
          }
          
          cleanup();
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 28: URL clickability**
   * For any resource URL displayed, the application should make it clickable to open in a new tab
   * **Validates: Requirements 6.4**
   */
  it('Property 28: makes resource URL clickable to open in new tab', () => {
    fc.assert(
      fc.property(resourceArb, (resource) => {
        // Mock useParams to return the resource ID
        mockUseParams.mockReturnValue({ id: resource.id });

        mockUseResource.mockReturnValue({
          data: resource,
          isLoading: false,
          error: null,
          isError: false,
          isSuccess: true,
        } as any);

        mockUseResourceActivities.mockReturnValue({
          data: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
          isLoading: false,
          error: null,
        } as any);

        render(
          <TestWrapper>
            <ResourceDetailPage />
          </TestWrapper>
        );

        // Find the URL link
        const urlLink = screen.getByRole('link', { name: resource.url });
        
        // Verify it's clickable and opens in new tab
        expect(urlLink).toBeInTheDocument();
        expect(urlLink).toHaveAttribute('href', resource.url);
        expect(urlLink).toHaveAttribute('target', '_blank');
        expect(urlLink).toHaveAttribute('rel', 'noopener noreferrer');
        
        cleanup();
      }),
      { numRuns: 5 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 29: Resource detail loading states**
   * For any resource detail loading, the application should show loading states during API requests
   * **Validates: Requirements 6.5**
   */
  it('Property 29: shows loading states during resource data fetching', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 50 }), (resourceId) => {
        // Mock useParams to return the resource ID
        mockUseParams.mockReturnValue({ id: resourceId });

        // Mock loading state
        mockUseResource.mockReturnValue({
          data: undefined,
          isLoading: true,
          error: null,
          isError: false,
          isSuccess: false,
        } as any);

        mockUseResourceActivities.mockReturnValue({
          data: undefined,
          isLoading: false,
          error: null,
        } as any);

        render(
          <TestWrapper>
            <ResourceDetailPage />
          </TestWrapper>
        );

        // Verify loading skeleton is displayed by checking for animate-pulse class
        const animatedElements = document.querySelectorAll('.animate-pulse');
        expect(animatedElements.length).toBeGreaterThan(0);
        
        cleanup();
      }),
      { numRuns: 5 }
    );
  });
});