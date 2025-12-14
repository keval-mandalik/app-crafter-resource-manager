// Test setup file
require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.TOKEN_EXPIRY = '1h';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test cleanup
afterAll(async () => {
  // Close any open database connections
  const { sequelize } = require('../models');
  if (sequelize) {
    await sequelize.close();
  }
});