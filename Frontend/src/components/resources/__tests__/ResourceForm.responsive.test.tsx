import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResourceForm } from '../ResourceForm';
import type { Resource } from '../../../types';

// Mock react-hook-form
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useForm: () => ({
      register: vi.fn(() => ({})),
      handleSubmit: vi.fn((fn) => (e) => {
        e.preventDefault();
        fn({
          title: 'Test Resource',
          description: 'Test Description',
          type: 'Article',
          url: 'https://example.com',
          tags: 'test, example',
          status: 'Draft'
        });
      }),
      formState: { errors: {}, isSubmitting: false },
      reset: vi.fn(),
    }),
  };
});

const mockResource: Resource = {
  id: '1',
  title: 'Test Resource',
  description: 'Test Description',
  type: 'Article',
  url: 'https://example.com',
  tags: 'test, example',
  status: 'Draft',
  createdByUserId: '1',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

const defaultProps = {
  mode: 'create' as const,
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  isLoading: false
};

describe('ResourceForm Responsive Design', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with responsive padding classes', () => {
    render(<ResourceForm {...defaultProps} />);
    
    const formContainer = document.querySelector('.bg-white.shadow.rounded-lg');
    expect(formContainer).toHaveClass('p-4', 'sm:p-6');
  });

  it('renders responsive title sizing', () => {
    render(<ResourceForm {...defaultProps} />);
    
    const title = screen.getByText('Create New Resource');
    expect(title).toHaveClass('text-xl', 'sm:text-2xl');
  });

  it('renders form actions with responsive layout', () => {
    render(<ResourceForm {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const submitButton = screen.getByRole('button', { name: /create resource/i });
    
    // Check for responsive button classes
    expect(cancelButton).toHaveClass('w-full', 'sm:w-auto');
    expect(submitButton).toHaveClass('w-full', 'sm:w-auto');
    
    // Check for responsive flex layout
    const buttonContainer = cancelButton.parentElement;
    expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
  });

  it('renders form with responsive spacing', () => {
    render(<ResourceForm {...defaultProps} />);
    
    const form = document.querySelector('form');
    expect(form).toHaveClass('space-y-4', 'sm:space-y-6');
  });

  it('handles form submission on mobile', async () => {
    const onSubmit = vi.fn();
    render(<ResourceForm {...defaultProps} onSubmit={onSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /create resource/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('renders edit mode with responsive elements', () => {
    render(
      <ResourceForm 
        {...defaultProps} 
        mode="edit" 
        initialData={mockResource}
      />
    );
    
    const title = screen.getByText('Edit Resource');
    expect(title).toHaveClass('text-xl', 'sm:text-2xl');
    
    const updateButton = screen.getByRole('button', { name: /update resource/i });
    expect(updateButton).toHaveClass('w-full', 'sm:w-auto');
  });

  it('maintains accessibility on mobile devices', () => {
    render(<ResourceForm {...defaultProps} />);
    
    // Check that form inputs have proper labels
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
    
    // Check that buttons have proper text content
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const submitButton = screen.getByRole('button', { name: /create resource/i });
    
    expect(cancelButton).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('handles loading state with responsive button layout', () => {
    render(<ResourceForm {...defaultProps} isLoading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /create resource/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('justify-center'); // Centers loading spinner
  });
});