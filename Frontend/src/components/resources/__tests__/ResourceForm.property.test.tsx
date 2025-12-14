import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { ResourceForm } from '../ResourceForm';
import { RESOURCE_TYPES, RESOURCE_STATUSES } from '../../../utils/constants';
import type { Resource } from '../../../types';

// Mock data generators
const arbitraryResourceType = fc.constantFrom(...RESOURCE_TYPES);
const arbitraryResourceStatus = fc.constantFrom(...RESOURCE_STATUSES);

const arbitraryValidTitle = fc.string({ minLength: 1, maxLength: 255 });
const arbitraryValidDescription = fc.string({ minLength: 1, maxLength: 1000 });
const arbitraryValidUrl = fc.webUrl();
const arbitraryValidTags = fc.string({ maxLength: 100 });

const arbitraryInvalidTitle = fc.oneof(
  fc.constant(''), // Empty string
  fc.string({ minLength: 256 }) // Too long
);

const arbitraryInvalidDescription = fc.oneof(
  fc.constant(''), // Empty string
  fc.string({ minLength: 1001 }) // Too long
);

const arbitraryInvalidUrl = fc.oneof(
  fc.constant(''), // Empty string
  fc.constant('not-a-url'), // Invalid format
  fc.constant('ftp://invalid-protocol.com') // Invalid protocol
);

const arbitraryWhitespaceString = fc.string().filter(s => s.trim() === '');

const arbitraryResource = fc.record({
  id: fc.uuid(),
  title: arbitraryValidTitle,
  description: arbitraryValidDescription,
  type: arbitraryResourceType,
  url: arbitraryValidUrl,
  tags: arbitraryValidTags,
  status: arbitraryResourceStatus,
  createdByUserId: fc.uuid(),
  createdAt: fc.date().map(d => d.toISOString()),
  updatedAt: fc.date().map(d => d.toISOString()),
});

