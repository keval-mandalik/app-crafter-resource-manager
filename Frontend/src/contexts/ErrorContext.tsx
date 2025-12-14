import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface AppError {
  id: string;
  message: string;
  type: 'network' | 'validation' | 'server' | 'unknown';
  timestamp: Date;
  retryable: boolean;
  details?: any;
}

interface ErrorState {
  errors: AppError[];
  globalError: AppError | null;
}

type ErrorAction =
  | { type: 'ADD_ERROR'; payload: Omit<AppError, 'id' | 'timestamp'> }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_GLOBAL_ERROR'; payload: AppError | null };

const initialState: ErrorState = {
  errors: [],
  globalError: null,
};

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR':
      const newError: AppError = {
        ...action.payload,
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };
      return {
        ...state,
        errors: [...state.errors, newError],
      };
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
      };
    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.payload,
      };
    default:
      return state;
  }
}

interface ErrorContextType {
  state: ErrorState;
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  setGlobalError: (error: AppError | null) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = (error: Omit<AppError, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_ERROR', payload: error });
  };

  const removeError = (id: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: id });
  };

  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  const setGlobalError = (error: AppError | null) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: error });
  };

  return (
    <ErrorContext.Provider
      value={{
        state,
        addError,
        removeError,
        clearErrors,
        setGlobalError,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

// Helper function to create error objects from different sources
export function createErrorFromAxiosError(error: any): Omit<AppError, 'id' | 'timestamp'> {
  if (error.isNetworkError) {
    return {
      message: error.message,
      type: 'network',
      retryable: true,
      details: error,
    };
  }

  if (error.status) {
    const type = error.status >= 500 ? 'server' : error.status === 422 ? 'validation' : 'unknown';
    return {
      message: error.message,
      type,
      retryable: error.status >= 500,
      details: { status: error.status, data: error.data },
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    type: 'unknown',
    retryable: false,
    details: error,
  };
}