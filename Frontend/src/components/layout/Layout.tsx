import React, { type ReactNode } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import ErrorBoundary from './ErrorBoundary';

interface LayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNavigation = true }) => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Header />
        {showNavigation && <Navigation />}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default Layout;