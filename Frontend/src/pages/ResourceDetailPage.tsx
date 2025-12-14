import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { ConfirmationModal, SkeletonLoader } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useResource, useDeleteResource } from '../hooks/useResources';
import { useResourceActivities } from '../hooks/useActivities';
import { ResourceType, ResourceStatus } from '../types';

const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const {
    data: resource,
    isLoading: resourceLoading,
    error: resourceError
  } = useResource(id || '');

  const {
    data: activities,
    isLoading: activitiesLoading,
    error: activitiesError
  } = useResourceActivities(id || '', { page: 1, limit: 20 });

  const deleteResourceMutation = useDeleteResource();

  const isContentManager = user?.role === 'CONTENT_MANAGER';

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resource) return;
    
    try {
      await deleteResourceMutation.mutateAsync(resource.id);
      setShowDeleteModal(false);
      navigate('/', { 
        state: { message: 'Resource archived successfully' }
      });
    } catch (error) {
      console.error('Failed to delete resource:', error);
      // Error handling is managed by the mutation hook
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  if (!id) {
    return (
      <Layout>
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">Resource ID is required.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Resources
          </Link>
        </div>
      </Layout>
    );
  }

  if (resourceError) {
    return (
      <Layout>
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Resource</h1>
          <p className="text-gray-600 mb-4">
            {resourceError instanceof Error ? resourceError.message : 'Failed to load resource'}
          </p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Resources
          </Link>
        </div>
      </Layout>
    );
  }

  const formatTags = (tags: string): string[] => {
    if (!tags || tags.trim() === '') return [];
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: ResourceStatus): string => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type: ResourceType): string => {
    switch (type) {
      case 'Article':
        return 'bg-blue-100 text-blue-800';
      case 'Video':
        return 'bg-purple-100 text-purple-800';
      case 'Tutorial':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Resources
          </Link>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={() => setSuccessMessage(null)}
                    className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {resourceLoading && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <SkeletonLoader variant="text" width="75%" height={32} className="mb-4" />
                  <div className="flex space-x-4 mb-4">
                    <SkeletonLoader variant="rectangular" width={80} height={24} className="rounded-full" />
                    <SkeletonLoader variant="rectangular" width={70} height={24} className="rounded-full" />
                  </div>
                </div>
                <div className="flex space-x-3 ml-4">
                  <SkeletonLoader variant="rectangular" width={80} height={36} />
                  <SkeletonLoader variant="rectangular" width={90} height={36} />
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <SkeletonLoader variant="text" width="20%" className="mb-2" />
                <SkeletonLoader variant="text" lines={3} />
              </div>
              
              <div>
                <SkeletonLoader variant="text" width="25%" className="mb-2" />
                <SkeletonLoader variant="text" width="60%" />
              </div>
              
              <div>
                <SkeletonLoader variant="text" width="15%" className="mb-2" />
                <div className="flex space-x-2">
                  <SkeletonLoader variant="rectangular" width={60} height={28} className="rounded-full" />
                  <SkeletonLoader variant="rectangular" width={80} height={28} className="rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resource Content */}
        {resource && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {resource.title}
                  </h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(resource.status)}`}>
                      {resource.status}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(resource.type)}`}>
                      {resource.type}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                {isContentManager && (
                  <div className="flex space-x-3 ml-4">
                    <Link
                      to={`/resource/${resource.id}/edit`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                    <button
                      onClick={handleDeleteClick}
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Archive
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm ${
                    activeTab === 'activity'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Activity
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{resource.description}</p>
                  </div>

                  {/* URL */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Resource URL</h3>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {resource.url}
                    </a>
                  </div>

                  {/* Tags */}
                  {formatTags(resource.tags).length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {formatTags(resource.tags).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata</h3>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Created</dt>
                        <dd className="text-sm text-gray-900">{formatDate(resource.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                        <dd className="text-sm text-gray-900">{formatDate(resource.updatedAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Created By</dt>
                        <dd className="text-sm text-gray-900">User ID: {resource.createdByUserId}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Resource ID</dt>
                        <dd className="text-sm text-gray-900 font-mono">{resource.id}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Activity History</h3>
                  
                  {/* Activity Loading State */}
                  {activitiesLoading && (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <SkeletonLoader variant="rectangular" width={60} height={20} className="rounded-full" />
                                <SkeletonLoader variant="text" width={120} />
                                <SkeletonLoader variant="text" width={150} />
                              </div>
                              <SkeletonLoader variant="text" width={180} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Activity Error */}
                  {activitiesError && (
                    <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="font-medium">Error loading activities</p>
                      <p className="text-sm mt-1">
                        {activitiesError instanceof Error ? activitiesError.message : 'Failed to load activity history'}
                      </p>
                    </div>
                  )}

                  {/* Activity List */}
                  {activities && (
                    <div>
                      {activities?.activities?.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>No activity history available for this resource.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activities?.activities?.map((activity) => (
                            <div key={activity?.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      activity.actionType === 'CREATE' ? 'bg-green-100 text-green-800' :
                                      activity.actionType === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                      activity.actionType === 'DELETE' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {activity.actionType}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {activity.user.name}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      ({activity.user.email})
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {formatDate(activity.createdAt)}
                                  </p>
                                  {activity?.details && Object.keys(activity?.details).length > 0 && (
                                    <div className="mt-2 text-sm text-gray-600">
                                      <details className="cursor-pointer">
                                        <summary className="font-medium">View Details</summary>
                                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                          {JSON.stringify(activity?.details, null, 2)}
                                        </pre>
                                      </details>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Archive Resource"
          message={`Are you sure you want to archive "${resource?.title}"? This action will remove it from the active list but can be undone later.`}
          confirmText="Archive"
          cancelText="Cancel"
          isLoading={deleteResourceMutation.isPending}
          variant="danger"
        />
      </div>
    </Layout>
  );
};

export default ResourceDetailPage;