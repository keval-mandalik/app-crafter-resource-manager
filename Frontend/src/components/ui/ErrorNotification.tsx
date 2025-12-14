import React, { useEffect } from 'react';
import { useError, type AppError } from '../../contexts/ErrorContext';

interface ErrorNotificationProps {
  error: AppError;
  onRetry?: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error, onRetry }) => {
  const { removeError } = useError();

  // Auto-dismiss non-critical errors after 5 seconds
  useEffect(() => {
    if (error.type !== 'server' && error.retryable) {
      const timer = setTimeout(() => {
        removeError(error.id);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error.id, error.type, error.retryable, removeError]);

  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'validation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'server':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getErrorColor = () => {
    switch (error.type) {
      case 'network':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'validation':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'server':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getButtonColor = () => {
    switch (error.type) {
      case 'network':
        return 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500';
      case 'validation':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'server':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      default:
        return 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getErrorColor()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {error.type === 'network' && 'Connection Error'}
            {error.type === 'validation' && 'Validation Error'}
            {error.type === 'server' && 'Server Error'}
            {error.type === 'unknown' && 'Error'}
          </h3>
          <p className="mt-1 text-sm opacity-90">
            {error.message}
          </p>
          <div className="mt-3 flex space-x-2">
            {error.retryable && onRetry && (
              <button
                onClick={onRetry}
                className={`text-white px-3 py-1 rounded text-sm font-medium transition-colors ${getButtonColor()}`}
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => removeError(error.id)}
              className="text-current opacity-70 hover:opacity-100 px-3 py-1 rounded text-sm font-medium transition-opacity"
            >
              Dismiss
            </button>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => removeError(error.id)}
            className="text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <span className="sr-only">Close</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;