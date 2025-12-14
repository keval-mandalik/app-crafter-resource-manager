// Coverage configuration for different test types
module.exports = {
  // Unit test coverage thresholds
  unit: {
    branches: 80,
    functions: 85,
    lines: 80,
    statements: 80
  },
  
  // Integration test coverage thresholds
  integration: {
    branches: 70,
    functions: 75,
    lines: 70,
    statements: 70
  },
  
  // Overall coverage thresholds
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  },
  
  // Files to include in coverage
  collectCoverageFrom: [
    'services/**/*.js',
    'middleware/**/*.js',
    'DAL/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ]
};