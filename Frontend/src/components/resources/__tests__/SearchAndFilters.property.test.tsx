import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import SearchAndFilters from '../SearchAndFilters';
import type { ResourceListParams } from '../../../types';

describe('SearchAndFilters Property Tests', () => {
  const mockOnParamsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Generators for property-based testing
  const resourceTypeArb = fc.constantFrom('Article', 'Video', 'Tutorial');
  const resourceStatusArb = fc.constantFrom('Draft', 'Published', 'Archived');

  const resourceListParamsArb = fc.record({
    page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
    limit: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
    search: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
    type: fc.option(resourceTypeArb, { nil: undefined }),
    status: fc.option(resourceStatusArb, { nil: undefined }),
  });

  describe('Property 21: Search filtering functionality', () => {
    /**
     * **Feature: frontend-resource-manager, Property 21: Search filtering functionality**
     * For any search terms entered by a VIEWER, the application should filter resources 
     * by title and description content
     * **Validates: Requirements 5.2**
     */
    it('should trigger search parameter updates with debounced input', async () => {
      const user = userEvent.setup();
      
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          resourceListParamsArb,
          async (searchTerm, initialParams) => {
            render(
              <SearchAndFilters
                params={initialParams}
                onParamsChange={mockOnParamsChange}
                isLoading={false}
              />
            );

            const searchInput = screen.getByPlaceholderText(/Search resources/);
            
            // Clear any existing value and type new search term
            await user.clear(searchInput);
            await user.type(searchInput, searchTerm);

            // Wait for debounce (300ms + buffer)
            await waitFor(
              () => {
                expect(mockOnParamsChange).toHaveBeenCalledWith({
                  ...initialParams,
                  search: searchTerm,
                  page: 1, // Should reset to page 1
                });
              },
              { timeout: 500 }
            );
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup();
      
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          resourceListParamsArb,
          async (searchTerm, initialParams) => {
            const paramsWithSearch = { ...initialParams, search: searchTerm };
            
            render(
              <SearchAndFilters
                params={paramsWithSearch}
                onParamsChange={mockOnParamsChange}
                isLoading={false}
              />
            );

            const searchInput = screen.getByDisplayValue(searchTerm);
            expect(searchInput).toBeInTheDocument();

            // Find and click the clear button (X icon)
            const clearButton = searchInput.parentElement?.querySelector('button');
            if (clearButton) {
              await user.click(clearButton);
              
              // Should clear the input
              expect(searchInput).toHaveValue('');
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 22: Type filtering functionality', () => {
    /**
     * **Feature: frontend-resource-manager, Property 22: Type filtering functionality**
     * For any type filter selection, the application should display only resources 
     * matching the selected types
     * **Validates: Requirements 5.3**
     */
    it('should update type filter when selection changes', async () => {
      const user = userEvent.setup();
      
      await fc.assert(
        fc.asyncProperty(
          resourceTypeArb,
          resourceListParamsArb,
          async (selectedType, initialParams) => {
            render(
              <SearchAndFilters
                params={initialParams}
                onParamsChange={mockOnParamsChange}
                isLoading={false}
              />
            );

            const typeSelect = screen.getByLabelText(/Type:/);
            
            // Select the type
            await user.selectOptions(typeSelect, selectedType);

            expect(mockOnParamsChange).toHaveBeenCalledWith({
              ...initialParams,
              type: selectedType,
              page: 1, // Should reset to page 1
            });
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should clear type filter when "All Types" is selected', async () => {
      const user = userEvent.setup();
      
      await fc.assert(
        fc.asyncProperty(
          resourceTypeArb,
          resourceListParamsArb,
          async (initialType, initialParams) => {
            const paramsWithType = { ...initialParams, type: initialType };
            
            render(
              <SearchAndFilters
                params={paramsWithType}
                onParamsChange={mockOnParamsChange}
                isLoading={false}
              />
            );

            const typeSelect = screen.getByLabelText(/Type:/);
            
            // Select "All Types"
            await user.selectOptions(typeSelect, 'all');

            expect(mockOnParamsChange).toHaveBeenCalledWith({
              ...paramsWithType,
              type: undefined,
              page: 1,
            });
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 23: Status filtering functionality', () => {
    /**
     * **Feature: frontend-resource-manager, Property 23: Status filtering functionality**
     * For any status filter selection, the application should display only resources 
     * matching the selected statuses
     * **Validates: Requirements 5.4**
     */
    it('should update status filter when selection changes', async () => {
      const user = userEvent.setup();
      
      await fc.assert(
        fc.asyncProperty(
          resourceStatusArb,
          resourceListParamsArb,
          async (selectedStatus, initialParams) => {
            render(
              <SearchAndFilters
                params={initialParams}
                onParamsChange={mockOnParamsChange}
                isLoading={false}
              />
            );

            const statusSelect = screen.getByLabelText(/Status:/);
            
            // Select the status
            await user.selectOptions(statusSelect, selectedStatus);

            expect(mockOnParamsChange).toHaveBeenCalledWith({
              ...initialParams,
              status: selectedStatus,
              page: 1, // Should reset to page 1
            });
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should clear status filter when "All Statuses" is selected', async () => {
      const user = userEvent.setup();
      
      await fc.assert(
        fc.asyncProperty(
          resourceStatusArb,
          resourceListParamsArb,
          async (initialStatus, initialParams) => {
            const paramsWithStatus = { ...initialParams, status: initialStatus };
            
            render(
              <SearchAndFilters
                params={paramsWithStatus}
                onParamsChange={mockOnParamsChange}
                isLoading={false}
              />
            );

            const statusSelect = screen.getByLabelText(/Status:/);
            
            // Select "All Statuses"
            await user.selectOptions(statusSelect, 'all');

            expect(mockOnParamsChange).toHaveBeenCalledWith({
              ...paramsWithStatus,
              status: undefined,
              page: 1,
            });
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 24: Real-time filter updates', () => {
    /**
     * **Feature: frontend-resource-manager, Property 24: Real-time filter updates**
     * For any search or filter criteria change, the application should update 
     * the results immediately without page reload
     * **Validates: Requirements 5.5**
     */
    it('should update filters in real-time without page reload', async () => {
      const user = userEvent.setup();
      
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 30 }),
          resourceTypeArb,
          resourceStatusArb,
          async (searchTerm, type, status) => {
            const initialParams: ResourceListParams = { page: 1, limit: 10 };
            
            render(
              <SearchAndFilters
                params={initialParams}
                onParamsChange={mockOnParamsChange}
                isLoading={false}
              />
            );

            // Apply search filter
            const searchInput = screen.getByPlaceholderText(/Search resources/);
            await user.type(searchInput, searchTerm);

            // Apply type filter
            const typeSelect = screen.getByLabelText(/Type:/);
            await user.selectOptions(typeSelect, type);

            // Apply status filter
            const statusSelect = screen.getByLabelText(/Status:/);
            await user.selectOptions(statusSelect, status);

            // Wait for debounced search
            await waitFor(
              () => {
                // Should have been called multiple times for each filter change
                expect(mockOnParamsChange).toHaveBeenCalled();
                
                // The last call should include all filters
                const lastCall = mockOnParamsChange.mock.calls[mockOnParamsChange.mock.calls.length - 1][0];
                expect(lastCall).toMatchObject({
                  type,
                  status,
                  page: 1,
                });
              },
              { timeout: 500 }
            );
          }
        ),
        { numRuns: 15 }
      );
    });
  });

  describe('Clear filters functionality', () => {
    it('should clear all filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 30 }),
          resourceTypeArb,
          resourceStatusArb,
          fc.integer({ min: 10, max: 50 }),
          async (searchTerm, type, status, limit) => {
            const paramsWithFilters: ResourceListParams = {
              page: 2,
              limit,
              search: searchTerm,
              type,
              status,
            };
            
            render(
              <SearchAndFilters
                params={paramsWithFilters}
                onParamsChange={mockOnParamsChange}
                isLoading={false}
              />
            );

            // Should show active filters
            expect(screen.getByText('Active filters:')).toBeInTheDocument();
            expect(screen.getByText(`Search: "${searchTerm}"`)).toBeInTheDocument();
            expect(screen.getByText(`Type: ${type}`)).toBeInTheDocument();
            expect(screen.getByText(`Status: ${status}`)).toBeInTheDocument();

            // Click clear filters button
            const clearButton = screen.getByText('Clear Filters');
            await user.click(clearButton);

            expect(mockOnParamsChange).toHaveBeenCalledWith({
              page: 1,
              limit,
            });
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Loading state handling', () => {
    it('should disable inputs when loading', () => {
      fc.assert(
        fc.property(resourceListParamsArb, (params) => {
          render(
            <SearchAndFilters
              params={params}
              onParamsChange={mockOnParamsChange}
              isLoading={true}
            />
          );

          // All inputs should be disabled
          const searchInput = screen.getByPlaceholderText(/Search resources/);
          const typeSelect = screen.getByLabelText(/Type:/);
          const statusSelect = screen.getByLabelText(/Status:/);

          expect(searchInput).toBeDisabled();
          expect(typeSelect).toBeDisabled();
          expect(statusSelect).toBeDisabled();

          // Should show loading indicator
          expect(screen.getByText('Searching...')).toBeInTheDocument();
        }),
        { numRuns: 10 }
      );
    });
  });

  describe('Active filters display', () => {
    it('should display active filters correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          resourceTypeArb,
          resourceStatusArb,
          (searchTerm, type, status) => {
            const paramsWithFilters: ResourceListParams = {
              page: 1,
              limit: 10,
              search: searchTerm,
              type,
              status,
            };
            
            render(
              <SearchAndFilters
                params={paramsWithFilters}
                onParamsChange={mockOnParamsChange}
                isLoading={false}
              />
            );

            // Should display active filters section
            expect(screen.getByText('Active filters:')).toBeInTheDocument();
            expect(screen.getByText(`Search: "${searchTerm}"`)).toBeInTheDocument();
            expect(screen.getByText(`Type: ${type}`)).toBeInTheDocument();
            expect(screen.getByText(`Status: ${status}`)).toBeInTheDocument();

            // Each filter should have a remove button (×)
            const removeButtons = screen.getAllByText('×');
            expect(removeButtons).toHaveLength(3); // One for each active filter
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should not display active filters section when no filters are active', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }),
          (limit) => {
            const paramsWithoutFilters: ResourceListParams = {
              page: 1,
              limit,
            };
            
            render(
              <SearchAndFilters
                params={paramsWithoutFilters}
                onParamsChange={mockOnParamsChange}
                isLoading={false}
              />
            );

            // Should not display active filters section
            expect(screen.queryByText('Active filters:')).not.toBeInTheDocument();
            expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});