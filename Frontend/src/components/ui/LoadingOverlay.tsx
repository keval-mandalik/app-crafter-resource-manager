import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  children,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            {message && (
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingOverlay;