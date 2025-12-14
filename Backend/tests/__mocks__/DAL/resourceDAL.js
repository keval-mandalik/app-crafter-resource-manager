// Mock ResourceDAL for testing
const ResourceDAL = {
  findResourceByWhere: jest.fn(),
  createResource: jest.fn(),
  updateResource: jest.fn(),
  deleteResource: jest.fn(),
  getResources: jest.fn()
};

module.exports = ResourceDAL;