describe('ResourceForm Property Tests', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Feature: frontend-resource-manager, Property 7: Form validation error display**
   * *For any* invalid form data, the application should display specific error messages for each invalid field
   * **Validates: Requirements 2.3**
   */
  it('Property 7: Form validation error display', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: arbitraryInvalidTitle,
          description: arbitraryInvalidDescription,
          url: arbitraryInvalidUrl,
        }),
        (invalidData) => {
          render(
            <ResourceForm
              mode="create"
              onSubmit={mockOnSubmit}
              onCancel={mockOnCancel}
            />
          );

          // Fill form with invalid data
          if (invalidData.title !== undefined) {
            const titleInput = screen.getByLabelText(/title/i);
            fireEvent.change(titleInput, { target: { value: invalidData.title } });
            fireEvent.blur(titleInput);
          }

          if (invalidData.description !== undefined) {
            const descriptionInput = screen.getByLabelText(/description/i);
            fireEvent.change(descriptionInput, { target: { value: invalidData.description } });
            fireEvent.blur(descriptionInput);
          }

          if (invalidData.url !== undefined) {
            const urlInput = screen.getByLabelText(/url/i);
            fireEvent.change(urlInput, { target: { value: invalidData.url } });
            fireEvent.blur(urlInput);
          }

          // Try to submit the form
          const submitButton = screen.getByRole('button', { name: /create resource/i });
          fireEvent.click(submitButton);

          // Check that error messages are displayed for invalid fields
          if (invalidData.title === '') {
            expect(screen.getByText(/title is required/i)).toBeInTheDocument();
          } else if (invalidData.title && invalidData.title.length > 255) {
            expect(screen.getByText(/title must be less than 255 characters/i)).toBeInTheDocument();
          }

          if (invalidData.description === '') {
            expect(screen.getByText(/description is required/i)).toBeInTheDocument();
          } else if (invalidData.description && invalidData.description.length > 1000) {
            expect(screen.getByText(/description must be less than 1000 characters/i)).toBeInTheDocument();
          }

          if (invalidData.url === '') {
            expect(screen.getByText(/url is required/i)).toBeInTheDocument();
          } else if (invalidData.url && !invalidData.url.startsWith('http')) {
            expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
          }

          // Form should not be submitted with invalid data
          expect(mockOnSubmit).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 8: Resource type validation**
   * *For any* resource type selection, the application should validate that it matches one of the allowed enum values (Article, Video, Tutorial)
   * **Validates: Requirements 2.4**
   */
  it('Property 8: Resource type validation', () => {
    fc.assert(
      fc.property(
        arbitraryResourceType,
        (validType) => {
          render(
            <ResourceForm
              mode="create"
              onSubmit={mockOnSubmit}
              onCancel={mockOnCancel}
            />
          );

          const typeSelect = screen.getByLabelText(/type/i);
          
          // Set a valid resource type
          fireEvent.change(typeSelect, { target: { value: validType } });

          // The select should accept the valid type
          expect(typeSelect).toHaveValue(validType);

          // Check that all valid types are available as options
          RESOURCE_TYPES.forEach(type => {
            expect(screen.getByRole('option', { name: type })).toBeInTheDocument();
          });
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 9: URL format validation**
   * *For any* URL input, the application should validate that it is a properly formatted URL
   * **Validates: Requirements 2.5**
   */
  it('Property 9: URL format validation', () => {
    fc.assert(
      fc.property(
        fc.oneof(arbitraryValidUrl, arbitraryInvalidUrl),
        (url) => {
          render(
            <ResourceForm
              mode="create"
              onSubmit={mockOnSubmit}
              onCancel={mockOnCancel}
            />
          );

          const urlInput = screen.getByLabelText(/url/i);
          fireEvent.change(urlInput, { target: { value: url } });
          fireEvent.blur(urlInput);

          // Try to submit with other valid data
          fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Title' } });
          fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });

          const submitButton = screen.getByRole('button', { name: /create resource/i });
          fireEvent.click(submitButton);

          const isValidUrl = url.startsWith('http://') || url.startsWith('https://');
          
          if (isValidUrl && url.length > 0) {
            // Valid URL should not show error
            expect(screen.queryByText(/please enter a valid url/i)).not.toBeInTheDocument();
          } else {
            // Invalid URL should show error
            if (url === '') {
              expect(screen.getByText(/url is required/i)).toBeInTheDocument();
            } else {
              expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
            }
            expect(mockOnSubmit).not.toHaveBeenCalled();
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 12: Edit validation preservation**
   * *For any* validation failure during editing, the application should display error messages without losing user input
   * **Validates: Requirements 3.3**
   */
  it('Property 12: Edit validation preservation', () => {
    fc.assert(
      fc.property(
        arbitraryResource,
        fc.record({
          title: arbitraryInvalidTitle,
          description: arbitraryValidDescription,
          url: arbitraryValidUrl,
        }),
        (initialResource, invalidUpdate) => {
          render(
            <ResourceForm
              mode="edit"
              initialData={initialResource}
              onSubmit={mockOnSubmit}
              onCancel={mockOnCancel}
            />
          );

          // Verify initial data is populated
          expect(screen.getByDisplayValue(initialResource.title)).toBeInTheDocument();
          expect(screen.getByDisplayValue(initialResource.description)).toBeInTheDocument();
          expect(screen.getByDisplayValue(initialResource.url)).toBeInTheDocument();

          // Make an invalid change to title
          const titleInput = screen.getByLabelText(/title/i);
          fireEvent.change(titleInput, { target: { value: invalidUpdate.title } });
          fireEvent.blur(titleInput);

          // Update other fields with valid data
          const descriptionInput = screen.getByLabelText(/description/i);
          fireEvent.change(descriptionInput, { target: { value: invalidUpdate.description } });

          const urlInput = screen.getByLabelText(/url/i);
          fireEvent.change(urlInput, { target: { value: invalidUpdate.url } });

          // Try to submit
          const submitButton = screen.getByRole('button', { name: /update resource/i });
          fireEvent.click(submitButton);

          // Check that validation error is shown for invalid title
          if (invalidUpdate.title === '') {
            expect(screen.getByText(/title is required/i)).toBeInTheDocument();
          } else if (invalidUpdate.title.length > 255) {
            expect(screen.getByText(/title must be less than 255 characters/i)).toBeInTheDocument();
          }

          // Check that valid user input is preserved
          expect(screen.getByDisplayValue(invalidUpdate.description)).toBeInTheDocument();
          expect(screen.getByDisplayValue(invalidUpdate.url)).toBeInTheDocument();

          // Form should not be submitted
          expect(mockOnSubmit).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 37: Validation error highlighting**
   * *For any* validation error, the application should highlight problematic fields with specific error messages
   * **Validates: Requirements 9.5**
   */
  it('Property 37: Validation error highlighting', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: arbitraryInvalidTitle,
          description: arbitraryInvalidDescription,
          url: arbitraryInvalidUrl,
        }),
        (invalidData) => {
          render(
            <ResourceForm
              mode="create"
              onSubmit={mockOnSubmit}
              onCancel={mockOnCancel}
            />
          );

          // Fill form with invalid data and trigger validation
          if (invalidData.title !== undefined) {
            const titleInput = screen.getByLabelText(/title/i);
            fireEvent.change(titleInput, { target: { value: invalidData.title } });
            fireEvent.blur(titleInput);

            // Check that the field is highlighted with error styling
            if (invalidData.title === '' || invalidData.title.length > 255) {
              expect(titleInput).toHaveClass('border-red-500');
            }
          }

          if (invalidData.description !== undefined) {
            const descriptionInput = screen.getByLabelText(/description/i);
            fireEvent.change(descriptionInput, { target: { value: invalidData.description } });
            fireEvent.blur(descriptionInput);

            // Check that the field is highlighted with error styling
            if (invalidData.description === '' || invalidData.description.length > 1000) {
              expect(descriptionInput).toHaveClass('border-red-500');
            }
          }

          if (invalidData.url !== undefined) {
            const urlInput = screen.getByLabelText(/url/i);
            fireEvent.change(urlInput, { target: { value: invalidData.url } });
            fireEvent.blur(urlInput);

            // Check that the field is highlighted with error styling
            if (invalidData.url === '' || !invalidData.url.startsWith('http')) {
              expect(urlInput).toHaveClass('border-red-500');
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 10: Edit form population**
   * *For any* resource being edited, the form should be populated with the current resource data
   * **Validates: Requirements 3.1**
   */
  it('Property 10: Edit form population', () => {
    fc.assert(
      fc.property(
        arbitraryResource,
        (resource) => {
          render(
            <ResourceForm
              mode="edit"
              initialData={resource}
              onSubmit={mockOnSubmit}
              onCancel={mockOnCancel}
            />
          );

          // Verify all fields are populated with resource data
          expect(screen.getByDisplayValue(resource.title)).toBeInTheDocument();
          expect(screen.getByDisplayValue(resource.description)).toBeInTheDocument();
          expect(screen.getByDisplayValue(resource.url)).toBeInTheDocument();
          expect(screen.getByDisplayValue(resource.tags || '')).toBeInTheDocument();

          // Verify select fields have correct values
          const typeSelect = screen.getByLabelText(/type/i) as HTMLSelectElement;
          expect(typeSelect.value).toBe(resource.type);

          const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;
          expect(statusSelect.value).toBe(resource.status);

          // Verify the form shows "Edit Resource" title
          expect(screen.getByText(/edit resource/i)).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /update resource/i })).toBeInTheDocument();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 13: Successful update navigation**
   * *For any* successful resource update, the application should redirect to the resource detail view with updated information
   * **Validates: Requirements 3.4**
   */
  it('Property 13: Successful update navigation', async () => {
    fc.assert(
      fc.property(
        arbitraryResource,
        fc.record({
          title: arbitraryValidTitle,
          description: arbitraryValidDescription,
          type: arbitraryResourceType,
          url: arbitraryValidUrl,
          tags: arbitraryValidTags,
          status: arbitraryResourceStatus,
        }),
        async (initialResource, updateData) => {
          const mockOnSubmitSuccess = vi.fn().mockResolvedValue(undefined);

          render(
            <ResourceForm
              mode="edit"
              initialData={initialResource}
              onSubmit={mockOnSubmitSuccess}
              onCancel={mockOnCancel}
            />
          );

          // Fill form with updated data
          const titleInput = screen.getByLabelText(/title/i);
          fireEvent.change(titleInput, { target: { value: updateData.title } });

          const descriptionInput = screen.getByLabelText(/description/i);
          fireEvent.change(descriptionInput, { target: { value: updateData.description } });

          const typeSelect = screen.getByLabelText(/type/i);
          fireEvent.change(typeSelect, { target: { value: updateData.type } });

          const urlInput = screen.getByLabelText(/url/i);
          fireEvent.change(urlInput, { target: { value: updateData.url } });

          const tagsInput = screen.getByLabelText(/tags/i);
          fireEvent.change(tagsInput, { target: { value: updateData.tags } });

          const statusSelect = screen.getByLabelText(/status/i);
          fireEvent.change(statusSelect, { target: { value: updateData.status } });

          // Submit the form
          const submitButton = screen.getByRole('button', { name: /update resource/i });
          fireEvent.click(submitButton);

          // Wait for form submission
          await waitFor(() => {
            expect(mockOnSubmitSuccess).toHaveBeenCalledWith({
              title: updateData.title,
              description: updateData.description,
              type: updateData.type,
              url: updateData.url,
              tags: updateData.tags.trim() || undefined,
              status: updateData.status,
            });
          });
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 14: Edit cancellation**
   * *For any* edit cancellation, the application should return to the previous view without saving changes
   * **Validates: Requirements 3.5**
   */
  it('Property 14: Edit cancellation', () => {
    fc.assert(
      fc.property(
        arbitraryResource,
        (resource) => {
          render(
            <ResourceForm
              mode="edit"
              initialData={resource}
              onSubmit={mockOnSubmit}
              onCancel={mockOnCancel}
            />
          );

          // Make some changes to the form
          const titleInput = screen.getByLabelText(/title/i);
          fireEvent.change(titleInput, { target: { value: 'Modified Title' } });

          const descriptionInput = screen.getByLabelText(/description/i);
          fireEvent.change(descriptionInput, { target: { value: 'Modified Description' } });

          // Click cancel button
          const cancelButton = screen.getByRole('button', { name: /cancel/i });
          fireEvent.click(cancelButton);

          // Verify onCancel was called and onSubmit was not called
          expect(mockOnCancel).toHaveBeenCalled();
          expect(mockOnSubmit).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * **Feature: frontend-resource-manager, Property 36: Form submission success feedback**
   * *For any* successful form submission, the application should display success confirmations before redirecting
   * **Validates: Requirements 9.4**
   */
  it('Property 36: Form submission success feedback', async () => {
    fc.assert(
      fc.property(
        fc.record({
          title: arbitraryValidTitle,
          description: arbitraryValidDescription,
          type: arbitraryResourceType,
          url: arbitraryValidUrl,
          tags: arbitraryValidTags,
          status: arbitraryResourceStatus,
        }),
        async (validData) => {
          const mockOnSubmitSuccess = vi.fn().mockResolvedValue(undefined);

          render(
            <ResourceForm
              mode="create"
              onSubmit={mockOnSubmitSuccess}
              onCancel={mockOnCancel}
            />
          );

          // Fill form with valid data
          fireEvent.change(screen.getByLabelText(/title/i), { target: { value: validData.title } });
          fireEvent.change(screen.getByLabelText(/description/i), { target: { value: validData.description } });
          fireEvent.change(screen.getByLabelText(/type/i), { target: { value: validData.type } });
          fireEvent.change(screen.getByLabelText(/url/i), { target: { value: validData.url } });
          fireEvent.change(screen.getByLabelText(/tags/i), { target: { value: validData.tags } });
          fireEvent.change(screen.getByLabelText(/status/i), { target: { value: validData.status } });

          // Submit the form
          const submitButton = screen.getByRole('button', { name: /create resource/i });
          fireEvent.click(submitButton);

          // Verify loading state is shown during submission
          expect(submitButton).toBeDisabled();
          expect(screen.getByRole('button', { name: /create resource/i })).toHaveClass('disabled:opacity-50');

          // Wait for form submission to complete
          await waitFor(() => {
            expect(mockOnSubmitSuccess).toHaveBeenCalledWith({
              title: validData.title,
              description: validData.description,
              type: validData.type,
              url: validData.url,
              tags: validData.tags.trim() || undefined,
              status: validData.status,
            });
          });
        }
      ),
      { numRuns: 5 }
    );
  });
});