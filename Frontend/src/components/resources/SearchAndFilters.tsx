import React, { useState, useEffect, useCallback } from 'react';
import { ResourceType, ResourceStatus } from '../../types';
import type { ResourceListParams } from '../../types';

interface SearchAndFiltersProps {
  params: ResourceListParams;
  onParamsChange: (params: ResourceListParams) => void;
  isLoading?: boolean;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = React.memo(({
  params,
  onParamsChange,
  isLoading = false,
}) => {
  const [searchInput, setSearchInput] = useState(params?.search || '');
  const [debouncedSearch, setDebouncedSearch] = useState(params?.search || '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update params when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== params?.search) {
      onParamsChange?.({
        ...params,
        search: debouncedSearch || undefined,
        page: 1, // Reset to first page when search changes
      });
    }
  }, [debouncedSearch]); // Remove params and onParamsChange from dependencies to prevent infinite loop

  const handleTypeChange = useCallback((type: string) => {
    const newType = type === 'all' ? undefined : (type as ResourceType);
    onParamsChange?.({
      ...params,
      type: newType,
      page: 1, // Reset to first page when filter changes
    });
  }, [onParamsChange]); // Remove params from dependencies

  const handleStatusChange = useCallback((status: string) => {
    const newStatus = status === 'all' ? undefined : (status as ResourceStatus);
    onParamsChange?.({
      ...params,
      status: newStatus,
      page: 1, // Reset to first page when filter changes
    });
  }, [onParamsChange]); // Remove params from dependencies

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setDebouncedSearch('');
    onParamsChange?.({
      page: 1,
      limit: params?.limit || 10,
    });
  }, [onParamsChange]); // Remove params.limit from dependencies

  const hasActiveFilters = !!(params?.search || params?.type || params?.status);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search resources..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={isLoading}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          aria-label="Search resources by title or description"
          role="searchbox"
        />
        {searchInput && (
          <button
            onClick={() => {
              setSearchInput('');
              setDebouncedSearch('');
            }}
            disabled={isLoading}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Clear search"
            type="button"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filters Row - Mobile: Stacked, Desktop: Horizontal */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center">
        {/* Type Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
          <label htmlFor="type-filter" className="text-sm font-medium text-gray-700">
            Type:
          </label>
          <select
            id="type-filter"
            value={params?.type || 'all'}
            onChange={(e) => handleTypeChange(e.target.value)}
            disabled={isLoading}
            className="block w-full sm:w-auto px-3 py-2 sm:py-1 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Types</option>
            <option value={ResourceType.Article}>Article</option>
            <option value={ResourceType.Video}>Video</option>
            <option value={ResourceType.Tutorial}>Tutorial</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Status:
          </label>
          <select
            id="status-filter"
            value={params?.status || 'all'}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isLoading}
            className="block w-full sm:w-auto px-3 py-2 sm:py-1 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Statuses</option>
            <option value={ResourceStatus.Published}>Published</option>
            <option value={ResourceStatus.Draft}>Draft</option>
            <option value={ResourceStatus.Archived}>Archived</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            disabled={isLoading}
            className="w-full sm:w-auto text-center sm:text-left text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed py-2 sm:py-0"
          >
            Clear Filters
          </button>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center sm:justify-start text-sm text-gray-500">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Searching...
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {params?.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{params.search}"
              <button
                onClick={() => {
                  setSearchInput('');
                  setDebouncedSearch('');
                }}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          
          {params?.type && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Type: {params.type}
              <button
                onClick={() => handleTypeChange('all')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          
          {params?.status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Status: {params.status}
              <button
                onClick={() => handleStatusChange('all')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
});

SearchAndFilters.displayName = 'SearchAndFilters';

export default SearchAndFilters;