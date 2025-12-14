import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Pagination from '../Pagination';

const defaultProps = {
  currentPage: 1,
  totalPages: 5,
  totalItems: 50,
  itemsPerPage: 10,
  onPageChange: vi.fn(),
  isLoading: false
};

describe('Pagination Responsive Design', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mobile and desktop layouts', () => {
    render(<Pagination {...defaultProps} />);
    
    // Mobile layout should be present
    const mobileLayout = document.querySelector('.flex-1.flex.justify-between.sm\\:hidden');
    expect(mobileLayout).toBeInTheDocument();
    
    // Desktop layout should be present
    const desktopLayout = document.querySelector('.hidden.sm\\:flex-1.sm\\:flex');
    expect(desktopLayout).toBeInTheDocument();
  });

  it('renders mobile navigation buttons with touch-friendly sizing', () => {
    render(<Pagination {...defaultProps} />);
    
    // Mobile buttons should have enhanced touch targets
    const mobilePrevButton = screen.getAllByRole('button', { name: /previous/i })[0];
    const mobileNextButton = screen.getAllByRole('button', { name: /next/i })[0];
    
    expect(mobilePrevButton).toHaveClass('min-h-[44px]', 'touch-manipulation');
    expect(mobileNextButton).toHaveClass('min-h-[44px]', 'touch-manipulation');
  });

  it('displays page information differently on mobile vs desktop', () => {
    render(<Pagination {...defaultProps} />);
    
    // Mobile should show simplified page info
    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(screen.getByText('of 5')).toBeInTheDocument();
    
    // Desktop should show detailed info - just check for key parts
    expect(screen.getByText(/results/)).toBeInTheDocument();
    
    // Check that both mobile and desktop layouts exist
    const mobileLayout = document.querySelector('.sm\\:hidden');
    const desktopLayout = document.querySelector('.hidden.sm\\:flex-1');
    expect(mobileLayout).toBeInTheDocument();
    expect(desktopLayout).toBeInTheDocument();
  });

  it('handles page navigation on mobile', () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);
    
    const mobileNextButton = screen.getAllByRole('button', { name: /next/i })[0];
    fireEvent.click(mobileNextButton);
    
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('renders desktop pagination with touch-friendly buttons', () => {
    render(<Pagination {...defaultProps} />);
    
    // Desktop page number buttons should have touch-friendly sizing
    const pageButtons = screen.getAllByRole('button').filter(button => 
      /^\d+$/.test(button.textContent || '')
    );
    
    pageButtons.forEach(button => {
      expect(button).toHaveClass('min-h-[44px]', 'touch-manipulation');
    });
  });

  it('shows loading state appropriately on both layouts', () => {
    render(<Pagination {...defaultProps} isLoading={true} />);
    
    // All buttons should be disabled when loading
    const allButtons = screen.getAllByRole('button');
    allButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('handles current page highlighting', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    
    const currentPageButton = screen.getByRole('button', { name: '3' });
    expect(currentPageButton).toHaveClass('bg-blue-50', 'border-blue-500', 'text-blue-600');
  });

  it('renders with proper spacing for mobile layout', () => {
    render(<Pagination {...defaultProps} />);
    
    const mobileContainer = document.querySelector('.flex-1.flex.justify-between.sm\\:hidden');
    expect(mobileContainer).toBeInTheDocument();
    
    // Should have proper spacing between elements
    const pageInfo = screen.getByText('Page 1');
    expect(pageInfo.parentElement).toHaveClass('px-4');
  });

  it('does not render when there is only one page', () => {
    render(<Pagination {...defaultProps} totalPages={1} />);
    
    // Should not render pagination when only one page
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });

  it('handles edge cases with responsive design', () => {
    // Test with many pages
    render(<Pagination {...defaultProps} totalPages={20} currentPage={10} />);
    
    // Should still render properly with ellipsis (there are multiple ellipsis)
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
    
    // Mobile layout should still work
    expect(screen.getByText('Page 10')).toBeInTheDocument();
    expect(screen.getByText('of 20')).toBeInTheDocument();
  });

  it('maintains accessibility across different screen sizes', () => {
    render(<Pagination {...defaultProps} />);
    
    // All buttons should have proper accessibility
    const prevButtons = screen.getAllByRole('button', { name: /previous/i });
    const nextButtons = screen.getAllByRole('button', { name: /next/i });
    
    prevButtons.forEach(button => {
      expect(button).toBeInTheDocument();
    });
    
    nextButtons.forEach(button => {
      expect(button).toBeInTheDocument();
    });
    
    // Navigation should have proper aria-label
    const navigation = screen.getByRole('navigation');
    expect(navigation).toHaveAttribute('aria-label', 'Pagination');
  });
});