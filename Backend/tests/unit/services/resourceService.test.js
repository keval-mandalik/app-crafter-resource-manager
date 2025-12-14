const ResourceService = require('../../../services/resource/resourceService');
const ResourceDAL = require('../../../DAL/resourceDAL');
const ActivityService = require('../../../services/activity/activityService');
const TestHelpers = require('../../helpers/testHelpers');

// Mock dependencies
jest.mock('../../../DAL/resourceDAL');
jest.mock('../../../services/activity/activityService');

describe('ResourceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid noise in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('AddResource', () => {
    const validResourceData = {
      body: {
        title: 'Test Resource',
        description: 'Test description',
        type: 'Article',
        url: 'https://example.com',
        tags: 'test,resource',
        status: 'Published'
      },
      user: { id: 'user-id' },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Test User Agent')
    };

    it('should successfully create a new resource', async () => {
      // Arrange
      const createdResource = {
        id: 'resource-id',
        ...validResourceData.body,
        createdByUserId: 'user-id'
      };

      ResourceDAL.createResource.mockResolvedValue(createdResource);
      ActivityService.logActivity.mockResolvedValue({});

      // Act
      const result = await ResourceService.AddResource(validResourceData);

      // Assert
      expect(ResourceDAL.createResource).toHaveBeenCalledWith({
        ...validResourceData.body,
        createdByUserId: 'user-id'
      });
      expect(ActivityService.logActivity).toHaveBeenCalledWith({
        userId: 'user-id',
        resourceId: 'resource-id',
        actionType: 'CREATE',
        details: {
          title: 'Test Resource',
          type: 'Article',
          status: 'Published'
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Test User Agent'
      });
      expect(result).toEqual(createdResource);
    });

    it('should create resource even if activity logging fails', async () => {
      // Arrange
      const createdResource = TestHelpers.generateTestResource();
      ResourceDAL.createResource.mockResolvedValue(createdResource);
      ActivityService.logActivity.mockRejectedValue(new Error('Activity logging failed'));

      // Act
      const result = await ResourceService.AddResource(validResourceData);

      // Assert
      expect(result).toEqual(createdResource);
      expect(console.error).toHaveBeenCalledWith('Failed to log CREATE activity:', expect.any(Error));
    });

    it('should throw validation error for invalid input', async () => {
      // Arrange
      const invalidData = {
        body: {
          title: '', // empty title
          description: 'Test description',
          type: 'InvalidType',
          url: 'invalid-url',
          status: 'Published'
        },
        user: { id: 'user-id' }
      };

      // Act & Assert
      await expect(ResourceService.AddResource(invalidData))
        .rejects
        .toMatchObject({
          statusCode: 400
        });
    });
  });

  describe('getResource', () => {
    it('should successfully retrieve a resource', async () => {
      // Arrange
      const resource = TestHelpers.generateTestResource();
      const req = { params: { id: 'resource-id' } };
      ResourceDAL.findResourceByWhere.mockResolvedValue(resource);

      // Act
      const result = await ResourceService.getResource(req);

      // Assert
      expect(ResourceDAL.findResourceByWhere).toHaveBeenCalledWith({ id: 'resource-id' });
      expect(result).toEqual(resource);
    });

    it('should throw error for non-existent resource', async () => {
      // Arrange
      const req = { params: { id: 'non-existent-id' } };
      ResourceDAL.findResourceByWhere.mockResolvedValue(null);

      // Act & Assert
      await expect(ResourceService.getResource(req))
        .rejects
        .toEqual({
          statusCode: 404,
          message: 'Resource not found',
          data: {}
        });
    });
  });

  describe('updateResource', () => {
    const updateData = {
      params: { id: 'resource-id' },
      body: {
        title: 'Updated Title',
        status: 'Draft'
      },
      user: { id: 'user-id' },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Test User Agent')
    };

    it('should successfully update a resource', async () => {
      // Arrange
      const existingResource = TestHelpers.generateTestResource({
        title: 'Original Title',
        status: 'Published'
      });
      const updatedResource = { ...existingResource, ...updateData.body };

      ResourceDAL.findResourceByWhere.mockResolvedValue(existingResource);
      ResourceDAL.updateResource.mockResolvedValue(updatedResource);
      ActivityService.logActivity.mockResolvedValue({});

      // Act
      const result = await ResourceService.updateResource(updateData);

      // Assert
      expect(ResourceDAL.findResourceByWhere).toHaveBeenCalledWith({ id: 'resource-id' });
      expect(ResourceDAL.updateResource).toHaveBeenCalledWith(
        updateData.body,
        { id: 'resource-id' }
      );
      expect(ActivityService.logActivity).toHaveBeenCalledWith({
        userId: 'user-id',
        resourceId: 'resource-id',
        actionType: 'UPDATE',
        details: {
          changedFields: {
            title: { from: 'Original Title', to: 'Updated Title' },
            status: { from: 'Published', to: 'Draft' }
          },
          title: 'Updated Title'
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Test User Agent'
      });
      expect(result).toEqual(updatedResource);
    });

    it('should throw error for non-existent resource', async () => {
      // Arrange
      ResourceDAL.findResourceByWhere.mockResolvedValue(null);

      // Act & Assert
      await expect(ResourceService.updateResource(updateData))
        .rejects
        .toEqual({
          statusCode: 404,
          message: 'Resource not found',
          data: {}
        });
    });
  });

  describe('deleteResource', () => {
    const deleteData = {
      params: { id: 'resource-id' },
      user: { id: 'user-id' },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Test User Agent')
    };

    it('should successfully archive a resource', async () => {
      // Arrange
      const resource = TestHelpers.generateTestResource({ status: 'Published' });
      const archivedResource = { ...resource, status: 'Archived' };

      ResourceDAL.findResourceByWhere.mockResolvedValue(resource);
      ResourceDAL.updateResource.mockResolvedValue(archivedResource);
      ActivityService.logActivity.mockResolvedValue({});

      // Act
      const result = await ResourceService.deleteResource(deleteData);

      // Assert
      expect(ResourceDAL.updateResource).toHaveBeenCalledWith(
        { status: 'Archived' },
        { id: 'resource-id' }
      );
      expect(ActivityService.logActivity).toHaveBeenCalledWith({
        userId: 'user-id',
        resourceId: 'resource-id',
        actionType: 'DELETE',
        details: {
          title: resource.title,
          type: resource.type,
          previousStatus: 'Published',
          action: 'archived'
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Test User Agent'
      });
      expect(result).toEqual({
        message: 'Resource archived successfully',
        data: archivedResource
      });
    });

    it('should handle already archived resource', async () => {
      // Arrange
      const resource = TestHelpers.generateTestResource({ status: 'Archived' });
      ResourceDAL.findResourceByWhere.mockResolvedValue(resource);

      // Act
      const result = await ResourceService.deleteResource(deleteData);

      // Assert
      expect(ResourceDAL.updateResource).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Resource already archived',
        data: resource
      });
    });
  });

  describe('getResourceList', () => {
    it('should successfully retrieve paginated resource list', async () => {
      // Arrange
      const resources = [
        TestHelpers.generateTestResource({ id: '1' }),
        TestHelpers.generateTestResource({ id: '2' })
      ];
      const req = {
        query: {
          page: '1',
          pageSize: '10',
          search: 'test',
          type: 'Article',
          status: 'Published'
        }
      };

      ResourceDAL.getResources.mockResolvedValue({
        rows: resources,
        count: 2
      });

      // Act
      const result = await ResourceService.getResourceList(req);

      // Assert
      expect(ResourceDAL.getResources).toHaveBeenCalledWith({
        where: expect.objectContaining({
          type: 'Article',
          status: 'Published'
        }),
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      expect(result).toEqual({
        data: resources,
        pagination: {
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }
      });
    });

    it('should handle empty query parameters', async () => {
      // Arrange
      const req = { query: {} };
      ResourceDAL.getResources.mockResolvedValue({ rows: [], count: 0 });

      // Act
      const result = await ResourceService.getResourceList(req);

      // Assert
      expect(ResourceDAL.getResources).toHaveBeenCalledWith({
        where: {},
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      expect(result.pagination).toEqual({
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      });
    });
  });
});