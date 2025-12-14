const AuthService = require('../../../services/auth/authService');
const UserDAL = require('../../../DAL/userDAL');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const TestHelpers = require('../../helpers/testHelpers');

// Mock dependencies
jest.mock('../../../DAL/userDAL');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegistrationData = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'CONTENT_MANAGER'
      }
    };

    it('should successfully register a new user', async () => {
      // Arrange
      const hashedPassword = 'hashed-password';
      const newUser = {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'CONTENT_MANAGER',
        passwordHash: hashedPassword,
        toJSON: () => ({
          id: 'user-id',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'CONTENT_MANAGER',
          passwordHash: hashedPassword
        })
      };

      UserDAL.findUserByWhere.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      UserDAL.createUser.mockResolvedValue(newUser);

      // Act
      const result = await AuthService.register(validRegistrationData);

      // Assert
      expect(UserDAL.findUserByWhere).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(UserDAL.createUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: hashedPassword,
        role: 'CONTENT_MANAGER'
      });
      expect(result).toEqual({
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'CONTENT_MANAGER'
      });
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      const existingUser = TestHelpers.generateTestUser();
      UserDAL.findUserByWhere.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(AuthService.register(validRegistrationData))
        .rejects
        .toEqual({
          statusCode: 400,
          message: "User with this email already exists."
        });
    });

    it('should throw validation error for invalid input', async () => {
      // Arrange
      const invalidData = {
        body: {
          name: '',
          email: 'invalid-email',
          password: '123', // too short
          role: 'INVALID_ROLE'
        }
      };

      // Act & Assert
      await expect(AuthService.register(invalidData))
        .rejects
        .toMatchObject({
          statusCode: 400,
          message: expect.stringContaining('name')
        });
    });

    it('should throw validation error for missing required fields', async () => {
      // Arrange
      const incompleteData = {
        body: {
          name: 'John Doe'
          // missing email, password, role
        }
      };

      // Act & Assert
      await expect(AuthService.register(incompleteData))
        .rejects
        .toMatchObject({
          statusCode: 400
        });
    });
  });

  describe('login', () => {
    const validLoginData = {
      body: {
        email: 'john@example.com',
        password: 'password123'
      }
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const user = {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'CONTENT_MANAGER',
        passwordHash: 'hashed-password',
        toJSON: () => ({
          id: 'user-id',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'CONTENT_MANAGER',
          passwordHash: 'hashed-password'
        })
      };
      const token = 'jwt-token';

      UserDAL.findUserByWhere.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(token);

      // Act
      const result = await AuthService.login(validLoginData);

      // Assert
      expect(UserDAL.findUserByWhere).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: 'user-id',
          email: 'john@example.com',
          role: 'CONTENT_MANAGER',
          name: 'John Doe'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRY }
      );
      expect(result).toEqual({
        access_token: token,
        user: {
          id: 'user-id',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'CONTENT_MANAGER'
        }
      });
    });

    it('should throw error for non-existent user', async () => {
      // Arrange
      UserDAL.findUserByWhere.mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.login(validLoginData))
        .rejects
        .toEqual({
          statusCode: 401,
          message: 'Invalid credentials'
        });
    });

    it('should throw error for invalid password', async () => {
      // Arrange
      const user = TestHelpers.generateTestUser();
      UserDAL.findUserByWhere.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(AuthService.login(validLoginData))
        .rejects
        .toEqual({
          statusCode: 401,
          message: 'Invalid credentials'
        });
    });

    it('should throw error for missing email or password', async () => {
      // Arrange
      const incompleteData = {
        body: {
          email: 'john@example.com'
          // missing password
        }
      };

      // Act & Assert
      await expect(AuthService.login(incompleteData))
        .rejects
        .toEqual({
          statusCode: 400,
          message: 'Email and password are required'
        });
    });
  });
});