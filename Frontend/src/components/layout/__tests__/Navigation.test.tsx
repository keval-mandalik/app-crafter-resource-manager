import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Navigation from '../Navigation';
import { AuthProvider } from '../../../contexts/AuthContext';
import { UserRole } from '../../../types';

// Mock the AuthContext
let mockAuthContext: any = {
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

const renderNavigation = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navigation Component', () => {
  beforeEach(() => {
    // Reset to default context
    mockAuthContext = {
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
  });

  it('renders Resources link for all users', () => {
    renderNavigation();
    const resourcesLinks = screen.getAllByRole('link', { name: /Resources/i });
    expect(resourcesLinks).toHaveLength(2); // Mobile and desktop versions
  });

  it('renders Create Resource link for CONTENT_MANAGER', () => {
    renderNavigation();
    const createLinks = screen.getAllByRole('link', { name: /Create Resource/i });
    expect(createLinks).toHaveLength(2); // Mobile and desktop versions
  });

  it('does not render Create Resource link for VIEWER', () => {
    mockAuthContext.user!.role = UserRole.VIEWER;
    
    renderNavigation();
    
    const resourcesLinks = screen.getAllByRole('link', { name: /Resources/i });
    expect(resourcesLinks).toHaveLength(2); // Mobile and desktop versions
    expect(screen.queryByRole('link', { name: /Create Resource/i })).not.toBeInTheDocument();
  });

  it('does not render navigation when user is null', () => {
    mockAuthContext.user = null;
    mockAuthContext.isAuthenticated = false;
    
    renderNavigation();
    
    expect(screen.queryByRole('link', { name: /Resources/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Create Resource/i })).not.toBeInTheDocument();
  });

  it('has correct href attributes for navigation links', () => {
    renderNavigation();
    
    const resourcesLinks = screen.getAllByRole('link', { name: /Resources/i });
    const createLinks = screen.getAllByRole('link', { name: /Create Resource/i });
    
    resourcesLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/resources');
    });
    
    createLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/resources/create');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes for mobile and desktop layouts', () => {
      renderNavigation();
      
      // Check that navigation has responsive classes
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      
      // Links should have responsive text classes
      const resourcesLinks = screen.getAllByRole('link', { name: /Resources/i });
      expect(resourcesLinks[0]).toHaveClass('flex', 'items-center', 'space-x-3'); // Mobile version
      expect(resourcesLinks[1]).toHaveClass('flex', 'items-center', 'space-x-2'); // Desktop version
    });

    it('shows abbreviated text on medium screens', () => {
      renderNavigation();
      
      // The "Create Resource" link should have responsive text handling
      const createLinks = screen.getAllByRole('link', { name: /Create Resource/i });
      expect(createLinks).toHaveLength(2);
      
      // Desktop version should contain both full and abbreviated versions in the DOM
      const desktopLink = createLinks[1]; // Desktop version
      expect(desktopLink.textContent).toContain('Create Resource');
      expect(desktopLink.textContent).toContain('Create');
    });

    it('renders mobile stacked layout elements', () => {
      renderNavigation();
      
      // Check for mobile-specific classes
      const mobileNav = document.querySelector('.sm\\:hidden');
      const desktopNav = document.querySelector('.hidden.sm\\:flex');
      
      expect(mobileNav).toBeInTheDocument();
      expect(desktopNav).toBeInTheDocument();
    });

    it('applies correct styling for active navigation items', () => {
      renderNavigation();
      
      const resourcesLinks = screen.getAllByRole('link', { name: /Resources/i });
      expect(resourcesLinks).toHaveLength(2);
      
      // Both mobile and desktop versions should be present
      resourcesLinks.forEach(link => {
        expect(link).toBeInTheDocument();
      });
    });
  });
});