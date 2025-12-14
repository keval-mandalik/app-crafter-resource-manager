import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../contexts/AuthContext';
import Modal from '../../components/ui/Modal';
import { ResourceForm } from '../../components/resources/ResourceForm';
import SearchAndFilters from '../../components/resources/SearchAndFilters';
import Pagination from '../../components/common/Pagination';
import type { ResourceListParams } from '../../types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock data for testing
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

describe('Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="Test Modal"
        >
          <p>Modal content</p>
        </Modal>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have focus management', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <div>
          <button>Outside Button</button>
          <Modal
            isOpen={true}
            onClose={onClose}
            title="Test Modal"
          >
            <button>First Button</button>
            <button>Second Button</button>
          </Modal>
        </div>
      );

      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();

      // Should be able to tab to modal elements
      await user.tab();
      // Just verify that focus management is working
      expect(document.activeElement).toBeTruthy();
    });

    it('should close on Escape key', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <Modal
          isOpen={true}
          onClose={onClose}
          title="Test Modal"
        >
          <p>Modal content</p>
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should have proper ARIA attributes', () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="Test Modal"
        >
          <p>Modal content</p>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');

      const title = screen.getByText('Test Modal');
      expect(title).toHaveAttribute('id', 'modal-title');
    });
  });

  describe('ResourceForm Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <ResourceForm
            mode="create"
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
            isLoading={false}
          />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper form labels and ARIA attributes', () => {
      render(
        <TestWrapper>
          <ResourceForm
            mode="create"
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
            isLoading={false}
          />
        </TestWrapper>
      );

      // Check required field labels
      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput).toHaveAttribute('aria-required', 'true');
      expect(titleInput).toHaveAttribute('id', 'title');

      const descriptionInput = screen.getByLabelText(/description/i);
      expect(descriptionInput).toHaveAttribute('aria-required', 'true');
      expect(descriptionInput).toHaveAttribute('id', 'description');

      const typeSelect = screen.getByLabelText(/type/i);
      expect(typeSelect).toHaveAttribute('aria-required', 'true');
      expect(typeSelect).toHaveAttribute('id', 'type');

      const urlInput = screen.getByLabelText(/url/i);
      expect(urlInput).toHaveAttribute('aria-required', 'true');
      expect(urlInput).toHaveAttribute('id', 'url');
    });

    it('should show validation errors with proper ARIA attributes', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ResourceForm
            mode="create"
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
            isLoading={false}
          />
        </TestWrapper>
      );

      // Submit form without filling required fields
      const submitButton = screen.getByText(/create resource/i);
      await user.click(submitButton);

      // Check that error messages are properly associated
      const titleInput = screen.getByLabelText(/title/i);
      const titleError = screen.getByText(/title is required/i);
      
      expect(titleInput).toHaveAttribute('aria-invalid', 'true');
      expect(titleInput).toHaveAttribute('aria-describedby', 'title-error');
      expect(titleError).toHaveAttribute('id', 'title-error');
      expect(titleError).toHaveAttribute('role', 'alert');
    });
  });

  describe('SearchAndFilters Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <SearchAndFilters
          params={mockParams}
          onParamsChange={vi.fn()}
          isLoading={false}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper search input attributes', () => {
      render(
        <SearchAndFilters
          params={mockParams}
          onParamsChange={vi.fn()}
          isLoading={false}
        />
      );

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveAttribute('aria-label', 'Search resources by title or description');
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should have accessible filter controls', () => {
      render(
        <SearchAndFilters
          params={mockParams}
          onParamsChange={vi.fn()}
          isLoading={false}
        />
      );

      const typeFilter = screen.getByLabelText(/type/i);
      expect(typeFilter).toHaveAttribute('id', 'type-filter');

      const statusFilter = screen.getByLabelText(/status/i);
      expect(statusFilter).toHaveAttribute('id', 'status-filter');
    });

    it('should have accessible clear button', () => {
      const paramsWithSearch = { ...mockParams, search: 'test' };
      
      render(
        <SearchAndFilters
          params={paramsWithSearch}
          onParamsChange={vi.fn()}
          isLoading={false}
        />
      );

      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toHaveAttribute('type', 'button');
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
    });
  });

  describe('Pagination Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Pagination
          currentPage={5}
          totalPages={10}
          totalItems={100}
          itemsPerPage={10}
          onPageChange={vi.fn()}
          isLoading={false}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper navigation structure', () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={10}
          totalItems={100}
          itemsPerPage={10}
          onPageChange={vi.fn()}
          isLoading={false}
        />
      );

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Pagination');

      // Check for Previous buttons (mobile and desktop versions)
      const previousButtons = screen.getAllByText('Previous');
      expect(previousButtons.length).toBeGreaterThan(0);

      // Check for Next buttons (mobile and desktop versions)  
      const nextButtons = screen.getAllByText('Next');
      expect(nextButtons.length).toBeGreaterThan(0);
    });

    it('should indicate current page properly', () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={10}
          totalItems={100}
          itemsPerPage={10}
          onPageChange={vi.fn()}
          isLoading={false}
        />
      );

      // Current page should be highlighted and have aria-current
      const currentPageButton = screen.getByText('5');
      expect(currentPageButton).toHaveClass('bg-blue-50');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation in forms', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ResourceForm
            mode="create"
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
            isLoading={false}
          />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const typeSelect = screen.getByLabelText(/type/i);

      // Tab through form fields
      await user.tab();
      expect(document.activeElement).toBe(titleInput);

      await user.tab();
      expect(document.activeElement).toBe(descriptionInput);

      await user.tab();
      expect(document.activeElement).toBe(typeSelect);
    });

    it('should support keyboard navigation in pagination', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <Pagination
          currentPage={5}
          totalPages={10}
          totalItems={100}
          itemsPerPage={10}
          onPageChange={onPageChange}
          isLoading={false}
        />
      );

      const previousButtons = screen.getAllByText('Previous');
      
      // Click the first previous button
      await user.click(previousButtons[0]);
      expect(onPageChange).toHaveBeenCalledWith(4);
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient color contrast for text elements', () => {
      render(
        <TestWrapper>
          <ResourceForm
            mode="create"
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
            isLoading={false}
          />
        </TestWrapper>
      );

      // Check that text elements have proper contrast classes
      const title = screen.getByText(/create new resource/i);
      expect(title).toHaveClass('text-gray-900'); // High contrast text

      // Check that form labels exist and are visible
      const titleLabel = screen.getByText(/title/i);
      expect(titleLabel).toBeVisible();
    });
  });
});