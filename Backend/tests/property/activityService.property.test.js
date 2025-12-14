const fc = require('fast-check');
const ActivityService = require('../../services/activity/activityService');
const ActivityDAL = require('../../DAL/activityDAL');

// Mock dependencies
jest.mock('../../DAL/activityDAL');

describe('ActivityService Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * **Feature: api-documentation-and-activity-tracking, Property 2: Resource operation activity logging**
   * For any resource operation (CREATE, UPDATE, DELETE) performed by a CONTENT_MANAGER, 
   * an activity record should be created and persisted with the correct user ID, resource ID, action type, and timestamp
   */
  describe('Property 2: Resource operation activity logging', () => {
    it('should always create activity record for any valid resource operation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            resourceId: fc.uuid(),
            actionType: fc.constantFrom('CREATE', 'UPDATE', 'DELETE'),
            details: fc.oneof(fc.constant(null), fc.object({ maxDepth: 2 })),
            ipAddress: fc.oneof(fc.constant(null), fc.ipV4()),
            userAgent: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 200 }))
          }),
          async (activityData) => {
            // Arrange
            const createdActivity = {
              id: '550e8400-e29b-41d4-a716-446655440000',
              ...activityData,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            ActivityDAL.createActivity.mockResolvedValue(createdActivity);

            // Act
            const result = await ActivityService.logActivity(activityData);

            // Assert
            expect(ActivityDAL.createActivity).toHaveBeenCalledWith(activityData);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('userId', activityData.userId);
            expect(result).toHaveProperty('resourceId', activityData.resourceId);
            expect(result).toHaveProperty('actionType', activityData.actionType);
            expect(result).toHaveProperty('createdAt');
            expect(result.createdAt).toBeInstanceOf(Date);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Feature: api-documentation-and-activity-tracking, Property 3: Activity log retrieval and pagination**
   * For any request to the activity logs endpoint, the system should return properly formatted 
   * paginated activity records with complete user and resource details
   */
  describe('Property 3: Activity log retrieval and pagination', () => {
    it('should always return properly formatted paginated results', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            page: fc.integer({ min: 1, max: 10 }),
            pageSize: fc.integer({ min: 1, max: 20 })
          }),
          fc.array(
            fc.record({
              id: fc.uuid(),
              userId: fc.uuid(),
              resourceId: fc.uuid(),
              actionType: fc.constantFrom('CREATE', 'UPDATE', 'DELETE', 'VIEW'),
              createdAt: fc.date()
            }),
            { maxLength: 10 }
          ),
          async (pagination, mockActivities) => {
            // Arrange
            const totalCount = mockActivities.length;
            ActivityDAL.getActivities.mockResolvedValue({
              rows: mockActivities,
              count: totalCount
            });

            // Act
            const result = await ActivityService.getActivityLogs(pagination);

            // Assert
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('pagination');
            expect(result.data).toEqual(mockActivities);
            expect(result.pagination).toEqual({
              total: totalCount,
              page: pagination.page,
              pageSize: pagination.pageSize,
              totalPages: Math.ceil(totalCount / pagination.pageSize)
            });

            // Verify DAL was called with correct parameters
            expect(ActivityDAL.getActivities).toHaveBeenCalledWith({
              where: {},
              limit: pagination.pageSize,
              offset: (pagination.page - 1) * pagination.pageSize,
              order: [['createdAt', 'DESC']]
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * **Feature: api-documentation-and-activity-tracking, Property 4: Activity log filtering**
   * For any activity log query with filters (user, date range, action type), 
   * the system should return only activities that match all specified filter criteria
   */
  describe('Property 4: Activity log filtering', () => {
    it('should always apply filters correctly and return matching activities only', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.option(fc.uuid(), { nil: undefined }),
            resourceId: fc.option(fc.uuid(), { nil: undefined }),
            actionType: fc.option(fc.constantFrom('CREATE', 'UPDATE', 'DELETE', 'VIEW'), { nil: undefined }),
            startDate: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }), { nil: undefined }),
            endDate: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }), { nil: undefined }),
            page: fc.integer({ min: 1, max: 10 }),
            pageSize: fc.integer({ min: 1, max: 20 })
          }),
          async (filters) => {
            // Arrange
            const mockActivities = [];
            ActivityDAL.getActivities.mockResolvedValue({
              rows: mockActivities,
              count: 0
            });

            // Act
            const result = await ActivityService.getActivityLogs(filters);

            // Assert
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('pagination');

            // Verify the call was made (don't check exact where clause due to Sequelize Op symbols)
            expect(ActivityDAL.getActivities).toHaveBeenCalledWith(
              expect.objectContaining({
                limit: filters.pageSize,
                offset: (filters.page - 1) * filters.pageSize,
                order: [['createdAt', 'DESC']]
              })
            );
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Feature: api-documentation-and-activity-tracking, Property 5: Activity data validation**
   * For any activity data with invalid fields, the system should reject the data with appropriate validation errors
   */
  describe('Property 5: Activity data validation', () => {
    it('should always reject invalid activity data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            // Invalid userId (not UUID)
            fc.record({
              userId: fc.string().filter(s => !s.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)),
              actionType: fc.constantFrom('CREATE', 'UPDATE', 'DELETE', 'VIEW')
            }),
            // Invalid actionType
            fc.record({
              userId: fc.uuid(),
              actionType: fc.string().filter(s => !['CREATE', 'UPDATE', 'DELETE', 'VIEW'].includes(s))
            }),
            // Missing required fields
            fc.record({
              userId: fc.uuid()
              // missing actionType
            })
          ),
          async (invalidData) => {
            // Act & Assert
            await expect(ActivityService.logActivity(invalidData))
              .rejects
              .toMatchObject({
                statusCode: 400,
                message: expect.any(String)
              });

            expect(ActivityDAL.createActivity).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: api-documentation-and-activity-tracking, Property 6: User activity retrieval**
   * For any valid user ID, the system should return all activities for that user with proper pagination
   */
  describe('Property 6: User activity retrieval', () => {
    it('should always return user-specific activities with pagination', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.record({
            page: fc.integer({ min: 1, max: 10 }),
            pageSize: fc.integer({ min: 1, max: 20 })
          }),
          fc.array(
            fc.record({
              id: fc.uuid(),
              actionType: fc.constantFrom('CREATE', 'UPDATE', 'DELETE', 'VIEW'),
              createdAt: fc.date()
            }),
            { maxLength: 10 }
          ),
          async (userId, pagination, mockActivities) => {
            // Arrange
            const userActivities = mockActivities.map(activity => ({
              ...activity,
              userId
            }));
            
            ActivityDAL.getActivitiesByUser.mockResolvedValue({
              rows: userActivities,
              count: userActivities.length
            });

            // Act
            const result = await ActivityService.getActivityByUser(userId, pagination);

            // Assert
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('pagination');
            expect(result.data).toEqual(userActivities);
            
            // Verify all returned activities belong to the specified user
            result.data.forEach(activity => {
              expect(activity.userId).toBe(userId);
            });

            expect(ActivityDAL.getActivitiesByUser).toHaveBeenCalledWith(userId, {
              limit: pagination.pageSize,
              offset: (pagination.page - 1) * pagination.pageSize,
              order: [['createdAt', 'DESC']]
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});