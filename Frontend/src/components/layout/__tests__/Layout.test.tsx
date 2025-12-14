import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Layout from '../Layout';
import { AuthProvider } from '../../../contexts/AuthContext';
import { UserRole } from '../../../types';

// Mock the child components
vi.mock('../Header', () => ({
  default: () => <div data-testid="header">Header Component</div>
}));

vi.mock('../Navigation', () => ({
  default: () => <div data-testid="navigation">Navigation Component</div>
}));

vi.mock('../ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  )
}));

// Mock the AuthContext
const mockAuthContext = {
  user: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.CONTENT_MANAGER,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  error: null,
  clearError: vi.fn()
};

vi.mock('../../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => mockAuthContext
}));

const renderLayout = (showNavigation = true) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Layout showNavigation={showNavigation}>
          <div data-testid="test-content">Test Content</div>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Layout Component', () => {
  it('renders all layout components by default', () => {
    renderLayout();
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderLayout();
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('hides navigation when showNavigation is false', () => {
    renderLayout(false);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('shows navigation when showNavigation is true', () => {
    renderLayout(true);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('wraps content in ErrorBoundary', () => {
    renderLayout();
    
    const errorBoundary = screen.getByTestId('error-boundary');
    expect(errorBoundary).toBeInTheDocument();
    
    // Check that all content is within the error boundary
    expect(errorBoundary).toContainElement(screen.getByTestId('header'));
    expect(errorBoundary).toContainElement(screen.getByTestId('test-content'));
  });

  it('has correct CSS classes for responsive layout', () => {
    renderLayout();
    
    // Check for main container classes
    const mainContainer = screen.getByRole('main');
    expect(mainContainer).toHaveClass('flex-1');
    
    // Check for responsive padding classes
    const contentWrapper = mainContainer.firstChild;
    expect(contentWrapper).toHaveClass('max-w-7xl', 'mx-auto', 'py-6', 'px-4', 'sm:px-6', 'lg:px-8');
  });
});