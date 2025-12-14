const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * Test helper utilities
 */
class TestHelpers {
  
  /**
   * Generate a valid JWT token for testing
   * @param {Object} payload - Token payload
   * @returns {string} JWT token
   */
  static generateTestToken(payload = {}) {
    const defaultPayload = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'CONTENT_MANAGER',
      name: 'Test User'
    };
    
    return jwt.sign(
      { ...defaultPayload, ...payload },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  /**
   * Generate test user data
   * @param {Object} overrides - Override default values
   * @returns {Object} User data
   */
  static generateTestUser(overrides = {}) {
    return {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'CONTENT_MANAGER',
      passwordHash: '$2b$12$test.hash.value',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * Generate test resource data
   * @param {Object} overrides - Override default values
   * @returns {Object} Resource data
   */
  static generateTestResource(overrides = {}) {
    return {
      id: 'test-resource-id',
      title: 'Test Resource',
      description: 'Test resource description',
      type: 'Article',
      url: 'https://example.com/resource',
      tags: 'test,resource',
      status: 'Published',
      createdByUserId: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * Generate test activity data
   * @param {Object} overrides - Override default values
   * @returns {Object} Activity data
   */
  static generateTestActivity(overrides = {}) {
    return {
      id: 'test-activity-id',
      userId: 'test-user-id',
      resourceId: 'test-resource-id',
      actionType: 'CREATE',
      details: { test: 'data' },
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * Hash a password for testing
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  /**
   * Create mock request object
   * @param {Object} options - Request options
   * @returns {Object} Mock request
   */
  static createMockRequest(options = {}) {
    return {
      body: {},
      params: {},
      query: {},
      user: null,
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Test User Agent'),
      connection: { remoteAddress: '127.0.0.1' },
      ...options
    };
  }

  /**
   * Create mock response object
   * @returns {Object} Mock response
   */
  static createMockResponse() {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    return res;
  }

  /**
   * Create mock next function
   * @returns {Function} Mock next function
   */
  static createMockNext() {
    return jest.fn();
  }
}

module.exports = TestHelpers;