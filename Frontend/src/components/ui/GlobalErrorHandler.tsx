import React from 'react';
import { useError } from '../../contexts/ErrorContext';
import ErrorNotification from './ErrorNotification';

const GlobalErrorHandler: React.FC = () => {
  const { state } = useError();

  if (state.errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {state.errors.map((error) => (
        <ErrorNotification
          key={error.id}
          error={error}
          onRetry={() => {
            // Retry logic would be handled by the component that triggered the error
            // For now, we just dismiss the error
            console.log('Retry requested for error:', error.id);
          }}
        />
      ))}
    </div>
  );
};

export default GlobalErrorHandler;