// Mock UserDAL for testing
const UserDAL = {
  findUserByWhere: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getAllUsers: jest.fn()
};

module.exports = UserDAL;