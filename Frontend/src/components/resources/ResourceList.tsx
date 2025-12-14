import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDeleteResource } from '../../hooks/useResources';
import { ConfirmationModal, ResourceCardSkeleton } from '../ui';
import ResourceCard from './ResourceCard';
import type { Resource, ResourceListResponse } from '../../types';

interface ResourceListProps {
  data: ResourceListResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  onRefresh?: () => void;
}

const ResourceList: React.FC<ResourceListProps> = ({ 
  data, 
  isLoading, 
  error, 
  onRefresh 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const deleteResourceMutation = useDeleteResource();
  const [deleteConfirmResource, setDeleteConfirmResource] = React.useState<Resource | null>(null);

  const isContentManager = user?.role === 'CONTENT_MANAGER';

  const handleEdit = (resource: Resource) => {
    navigate(`/resource/${resource.id}/edit`);
  };

  const handleDeleteClick = (resource: Resource) => {
    setDeleteConfirmResource(resource);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmResource) return;
    
    try {
      await deleteResourceMutation.mutateAsync(deleteConfirmResource.id);
      setDeleteConfirmResource(null);
    } catch (error) {
      console.error('Failed to delete resource:', error);
      // Error handling is managed by the mutation hook
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmResource(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, index) => (
          <ResourceCardSkeleton key={index} showActions={isContentManager} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load resources</h3>
        <p className="text-red-600 mb-4">
          {error.message || 'An unexpected error occurred while loading resources.'}
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (!data || data?.data?.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
        <p className="text-gray-600 mb-6">
          {isContentManager 
            ? "Get started by creating your first resource."
            : "No resources are available at the moment."
          }
        </p>
        {isContentManager && (
          <button
            onClick={() => navigate('/create')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Create Resource
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {data?.data?.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onEdit={isContentManager ? handleEdit : undefined}
            onDelete={isContentManager ? handleDeleteClick : undefined}
          />
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirmResource}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Archive Resource"
        message={`Are you sure you want to archive "${deleteConfirmResource?.title}"? This action will remove it from the active list but can be undone later.`}
        confirmText="Archive"
        cancelText="Cancel"
        isLoading={deleteResourceMutation.isPending}
        variant="danger"
      />
    </>
  );
};

export default ResourceList;