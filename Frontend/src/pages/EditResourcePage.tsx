import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { ResourceForm } from '../components/resources';
import { ResourceService } from '../services/resourceService';
import type { Resource } from '../types';
import type { ResourceFormData } from '../utils/validation';

const EditResourcePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingResource, setIsLoadingResource] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      if (!id) {
        setError('Resource ID is required');
        setIsLoadingResource(false);
        return;
      }

      try {
        const resourceData = await ResourceService.getResource(id);
        setResource(resourceData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load resource';
        setError(errorMessage);
      } finally {
        setIsLoadingResource(false);
      }
    };

    fetchResource();
  }, [id]);

  const handleSubmit = async (data: ResourceFormData) => {
    if (!id) {
      setError('Resource ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ResourceService.updateResource(id, data);
      // Navigate to the resource detail page after successful update
      navigate(`/resource/${id}`, {
        state: { message: 'Resource updated successfully!' }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update resource';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/resource/${id}`);
    } else {
      navigate('/');
    }
  };

  if (isLoadingResource) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !resource) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Resource</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/')}
                    className="text-sm font-medium text-red-800 hover:text-red-900"
                  >
                    Return to Resources
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {resource && (
          <ResourceForm
            mode="edit"
            initialData={resource}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}
      </div>
    </Layout>
  );
};

export default EditResourcePage;