import { useCallback } from 'react';
import { useError, createErrorFromAxiosError } from '../contexts/ErrorContext';

export function useErrorHandler() {
  const { addError } = useError();

  const handleError = useCallback((error: any, context?: string) => {
    const appError = createErrorFromAxiosError(error);
    
    // Add context to the error message if provided
    if (context) {
      appError.message = `${context}: ${appError.message}`;
    }
    
    addError(appError);
  }, [addError]);

  const handleNetworkError = useCallback((message: string = 'Network connection failed') => {
    addError({
      message,
      type: 'network',
      retryable: true,
    });
  }, [addError]);

  const handleValidationError = useCallback((message: string, details?: any) => {
    addError({
      message,
      type: 'validation',
      retryable: false,
      details,
    });
  }, [addError]);

  const handleServerError = useCallback((message: string = 'Server error occurred') => {
    addError({
      message,
      type: 'server',
      retryable: true,
    });
  }, [addError]);

  return {
    handleError,
    handleNetworkError,
    handleValidationError,
    handleServerError,
  };
}