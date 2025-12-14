// Mock ActivityDAL for testing
const ActivityDAL = {
  createActivity: jest.fn(),
  getActivities: jest.fn(),
  getActivitiesByUser: jest.fn(),
  getActivitiesByResource: jest.fn(),
  findActivityByWhere: jest.fn()
};

module.exports = ActivityDAL;