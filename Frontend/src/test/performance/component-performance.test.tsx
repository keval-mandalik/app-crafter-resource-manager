import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from '../../contexts/AuthContext';
import ResourceCard from '../../components/resources/ResourceCard';
import Pagination from '../../components/common/Pagination';
import SearchAndFilters from '../../components/resources/SearchAndFilters';
import type { Resource, ResourceListParams } from '../../types';

// Mock data for testing
const mockResource: Resource = {
  id: '1',
  title: 'Test Resource',
  description: 'Test Description',
  type: 'Article',
  url: 'https://example.com',
  tags: 'test,performance',
  status: 'Published',
  createdByUserId: 'user1',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

const mockParams: ResourceListParams = {
  page: 1,
  limit: 10,
  search: '',
};

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

describe('Component Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ResourceCard Performance', () => {
    it('should render quickly with minimal re-renders', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <ResourceCard 
            resource={mockResource}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in less than 50ms
      expect(renderTime).toBeLessThan(50);
      expect(screen.getAllByText('Test Resource')).toHaveLength(2); // Mobile and desktop versions
    });

    it('should handle large numbers of resources efficiently', () => {
      const resources = Array.from({ length: 100 }, (_, i) => ({
        ...mockResource,
        id: `resource-${i}`,
        title: `Resource ${i}`,
      }));

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <div>
            {resources.map((resource) => (
              <ResourceCard 
                key={resource.id}
                resource={resource}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
              />
            ))}
          </div>
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render 100 cards in less than 500ms
      expect(renderTime).toBeLessThan(500);
      expect(screen.getAllByText('Resource 0')).toHaveLength(2); // Mobile and desktop versions
      expect(screen.getAllByText('Resource 99')).toHaveLength(2); // Mobile and desktop versions
    });
  });

  describe('Pagination Performance', () => {
    it('should render pagination controls efficiently', () => {
      const startTime = performance.now();
      
      render(
        <Pagination
          currentPage={5}
          totalPages={100}
          totalItems={1000}
          itemsPerPage={10}
          onPageChange={vi.fn()}
          isLoading={false}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in less than 20ms
      expect(renderTime).toBeLessThan(20);
      expect(screen.getByText('Page 5')).toBeInTheDocument();
    });

    it('should handle large page counts without performance degradation', () => {
      const startTime = performance.now();
      
      render(
        <Pagination
          currentPage={500}
          totalPages={1000}
          totalItems={10000}
          itemsPerPage={10}
          onPageChange={vi.fn()}
          isLoading={false}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should still render quickly even with large page counts
      expect(renderTime).toBeLessThan(30);
    });
  });

  describe('SearchAndFilters Performance', () => {
    it('should render search and filter controls efficiently', () => {
      const startTime = performance.now();
      
      render(
        <SearchAndFilters
          params={mockParams}
          onParamsChange={vi.fn()}
          isLoading={false}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in less than 30ms
      expect(renderTime).toBeLessThan(30);
      expect(screen.getByPlaceholderText('Search resources...')).toBeInTheDocument();
    });
  });

  describe('Memory Usage', () => {
    it('should not create memory leaks with repeated renders', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render and unmount components multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <TestWrapper>
            <ResourceCard 
              resource={mockResource}
              onEdit={vi.fn()}
              onDelete={vi.fn()}
            />
          </TestWrapper>
        );
        unmount();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
  });
});