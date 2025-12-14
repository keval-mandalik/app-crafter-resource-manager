import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Modal from '../Modal';

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  title: 'Test Modal',
  children: <div>Modal content</div>
};

describe('Modal Responsive Design', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow style
    document.body.style.overflow = 'unset';
  });

  it('renders with responsive padding', () => {
    render(<Modal {...defaultProps} />);
    
    const modalHeader = screen.getByText('Test Modal').parentElement;
    expect(modalHeader).toHaveClass('p-4', 'sm:p-6');
    
    const modalContent = screen.getByText('Modal content').parentElement;
    expect(modalContent).toHaveClass('p-4', 'sm:p-6');
  });

  it('renders close button with touch-friendly sizing', () => {
    render(<Modal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    expect(closeButton).toHaveClass('min-h-[44px]', 'min-w-[44px]', 'touch-manipulation');
  });

  it('handles modal sizing responsively', () => {
    render(<Modal {...defaultProps} size="lg" />);
    
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toHaveClass('max-w-lg');
  });

  it('renders with proper mobile viewport handling', () => {
    render(<Modal {...defaultProps} />);
    
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toHaveClass('max-h-[90vh]', 'overflow-y-auto');
  });

  it('maintains sticky header on mobile', () => {
    render(<Modal {...defaultProps} />);
    
    const modalHeader = screen.getByText('Test Modal').parentElement;
    expect(modalHeader).toHaveClass('sticky', 'top-0', 'bg-white');
  });

  it('handles close button interaction on mobile', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('prevents body scroll when modal is open', () => {
    render(<Modal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when modal is closed', () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<Modal {...defaultProps} isOpen={false} />);
    
    expect(document.body.style.overflow).toBe('unset');
  });

  it('handles keyboard navigation properly', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    // Simulate escape key press
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders with proper ARIA attributes for accessibility', () => {
    render(<Modal {...defaultProps} />);
    
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toHaveAttribute('aria-modal', 'true');
    expect(modalDialog).toHaveAttribute('aria-labelledby', 'modal-title');
    
    const title = screen.getByText('Test Modal');
    expect(title).toHaveAttribute('id', 'modal-title');
  });

  it('handles different modal sizes appropriately', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />);
    
    let modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toHaveClass('max-w-sm');
    
    rerender(<Modal {...defaultProps} size="md" />);
    modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toHaveClass('max-w-md');
    
    rerender(<Modal {...defaultProps} size="lg" />);
    modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toHaveClass('max-w-lg');
  });

  it('maintains proper z-index for mobile overlays', () => {
    render(<Modal {...defaultProps} />);
    
    const modalOverlay = document.querySelector('.fixed.inset-0');
    expect(modalOverlay).toHaveClass('z-50');
  });

  it('handles long content with scrolling on mobile', () => {
    const longContent = (
      <div>
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i}>This is a long paragraph of content that will make the modal scroll.</p>
        ))}
      </div>
    );
    
    render(<Modal {...defaultProps}>{longContent}</Modal>);
    
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toHaveClass('overflow-y-auto');
  });

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });
});