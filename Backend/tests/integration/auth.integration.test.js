const request = require('supertest');
const express = require('express');
const AuthService = require('../../services/auth/authService');
const authController = require('../../services/auth/authController');
const TestHelpers = require('../helpers/testHelpers');

// Mock dependencies
jest.mock('../../services/auth/authService');

describe('Auth Integration Tests', () => {
  let app;

  beforeAll(() => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    
    // Add auth routes
    app.post('/api/auth/register', authController.register);
    app.post('/api/auth/login', authController.login);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validRegistrationData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'CONTENT_MANAGER'
    };

    it('should successfully register a new user', async () => {
      // Arrange
      const expectedUser = TestHelpers.generateTestUser({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'CONTENT_MANAGER'
      });
      
      AuthService.register.mockResolvedValue(expectedUser);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 1,
        message: 'User created successfully',
        data: expectedUser
      });
      expect(AuthService.register).toHaveBeenCalledWith({
        body: validRegistrationData
      });
    });

    it('should return 400 for validation errors', async () => {
      // Arrange
      AuthService.register.mockRejectedValue({
        statusCode: 400,
        message: 'Validation error'
      });

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid-email' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 0,
        message: 'Validation error',
        data: {}
      });
    });

    it('should return 400 for existing user', async () => {
      // Arrange
      AuthService.register.mockRejectedValue({
        statusCode: 400,
        message: 'User with this email already exists.'
      });

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 0,
        message: 'User with this email already exists.',
        data: {}
      });
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'john@example.com',
      password: 'password123'
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const expectedResponse = {
        access_token: 'jwt-token',
        user: TestHelpers.generateTestUser()
      };
      
      AuthService.login.mockResolvedValue(expectedResponse);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 1,
        message: 'User logged in successfully',
        data: expectedResponse
      });
      expect(AuthService.login).toHaveBeenCalledWith({
        body: validLoginData
      });
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      AuthService.login.mockRejectedValue({
        statusCode: 401,
        message: 'Invalid credentials'
      });

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        status: 0,
        message: 'Invalid credentials',
        data: {}
      });
    });

    it('should return 400 for missing credentials', async () => {
      // Arrange
      AuthService.login.mockRejectedValue({
        statusCode: 400,
        message: 'Email and password are required'
      });

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'john@example.com' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 0,
        message: 'Email and password are required',
        data: {}
      });
    });
  });
});