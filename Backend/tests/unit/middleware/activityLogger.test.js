const { activityLogger, create, update, delete: deleteLogger, view } = require('../../../middleware/activityLogger');
const ActivityService = require('../../../services/activity/activityService');
const TestHelpers = require('../../helpers/testHelpers');

// Mock dependencies
jest.mock('../../../services/activity/activityService');

describe('ActivityLogger Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = TestHelpers.createMockRequest({
      user: { id: 'user-id' },
      method: 'POST',
      originalUrl: '/api/resources',
      params: {},
      body: { title: 'Test Resource' },
      ip: '127.0.0.1'
    });

    res = TestHelpers.createMockResponse();
    res.statusCode = 200;
    
    next = TestHelpers.createMockNext();

    // Mock console.error to avoid noise in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('activityLogger', () => {
    it('should log activity for successful operations', async () => {
      // Arrange
      const middleware = activityLogger('CREATE');
      const responseData = { id: 'new-resource-id', title: 'Test Resource' };
      ActivityService.logActivity.mockResolvedValue({});

      // Act
      await middleware(req, res, next);
      res.json(responseData);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(ActivityService.logActivity).toHaveBeenCalledWith({
        userId: 'user-id',
        resourceId: 'new-resource-id', // Should get ID from response data for CREATE
        actionType: 'CREATE',
        details: {
          method: 'POST',
          path: '/api/resources',
          requestBody: { title: 'Test Resource' },
          timestamp: expect.any(String)
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Test User Agent'
      });
    });

    it('should extract resource ID from URL params for UPDATE operations', async () => {
      // Arrange
      const middleware = activityLogger('UPDATE');
      const responseData = { message: 'Updated successfully' };
      req.params = { id: 'resource-id' }; // Set params for this specific test
      ActivityService.logActivity.mockResolvedValue({});

      // Act
      await middleware(req, res, next);
      res.json(responseData);

      // Assert
      expect(ActivityService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceId: 'resource-id',
          actionType: 'UPDATE'
        })
      );
    });

    it('should extract resource ID from response data for CREATE operations', async () => {
      // Arrange
      const middleware = activityLogger('CREATE');
      const responseData = { data: { id: 'new-resource-id' } };
      ActivityService.logActivity.mockResolvedValue({});

      // Act
      await middleware(req, res, next);
      res.json(responseData);

      // Assert
      expect(ActivityService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceId: 'new-resource-id',
          actionType: 'CREATE'
        })
      );
    });

    it('should not log activity for error responses', async () => {
      // Arrange
      const middleware = activityLogger('CREATE');
      res.statusCode = 400; // Error status

      // Act
      await middleware(req, res, next);
      res.json({ error: 'Bad request' });

      // Assert
      expect(ActivityService.logActivity).not.toHaveBeenCalled();
    });

    it('should handle missing user context gracefully', async () => {
      // Arrange
      const middleware = activityLogger('CREATE');
      req.user = null;

      // Act & Assert
      expect(() => middleware(req, res, next)).not.toThrow();
      expect(next).toHaveBeenCalled();
    });

    it('should handle activity logging failures gracefully', async () => {
      // Arrange
      const middleware = activityLogger('CREATE');
      const responseData = { id: 'resource-id' };
      ActivityService.logActivity.mockRejectedValue(new Error('Logging failed'));

      // Act
      await middleware(req, res, next);
      res.json(responseData);

      // Wait for async activity logging to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Assert
      expect(console.error).toHaveBeenCalledWith('Activity logging failed:', expect.any(Error));
    });

    it('should include request body for CREATE and UPDATE operations', async () => {
      // Arrange
      const middleware = activityLogger('UPDATE');
      const responseData = { message: 'Updated' };
      ActivityService.logActivity.mockResolvedValue({});

      // Act
      await middleware(req, res, next);
      res.json(responseData);

      // Assert
      expect(ActivityService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            requestBody: { title: 'Test Resource' }
          })
        })
      );
    });

    it('should not include request body for VIEW operations', async () => {
      // Arrange
      const middleware = activityLogger('VIEW');
      const responseData = { data: 'resource data' };
      ActivityService.logActivity.mockResolvedValue({});

      // Act
      await middleware(req, res, next);
      res.json(responseData);

      // Assert
      expect(ActivityService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            requestBody: null
          })
        })
      );
    });

    it('should handle missing IP address', async () => {
      // Arrange
      const middleware = activityLogger('CREATE');
      req.ip = null;
      req.connection = { remoteAddress: null };
      req.socket = { remoteAddress: null };
      const responseData = { id: 'resource-id' };
      ActivityService.logActivity.mockResolvedValue({});

      // Act
      await middleware(req, res, next);
      res.json(responseData);

      // Assert
      expect(ActivityService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: null
        })
      );
    });

    it('should handle missing user agent', async () => {
      // Arrange
      const middleware = activityLogger('CREATE');
      req.get = jest.fn().mockReturnValue(null);
      const responseData = { id: 'resource-id' };
      ActivityService.logActivity.mockResolvedValue({});

      // Act
      await middleware(req, res, next);
      res.json(responseData);

      // Assert
      expect(ActivityService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          userAgent: null
        })
      );
    });
  });

  describe('convenience functions', () => {
    it('should create CREATE activity logger', async () => {
      // Arrange
      const middleware = create();
      const responseData = { id: 'resource-id' };
      ActivityService.logActivity.mockResolvedValue({});

      // Act
      await middleware(req, res, next);
      res.json(responseData);

      // Assert
      expect(ActivityService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'CREATE'
        })
      );
    });

    it('should create UPDATE activity logger', async () => {
      // Arrange
      const middleware = update();
      const responseData = { message: 'Updated' };
      ActivityService.logActivity.mockResolvedValue({});

      // Act
      await middleware(req, res, next);
      res.json(responseData);

      // Assert
      expect(ActivityService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'UPDATE'
        })
      );
    });

    it('should create DELETE activity logger', async () => {
      // Arrange
      const middleware = deleteLogger();
      const responseData = { message: 'Deleted' };
      ActivityService.logActivity.mockResolvedValue({});

      // Act
      await middleware(req, res, next);
      res.json(responseData);

      // Assert
      expect(ActivityService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'DELETE'
        })
      );
    });

    it('should create VIEW activity logger', async () => {
      // Arrange
      const middleware = view();
      const responseData = { data: 'resource' };
      ActivityService.logActivity.mockResolvedValue({});

      // Act
      await middleware(req, res, next);
      res.json(responseData);

      // Assert
      expect(ActivityService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'VIEW'
        })
      );
    });
  });
});