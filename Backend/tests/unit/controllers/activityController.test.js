const ActivityController = require('../../../services/activity/activityController');
const ActivityService = require('../../../services/activity/activityService');
const Utils = require('../../../utils/httpResponseUtil');
const TestHelpers = require('../../helpers/testHelpers');

// Mock dependencies
jest.mock('../../../services/activity/activityService');
jest.mock('../../../utils/httpResponseUtil');

describe('ActivityController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = TestHelpers.createMockRequest({
      query: {
        page: '1',
        pageSize: '10',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        actionType: 'CREATE'
      }
    });
    res = TestHelpers.createMockResponse();
  });

  describe('getActivityLogs', () => {
    it('should successfully retrieve activity logs', async () => {
      // Arrange
      const mockActivities = {
        data: [TestHelpers.generateTestActivity()],
        pagination: {
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }
      };
      ActivityService.getActivityLogs.mockResolvedValue(mockActivities);

      // Act
      await ActivityController.getActivityLogs(req, res);

      // Assert
      expect(ActivityService.getActivityLogs).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        userId: '550e8400-e29b-41d4-a716-446655440000',
        actionType: 'CREATE'
      });
      expect(Utils.sendResponse).toHaveBeenCalledWith(null, {
        activities: mockActivities.data,
        pagination: mockActivities.pagination
      }, res, "Activity logs retrieved successfully");
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = { statusCode: 400, message: 'Invalid parameters' };
      ActivityService.getActivityLogs.mockRejectedValue(error);

      // Act
      await ActivityController.getActivityLogs(req, res);

      // Assert
      expect(ActivityService.getActivityLogs).toHaveBeenCalled();
      expect(Utils.sendResponse).toHaveBeenCalledWith(error, null, res, "");
    });

    it('should handle missing query parameters', async () => {
      // Arrange
      req.query = {};
      const mockActivities = {
        data: [],
        pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 }
      };
      ActivityService.getActivityLogs.mockResolvedValue(mockActivities);

      // Act
      await ActivityController.getActivityLogs(req, res);

      // Assert
      expect(ActivityService.getActivityLogs).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10
      });
      expect(Utils.sendResponse).toHaveBeenCalledWith(null, {
        activities: mockActivities.data,
        pagination: mockActivities.pagination
      }, res, "Activity logs retrieved successfully");
    });

    it('should parse date parameters correctly', async () => {
      // Arrange
      req.query = {
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      };
      const mockActivities = { data: [], pagination: {} };
      ActivityService.getActivityLogs.mockResolvedValue(mockActivities);

      // Act
      await ActivityController.getActivityLogs(req, res);

      // Assert
      expect(ActivityService.getActivityLogs).toHaveBeenCalledWith({
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        page: 1,
        pageSize: 10
      });
    });
  });
});