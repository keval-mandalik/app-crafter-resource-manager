import React from 'react';
import SkeletonLoader from './SkeletonLoader';

interface ResourceCardSkeletonProps {
  showActions?: boolean;
}

const ResourceCardSkeleton: React.FC<ResourceCardSkeletonProps> = ({ 
  showActions = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <SkeletonLoader variant="text" width="75%" className="mb-2" />
          <SkeletonLoader variant="text" lines={2} className="mb-1" />
        </div>
        {showActions && (
          <div className="flex space-x-2 ml-4">
            <SkeletonLoader variant="rectangular" width={32} height={16} />
            <SkeletonLoader variant="rectangular" width={48} height={16} />
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mb-4">
        <SkeletonLoader variant="rectangular" width={64} height={24} className="rounded-full" />
        <SkeletonLoader variant="rectangular" width={80} height={24} className="rounded-full" />
      </div>
      
      <div className="flex justify-between items-center">
        <SkeletonLoader variant="text" width={128} />
        <SkeletonLoader variant="text" width={80} />
      </div>
    </div>
  );
};

export default ResourceCardSkeleton;