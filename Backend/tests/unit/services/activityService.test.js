const ActivityService = require('../../../services/activity/activityService');
const ActivityDAL = require('../../../DAL/activityDAL');
const TestHelpers = require('../../helpers/testHelpers');

// Mock dependencies
jest.mock('../../../DAL/activityDAL');

describe('ActivityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logActivity', () => {
    const validActivityData = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      resourceId: '550e8400-e29b-41d4-a716-446655440001',
      actionType: 'CREATE',
      details: { test: 'data' },
      ipAddress: '127.0.0.1',
      userAgent: 'Test User Agent'
    };

    it('should successfully log an activity', async () => {
      // Arrange
      const createdActivity = TestHelpers.generateTestActivity(validActivityData);
      ActivityDAL.createActivity.mockResolvedValue(createdActivity);

      // Act
      const result = await ActivityService.logActivity(validActivityData);

      // Assert
      expect(ActivityDAL.createActivity).toHaveBeenCalledWith(validActivityData);
      expect(result).toEqual(createdActivity);
    });

    it('should handle activity with null resourceId', async () => {
      // Arrange
      const activityData = { ...validActivityData, resourceId: null };
      const createdActivity = TestHelpers.generateTestActivity(activityData);
      ActivityDAL.createActivity.mockResolvedValue(createdActivity);

      // Act
      const result = await ActivityService.logActivity(activityData);

      // Assert
      expect(ActivityDAL.createActivity).toHaveBeenCalledWith(activityData);
      expect(result).toEqual(createdActivity);
    });

    it('should throw validation error for invalid userId', async () => {
      // Arrange
      const invalidData = { ...validActivityData, userId: 'invalid-uuid' };

      // Act & Assert
      await expect(ActivityService.logActivity(invalidData))
        .rejects
        .toMatchObject({
          statusCode: 400,
          message: expect.stringContaining('userId')
        });
    });

    it('should throw validation error for invalid actionType', async () => {
      // Arrange
      const invalidData = { ...validActivityData, actionType: 'INVALID_ACTION' };

      // Act & Assert
      await expect(ActivityService.logActivity(invalidData))
        .rejects
        .toMatchObject({
          statusCode: 400,
          message: expect.stringContaining('actionType')
        });
    });

    it('should throw validation error for missing required fields', async () => {
      // Arrange
      const incompleteData = {
        userId: '550e8400-e29b-41d4-a716-446655440000'
        // missing actionType
      };

      // Act & Assert
      await expect(ActivityService.logActivity(incompleteData))
        .rejects
        .toMatchObject({
          statusCode: 400
        });
    });
  });

  describe('getActivityLogs', () => {
    const mockActivities = [
      TestHelpers.generateTestActivity({ id: '1' }),
      TestHelpers.generateTestActivity({ id: '2' })
    ];

    it('should successfully retrieve activity logs with default pagination', async () => {
      // Arrange
      ActivityDAL.getActivities.mockResolvedValue({
        rows: mockActivities,
        count: 2
      });

      // Act
      const result = await ActivityService.getActivityLogs();

      // Assert
      expect(ActivityDAL.getActivities).toHaveBeenCalledWith({
        where: {},
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      expect(result).toEqual({
        data: mockActivities,
        pagination: {
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }
      });
    });

    it('should apply filters correctly', async () => {
      // Arrange
      const filters = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        resourceId: '550e8400-e29b-41d4-a716-446655440001',
        actionType: 'CREATE',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        page: 2,
        pageSize: 5
      };

      ActivityDAL.getActivities.mockResolvedValue({
        rows: mockActivities,
        count: 2
      });

      // Act
      const result = await ActivityService.getActivityLogs(filters);

      // Assert
      const callArgs = ActivityDAL.getActivities.mock.calls[0][0];
      expect(callArgs.where.userId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(callArgs.where.resourceId).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(callArgs.where.actionType).toBe('CREATE');
      expect(callArgs.where.createdAt).toBeDefined();
      expect(callArgs.limit).toBe(5);
      expect(callArgs.offset).toBe(5);
      expect(result.pagination).toEqual({
        total: 2,
        page: 2,
        pageSize: 5,
        totalPages: 1
      });
    });

    it('should handle date range filtering with only startDate', async () => {
      // Arrange
      const filters = {
        startDate: new Date('2023-01-01')
      };

      ActivityDAL.getActivities.mockResolvedValue({
        rows: [],
        count: 0
      });

      // Act
      await ActivityService.getActivityLogs(filters);

      // Assert
      const callArgs = ActivityDAL.getActivities.mock.calls[0][0];
      expect(callArgs.where.createdAt).toBeDefined();
      expect(callArgs.limit).toBe(10);
      expect(callArgs.offset).toBe(0);
    });

    it('should throw validation error for invalid filters', async () => {
      // Arrange
      const invalidFilters = {
        userId: 'invalid-uuid',
        page: -1,
        pageSize: 200 // exceeds max
      };

      // Act & Assert
      await expect(ActivityService.getActivityLogs(invalidFilters))
        .rejects
        .toMatchObject({
          statusCode: 400
        });
    });
  });

  describe('getActivityByUser', () => {
    it('should successfully retrieve user activities', async () => {
      // Arrange
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const mockActivities = [TestHelpers.generateTestActivity()];
      
      ActivityDAL.getActivitiesByUser.mockResolvedValue({
        rows: mockActivities,
        count: 1
      });

      // Act
      const result = await ActivityService.getActivityByUser(userId);

      // Assert
      expect(ActivityDAL.getActivitiesByUser).toHaveBeenCalledWith(userId, {
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      expect(result).toEqual({
        data: mockActivities,
        pagination: {
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }
      });
    });

    it('should throw error for missing userId', async () => {
      // Act & Assert
      await expect(ActivityService.getActivityByUser(null))
        .rejects
        .toEqual({
          statusCode: 400,
          message: 'User ID is required',
          data: {}
        });
    });

    it('should handle custom pagination', async () => {
      // Arrange
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const pagination = { page: 2, pageSize: 5 };
      
      ActivityDAL.getActivitiesByUser.mockResolvedValue({
        rows: [],
        count: 0
      });

      // Act
      await ActivityService.getActivityByUser(userId, pagination);

      // Assert
      expect(ActivityDAL.getActivitiesByUser).toHaveBeenCalledWith(userId, {
        limit: 5,
        offset: 5,
        order: [['createdAt', 'DESC']]
      });
    });
  });

  describe('getActivityByResource', () => {
    it('should successfully retrieve resource activities', async () => {
      // Arrange
      const resourceId = '550e8400-e29b-41d4-a716-446655440001';
      const mockActivities = [TestHelpers.generateTestActivity()];
      
      ActivityDAL.getActivitiesByResource.mockResolvedValue({
        rows: mockActivities,
        count: 1
      });

      // Act
      const result = await ActivityService.getActivityByResource(resourceId);

      // Assert
      expect(ActivityDAL.getActivitiesByResource).toHaveBeenCalledWith(resourceId, {
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      expect(result).toEqual({
        data: mockActivities,
        pagination: {
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }
      });
    });

    it('should throw error for missing resourceId', async () => {
      // Act & Assert
      await expect(ActivityService.getActivityByResource(null))
        .rejects
        .toEqual({
          statusCode: 400,
          message: 'Resource ID is required',
          data: {}
        });
    });
  });
});