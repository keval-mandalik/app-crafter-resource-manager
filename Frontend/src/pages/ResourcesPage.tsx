import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import ResourceList from '../components/resources/ResourceList';
import SearchAndFilters from '../components/resources/SearchAndFilters';
import { Pagination } from '../components/common';
import { useResources } from '../hooks/useResources';
import { useAuth } from '../contexts/AuthContext';
import type { ResourceListParams } from '../types';

const ResourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params, setParams] = useState<ResourceListParams>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error, refetch } = useResources(params);
  const isContentManager = user?.role === 'CONTENT_MANAGER';

  const handleParamsChange = useCallback((newParams: ResourceListParams) => {
    setParams(newParams);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
              <p className="text-gray-600 mt-1">
                {isContentManager 
                  ? "Manage your learning resources and track their usage."
                  : "Browse available learning resources."
                }
              </p>
            </div>
            
            {isContentManager && (
              <button
                onClick={() => navigate('/create')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Create Resource
              </button>
            )}
          </div>

          {/* Results summary */}
          {data && !isLoading && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {data?.data?.length || 0} of {data?.pagination?.total || 0} resources
                {(data?.pagination?.totalPages || 0) > 1 && (
                  <span> (Page {data?.pagination?.page || 1} of {data?.pagination?.totalPages || 1})</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <SearchAndFilters
          params={params}
          onParamsChange={handleParamsChange}
          isLoading={isLoading}
        />

        {/* Resource List */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <ResourceList
              data={data}
              isLoading={isLoading}
              error={error}
              onRefresh={handleRefresh}
            />
          </div>
          
          {/* Pagination */}
          {data && (data?.pagination?.totalPages || 0) > 1 && (
            <Pagination
              currentPage={data?.pagination?.page || 1}
              totalPages={data?.pagination?.totalPages || 1}
              totalItems={data?.pagination?.total || 0}
              itemsPerPage={data?.pagination?.limit || 10}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ResourcesPage;