const AuthController = require('../../../services/auth/authController');
const AuthService = require('../../../services/auth/authService');
const Utils = require('../../../utils/httpResponseUtil');
const TestHelpers = require('../../helpers/testHelpers');

// Mock dependencies
jest.mock('../../../services/auth/authService');
jest.mock('../../../utils/httpResponseUtil');

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = TestHelpers.createMockRequest();
    res = TestHelpers.createMockResponse();
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      // Arrange
      const userData = TestHelpers.generateTestUser();
      AuthService.register.mockResolvedValue(userData);

      // Act
      await AuthController.register(req, res);

      // Assert
      expect(AuthService.register).toHaveBeenCalledWith(req);
      expect(Utils.sendResponse).toHaveBeenCalledWith(null, userData, res, "User created successfully");
    });

    it('should handle registration errors', async () => {
      // Arrange
      const error = { statusCode: 400, message: 'Validation error' };
      AuthService.register.mockRejectedValue(error);

      // Act
      await AuthController.register(req, res);

      // Assert
      expect(AuthService.register).toHaveBeenCalledWith(req);
      expect(Utils.sendResponse).toHaveBeenCalledWith(error, null, res, "");
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      // Arrange
      const loginResult = {
        access_token: 'jwt-token',
        user: TestHelpers.generateTestUser()
      };
      AuthService.login.mockResolvedValue(loginResult);

      // Act
      await AuthController.login(req, res);

      // Assert
      expect(AuthService.login).toHaveBeenCalledWith(req);
      expect(Utils.sendResponse).toHaveBeenCalledWith(null, loginResult, res, "User logged in successfully");
    });

    it('should handle login errors', async () => {
      // Arrange
      const error = { statusCode: 401, message: 'Invalid credentials' };
      AuthService.login.mockRejectedValue(error);

      // Act
      await AuthController.login(req, res);

      // Assert
      expect(AuthService.login).toHaveBeenCalledWith(req);
      expect(Utils.sendResponse).toHaveBeenCalledWith(error, null, res, "");
    });
  });
});