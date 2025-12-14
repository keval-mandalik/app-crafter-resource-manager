import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Resource } from '../../types';

interface ResourceCardProps {
  resource: Resource;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = React.memo(({ resource, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isContentManager = user?.role === 'CONTENT_MANAGER';

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Article':
        return 'bg-blue-100 text-blue-800';
      case 'Video':
        return 'bg-green-100 text-green-800';
      case 'Tutorial':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTags = (tags: string) => {
    if (!tags) return [];
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow">
      {/* Mobile layout - stacked */}
      <div className="sm:hidden">
        <div className="mb-3">
          <Link 
            to={`/resource/${resource.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors block"
          >
            {resource.title}
          </Link>
          <p className="text-gray-600 mt-2 text-sm line-clamp-3">{resource.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
            {resource.type}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
            {resource.status}
          </span>
        </div>

        {resource.tags && (
          <div className="flex flex-wrap gap-1 mb-3">
            {formatTags(resource.tags).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col space-y-2 text-sm text-gray-500 mb-3">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 truncate"
          >
            {resource.url}
          </a>
          <span className="text-xs">
            {new Date(resource.createdAt).toLocaleDateString()}
          </span>
        </div>

        {isContentManager && (
          <div className="flex space-x-3 pt-2 border-t border-gray-100">
            {onEdit && (
              <button
                onClick={() => onEdit(resource)}
                className="flex-1 text-center py-2 px-3 text-blue-600 hover:text-blue-800 text-sm font-medium border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(resource)}
                className="flex-1 text-center py-2 px-3 text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 rounded-md hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop layout - horizontal */}
      <div className="hidden sm:block">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Link 
              to={`/resource/${resource.id}`}
              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {resource.title}
            </Link>
            <p className="text-gray-600 mt-2 line-clamp-3">{resource.description}</p>
          </div>
          
          {isContentManager && (
            <div className="flex space-x-2 ml-4">
              {onEdit && (
                <button
                  onClick={() => onEdit(resource)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(resource)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
            {resource.type}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
            {resource.status}
          </span>
        </div>

        {resource.tags && (
          <div className="flex flex-wrap gap-1 mb-4">
            {formatTags(resource.tags).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-gray-500">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 truncate max-w-xs lg:max-w-md"
          >
            {resource.url}
          </a>
          <span>
            {new Date(resource.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
});

ResourceCard.displayName = 'ResourceCard';

export default ResourceCard;