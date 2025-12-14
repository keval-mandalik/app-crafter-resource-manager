import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from '../Header';
import { AuthProvider } from '../../../contexts/AuthContext';
import { UserRole } from '../../../types';

// Mock the AuthContext
const mockLogout = vi.fn();
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
  logout: mockLogout,
  error: null,
  clearError: vi.fn()
};

vi.mock('../../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => mockAuthContext
}));

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Header />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      logout: mockLogout,
      error: null,
      clearError: vi.fn()
    };
  });

  it('renders the application title', () => {
    renderHeader();
    expect(screen.getByText('Resource Manager')).toBeInTheDocument();
  });

  it('displays user information when authenticated', () => {
    renderHeader();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Content Manager')).toBeInTheDocument();
  });

  it('displays correct role for VIEWER user', () => {
    mockAuthContext.user!.role = UserRole.VIEWER;
    
    renderHeader();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('renders logout button when user is authenticated', () => {
    renderHeader();
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', () => {
    renderHeader();
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('does not display user info when user is null', () => {
    mockAuthContext.user = null;
    mockAuthContext.isAuthenticated = false;
    
    renderHeader();
    
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  describe('Responsive Design', () => {
    it('shows mobile menu button on small screens', () => {
      // Mock window.matchMedia for mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(max-width: 640px)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      renderHeader();
      
      // Mobile menu button should be present (though hidden by CSS classes)
      const menuButton = screen.getByRole('button', { name: /open main menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('truncates long user names appropriately', () => {
      mockAuthContext.user!.name = 'Very Long User Name That Should Be Truncated';
      
      renderHeader();
      
      const userName = screen.getByText('Very Long User Name That Should Be Truncated');
      expect(userName).toBeInTheDocument();
      expect(userName).toHaveClass('truncate');
    });

    it('shows mobile menu when menu button is clicked', () => {
      renderHeader();
      
      const menuButton = screen.getByRole('button', { name: /open main menu/i });
      fireEvent.click(menuButton);
      
      // Mobile menu should be visible with user info
      expect(screen.getAllByText('John Doe')).toHaveLength(2); // One in desktop, one in mobile
      expect(screen.getAllByText('Content Manager')).toHaveLength(2);
    });

    it('hides mobile menu when close button is clicked', () => {
      renderHeader();
      
      const menuButton = screen.getByRole('button', { name: /open main menu/i });
      fireEvent.click(menuButton);
      
      // Click again to close
      fireEvent.click(menuButton);
      
      // Should only have desktop version visible
      expect(screen.getAllByText('John Doe')).toHaveLength(1);
    });
  });
});