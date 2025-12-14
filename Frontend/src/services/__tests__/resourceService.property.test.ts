import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { ResourceService } from '../resourceService';
import { api } from '../api';
import type { Resource, CreateResourceData, UpdateResourceData, ResourceListResponse, ApiResponse } from '../../types';

// Mock the API module
vi.mock('../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

describe('ResourceService Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Generators for property-based testing
  const resourceTypeArb = fc.constantFrom('Article', 'Video', 'Tutorial');
  const resourceStatusArb = fc.constantFrom('Draft', 'Published', 'Archived');
  
  const createResourceDataArb = fc.record({
    title: fc.string({ minLength: 1, maxLength: 200 }),
    description: fc.string({ minLength: 1, maxLength: 1000 }),
    type: resourceTypeArb,
    url: fc.webUrl(),
    tags: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
    status: fc.option(resourceStatusArb, { nil: undefined }),
  });

  const resourceArb = fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 200 }),
    description: fc.string({ minLength: 1, maxLength: 1000 }),
    type: resourceTypeArb,
    url: fc.webUrl(),
    tags: fc.string({ maxLength: 500 }),
    status: resourceStatusArb,
    createdByUserId: fc.uuid(),
    createdAt: fc.integer({ min: 1577836800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
    updatedAt: fc.integer({ min: 1577836800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
  });

  const updateResourceDataArb = fc.record({
    title: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
    description: fc.option(fc.string({ minLength: 1, maxLength: 1000 }), { nil: undefined }),
    type: fc.option(resourceTypeArb, { nil: undefined }),
    url: fc.option(fc.webUrl(), { nil: undefined }),
    tags: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
    status: fc.option(resourceStatusArb, { nil: undefined }),
  });

  describe('Property 6: Resource creation flow', () => {
    /**
     * **Feature: frontend-resource-manager, Property 6: Resource creation flow**
     * For any valid resource data submitted by a CONTENT_MANAGER, 
     * the application should send the data to the backend API and display success confirmation
     * **Validates: Requirements 2.2**
     */
    it('should successfully create resources for any valid resource data', async () => {
      await fc.assert(
        fc.asyncProperty(createResourceDataArb, resourceArb, async (createData, expectedResource) => {
          // Arrange: Mock successful API response
          const mockResponse: ApiResponse<Resource> = {
            success: true,
            message: 'Resource created successfully',
            data: expectedResource,
          };
          mockApi.post.mockResolvedValueOnce(mockResponse);

          // Act: Call the service method
          const result = await ResourceService.createResource(createData);

          // Assert: Verify the API was called correctly and returns expected data
          expect(mockApi.post).toHaveBeenCalledWith('/resource', createData);
          expect(result).toEqual(expectedResource);
        }),
        { numRuns: 100 }
      );
    });

    it('should validate required fields and reject invalid resource data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.option(fc.string(), { nil: undefined }),
            description: fc.option(fc.string(), { nil: undefined }),
            type: fc.option(fc.string(), { nil: undefined }),
            url: fc.option(fc.string(), { nil: undefined }),
          }),
          async (invalidData) => {
            // Skip if all required fields are present and valid
            if (
              invalidData.title &&
              invalidData.description &&
              invalidData.type &&
              invalidData.url &&
              ['Article', 'Video', 'Tutorial'].includes(invalidData.type)
            ) {
              try {
                new URL(invalidData.url);
                return; // Skip this test case as it's valid
              } catch {
                // URL is invalid, continue with test
              }
            }

            // Act & Assert: Should throw validation error
            await expect(
              ResourceService.createResource(invalidData as CreateResourceData)
            ).rejects.toThrow();

            // Verify API was not called for invalid data
            expect(mockApi.post).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Resource update flow', () => {
    /**
     * **Feature: frontend-resource-manager, Property 11: Resource update flow**
     * For any updated resource data submitted by a CONTENT_MANAGER, 
     * the application should send the changes to the backend API
     * **Validates: Requirements 3.2**
     */
    it('should successfully update resources for any valid update data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          updateResourceDataArb,
          resourceArb,
          async (resourceId, updateData, expectedResource) => {
            // Arrange: Mock successful API response
            const mockResponse: ApiResponse<Resource> = {
              success: true,
              message: 'Resource updated successfully',
              data: expectedResource,
            };
            mockApi.put.mockResolvedValueOnce(mockResponse);

            // Act: Call the service method
            const result = await ResourceService.updateResource(resourceId, updateData);

            // Assert: Verify the API was called correctly and returns expected data
            expect(mockApi.put).toHaveBeenCalledWith(`/resource/${resourceId}`, updateData);
            expect(result).toEqual(expectedResource);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate resource ID and reject invalid IDs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(''),
            fc.constant(null),
            fc.constant(undefined),
            fc.integer(),
            fc.boolean()
          ),
          updateResourceDataArb,
          async (invalidId, updateData) => {
            // Act & Assert: Should throw validation error for invalid ID
            await expect(
              ResourceService.updateResource(invalidId as string, updateData)
            ).rejects.toThrow('Resource ID is required and must be a string');

            // Verify API was not called for invalid ID
            expect(mockApi.put).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate URL format in update data when provided', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.string().filter(s => {
            try {
              new URL(s);
              return false; // Skip valid URLs
            } catch {
              return s.length > 0; // Only test invalid, non-empty URLs
            }
          }),
          async (resourceId, invalidUrl) => {
            const updateData: UpdateResourceData = { url: invalidUrl };

            // Act & Assert: Should throw validation error for invalid URL
            await expect(
              ResourceService.updateResource(resourceId, updateData)
            ).rejects.toThrow('Invalid URL format');

            // Verify API was not called for invalid URL
            expect(mockApi.put).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 16: Confirmed deletion execution', () => {
    /**
     * **Feature: frontend-resource-manager, Property 16: Confirmed deletion execution**
     * For any confirmed deletion, the application should send an archive request to the backend API
     * **Validates: Requirements 4.2**
     */
    it('should successfully delete resources for any valid resource ID', async () => {
      await fc.assert(
        fc.asyncProperty(fc.uuid(), async (resourceId) => {
          // Arrange: Mock successful API response
          const mockResponse: ApiResponse<void> = {
            success: true,
            message: 'Resource deleted successfully',
            data: undefined,
          };
          mockApi.delete.mockResolvedValueOnce(mockResponse);

          // Act: Call the service method
          await ResourceService.deleteResource(resourceId);

          // Assert: Verify the API was called correctly
          expect(mockApi.delete).toHaveBeenCalledWith(`/resource/${resourceId}`);
        }),
        { numRuns: 100 }
      );
    });

    it('should validate resource ID and reject invalid IDs for deletion', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(''),
            fc.constant(null),
            fc.constant(undefined),
            fc.integer(),
            fc.boolean()
          ),
          async (invalidId) => {
            // Act & Assert: Should throw validation error for invalid ID
            await expect(
              ResourceService.deleteResource(invalidId as string)
            ).rejects.toThrow('Resource ID is required and must be a string');

            // Verify API was not called for invalid ID
            expect(mockApi.delete).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Additional Resource Service Properties', () => {
    it('should handle query parameters correctly for resource listing', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
            limit: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
            search: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
            type: fc.option(resourceTypeArb, { nil: undefined }),
            status: fc.option(resourceStatusArb, { nil: undefined }),
          }),
          async (params) => {
            // Arrange: Mock successful API response
            const mockResponse: ApiResponse<ResourceListResponse> = {
              success: true,
              message: 'Resources retrieved successfully',
              data: {
                items: [],
                pagination: {
                  page: params.page || 1,
                  limit: params.limit || 10,
                  total: 0,
                  totalPages: 0,
                },
              },
            };
            mockApi.get.mockResolvedValueOnce(mockResponse);

            // Act: Call the service method
            const result = await ResourceService.getResources(params);

            // Assert: Verify the API was called with correct URL
            expect(mockApi.get).toHaveBeenCalledWith(
              expect.stringMatching(/^\/resource(\?.*)?$/)
            );
            expect(result).toEqual(mockResponse.data);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should fetch individual resources by ID', async () => {
      await fc.assert(
        fc.asyncProperty(fc.uuid(), resourceArb, async (resourceId, expectedResource) => {
          // Arrange: Mock successful API response
          const mockResponse: ApiResponse<Resource> = {
            success: true,
            message: 'Resource retrieved successfully',
            data: expectedResource,
          };
          mockApi.get.mockResolvedValueOnce(mockResponse);

          // Act: Call the service method
          const result = await ResourceService.getResource(resourceId);

          // Assert: Verify the API was called correctly and returns expected data
          expect(mockApi.get).toHaveBeenCalledWith(`/resource/${resourceId}`);
          expect(result).toEqual(expectedResource);
        }),
        { numRuns: 100 }
      );
    });
  });
});