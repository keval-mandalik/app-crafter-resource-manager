
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorProvider } from './contexts/ErrorContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { GlobalErrorHandler, LoadingSpinner } from './components/ui';
import queryClient from './lib/queryClient';

// Lazy load page components for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const ResourceDetailPage = lazy(() => import('./pages/ResourceDetailPage'));
const CreateResourcePage = lazy(() => import('./pages/CreateResourcePage'));
const EditResourcePage = lazy(() => import('./pages/EditResourcePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const TestPage = lazy(() => import('./pages/TestPage'));


function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ErrorProvider>
          <AuthProvider>
            <Router>
              <div className="App">
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/test" element={<TestPage />} />
                    
                    {/* Protected routes - Resources page is now the home page */}
                    <Route 
                      path="/" 
                      element={
                        <ProtectedRoute>
                          <ResourcesPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/create" 
                      element={
                        <ProtectedRoute>
                          <CreateResourcePage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/resource/:id" 
                      element={
                        <ProtectedRoute>
                          <ResourceDetailPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/resource/:id/edit" 
                      element={
                        <ProtectedRoute>
                          <EditResourcePage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Legacy redirect for old /resources path */}
                    <Route path="/resources" element={<Navigate to="/" replace />} />
                    
                    {/* 404 page for invalid routes */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
                
                {/* Global error notifications */}
                <GlobalErrorHandler />
              </div>
            </Router>
          </AuthProvider>
        </ErrorProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
