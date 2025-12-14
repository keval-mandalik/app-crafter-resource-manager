import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import ResourceDetailPage from '../ResourceDetailPage';
import { AuthProvider } from '../../contexts/AuthContext';
import type { Resource, Activity, ResourceType, ResourceStatus, ActionType } from '../../types';

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
const actionTypeArb = fc.constantFrom('CREATE', 'UPDATE', 'DELETE', 'VIEW') as fc.Arbitrary<ActionType>;

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

const activityArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  userId: fc.string({ minLength: 1, maxLength: 50 }),
  resourceId: fc.string({ minLength: 1, maxLength: 50 }),
  actionType: actionTypeArb,
  details: fc.option(fc.dictionary(fc.string(), fc.anything()), { nil: null }),
  ipAddress: fc.option(fc.ipV4(), { nil: null }),
  userAgent: fc.option(fc.string(), { nil: null }),
  createdAt: fc.date().map(d => d.toISOString()),
  user: fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    email: fc.emailAddress(),
    role: fc.string({ minLength: 1, maxLength: 50 }),
  }),
  resource: fc.option(fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    title: fc.string({ minLength: 1, maxLength: 200 }),
    type: fc.string({ minLength: 1, maxLength: 50 }),
    status: fc.string({ minLength: 1, maxLength: 50 }),
  }), { nil: null }),
}) as fc.Arbitrary<Activity>;

describe('ResourceDetailPage Activity Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  /**
   * **Feature: frontend-resource-manager, Property 30: Activity data fetching and display**
   * For any activity tab selection, the application should fetch and display chronological activity data from the backend
   * **Validates: Requirements 7.2**
   */
  it('Property 30: fetches and displays activity data when activity tab is selected', () => {
    fc.assert(
      fc.property(
        resourceArb,
        fc.array(activityArb, { minLength: 1, maxLength: 5 }),
        (resource, activities) => {
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

          // Mock successful activities loading
          mockUseResourceActivities.mockReturnValue({
            data: { 
              items: activities, 
              pagination: { page: 1, limit: 20, total: activities.length, totalPages: 1 } 
            },
            isLoading: false,
            error: null,
          } as any);

          render(
            <TestWrapper>
              <ResourceDetailPage />
            </TestWrapper>
          );

          // Click on Activity tab
          const activityTab = screen.getByRole('button', { name: 'Activity' });
          fireEvent.click(activityTab);

          // Verify activity history section is displayed
          expect(screen.getByText('Activity History')).toBeInTheDocument();

          // Verify activities are displayed
          activities.forEach(activity => {
            expect(screen.getByText(activity.actionType)).toBeInTheDocument();
            expect(screen.getByText(activity.user.name)).toBeInTheDocument();
            expect(screen.getByText(`(${activity.user.email})`)).toBeInTheDocument();
          });

          cleanup();
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 31: Activity entry information completeness**
   * For any activity display, the application should show the action type, user, and timestamp for each entry
   * **Validates: Requirements 7.3**
   */
  it('Property 31: displays complete information for each activity entry', () => {
    fc.assert(
      fc.property(
        resourceArb,
        activityArb,
        (resource, activity) => {
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

          // Mock successful activities loading with single activity
          mockUseResourceActivities.mockReturnValue({
            data: { 
              items: [activity], 
              pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } 
            },
            isLoading: false,
            error: null,
          } as any);

          render(
            <TestWrapper>
              <ResourceDetailPage />
            </TestWrapper>
          );

          // Click on Activity tab
          const activityTab = screen.getByRole('button', { name: 'Activity' });
          fireEvent.click(activityTab);

          // Verify action type is displayed with proper styling
          const actionTypeElement = screen.getByText(activity.actionType);
          expect(actionTypeElement).toBeInTheDocument();
          
          // Verify user name is displayed
          expect(screen.getByText(activity.user.name)).toBeInTheDocument();
          
          // Verify user email is displayed
          expect(screen.getByText(`(${activity.user.email})`)).toBeInTheDocument();
          
          // Verify timestamp is displayed (formatted date should be present)
          const formattedDate = new Date(activity.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          expect(screen.getByText(formattedDate)).toBeInTheDocument();

          cleanup();
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 32: Activity loading indicators**
   * For any activity data loading, the application should show loading indicators
   * **Validates: Requirements 7.5**
   */
  it('Property 32: shows loading indicators when activity data is loading', () => {
    fc.assert(
      fc.property(
        resourceArb,
        (resource) => {
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

          // Mock activities loading state
          mockUseResourceActivities.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
          } as any);

          render(
            <TestWrapper>
              <ResourceDetailPage />
            </TestWrapper>
          );

          // Click on Activity tab
          const activityTab = screen.getByRole('button', { name: 'Activity' });
          fireEvent.click(activityTab);

          // Verify loading indicators are displayed
          const loadingElements = document.querySelectorAll('.animate-pulse');
          expect(loadingElements.length).toBeGreaterThan(0);

          cleanup();
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * Additional test: Empty state handling
   * Verifies that empty state is properly displayed when no activities exist
   */
  it('displays empty state when no activities are available', () => {
    fc.assert(
      fc.property(
        resourceArb,
        (resource) => {
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

          // Mock empty activities response
          mockUseResourceActivities.mockReturnValue({
            data: { 
              items: [], 
              pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } 
            },
            isLoading: false,
            error: null,
          } as any);

          render(
            <TestWrapper>
              <ResourceDetailPage />
            </TestWrapper>
          );

          // Click on Activity tab
          const activityTab = screen.getByRole('button', { name: 'Activity' });
          fireEvent.click(activityTab);

          // Verify empty state message is displayed
          expect(screen.getByText('No activity history available for this resource.')).toBeInTheDocument();

          cleanup();
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * Additional test: Error state handling
   * Verifies that error states are properly displayed when activity loading fails
   */
  it('displays error state when activity loading fails', () => {
    fc.assert(
      fc.property(
        resourceArb,
        fc.string({ minLength: 1, maxLength: 200 }),
        (resource, errorMessage) => {
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

          // Mock activities error state
          mockUseResourceActivities.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error(errorMessage),
          } as any);

          render(
            <TestWrapper>
              <ResourceDetailPage />
            </TestWrapper>
          );

          // Click on Activity tab
          const activityTab = screen.getByRole('button', { name: 'Activity' });
          fireEvent.click(activityTab);

          // Verify error message is displayed
          expect(screen.getByText('Error loading activities')).toBeInTheDocument();
          expect(screen.getByText(errorMessage)).toBeInTheDocument();

          cleanup();
        }
      ),
      { numRuns: 5 }
    );
  });
});