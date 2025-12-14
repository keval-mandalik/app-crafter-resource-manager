# Integration Tests

This directory contains integration tests for the Frontend Resource Manager application. These tests verify the complete workflows and interactions between different components of the system.

## Test Structure

### 1. API Integration Tests (`api.integration.test.ts`)
- **Purpose**: Tests direct integration with the backend API
- **Coverage**: Authentication, CRUD operations, error handling, data consistency
- **Backend Dependency**: Requires backend server running on `http://localhost:3000`
- **Behavior**: Automatically skips tests if backend is not available

### 2. Activity Integration Tests (`activity.integration.test.ts`)
- **Purpose**: Tests activity tracking functionality with real backend
- **Coverage**: Activity generation, data integrity, pagination, filtering
- **Backend Dependency**: Requires backend server running on `http://localhost:3000`
- **Behavior**: Automatically skips tests if backend is not available

### 3. End-to-End Workflow Tests (`workflows.integration.test.tsx`)
- **Purpose**: Tests complete user workflows from UI perspective
- **Coverage**: Login flows, role-based access, search/filtering, activity tracking
- **Backend Dependency**: Some tests require backend, others use mocked data
- **Behavior**: Mixed approach - some tests skip if backend unavailable, others use mocks

### 4. Critical Workflow Tests (`critical-workflows.integration.test.tsx`)
- **Purpose**: Tests critical business workflows with component integration
- **Coverage**: Login-to-creation flow, editing/deletion, search integration, activity tracking
- **Backend Dependency**: Uses mocked services for isolated testing
- **Behavior**: Uses mocks and spies to test component interactions

## Running Integration Tests

### Prerequisites
- Frontend application must be built and dependencies installed
- For full integration tests, backend server should be running on port 3000

### Commands
```bash
# Run all integration tests
npm test -- --run src/test/integration

# Run specific integration test file
npm test -- --run src/test/integration/api.integration.test.ts

# Run with verbose output
npm test -- --run src/test/integration --reporter=verbose
```

## Test Behavior

### Backend Availability Detection
All integration tests that require backend connectivity include automatic detection:
- Tests attempt to connect to `http://localhost:3000/health`
- If connection fails, tests are automatically skipped with warning message
- This allows tests to run in CI/CD environments without backend

### Error Handling
- Network errors are handled gracefully
- Authentication failures are tested and expected
- Invalid data scenarios are covered
- UI error states are verified

### Data Management
- Tests create and clean up their own test data
- Unique identifiers are used to avoid conflicts
- Test data is isolated from production data

## Expected Results

### With Backend Running
- All API integration tests should pass
- Activity tracking tests should pass
- Workflow tests should demonstrate full functionality
- Critical workflow tests should pass with mocked services

### Without Backend Running
- API and activity tests will be skipped (expected)
- Workflow tests will partially run with mocks
- Critical workflow tests should pass (use mocks)
- No test failures due to missing backend

## Troubleshooting

### Common Issues
1. **Router nesting errors**: Ensure test wrappers don't conflict with App component's router
2. **Service import errors**: Use correct service class imports (e.g., `ResourceService` not `resourceService`)
3. **Authentication state**: Clear localStorage between tests to avoid state pollution
4. **Async operations**: Use proper `waitFor` and timeouts for async operations

### Debug Tips
- Check browser console for detailed error messages
- Verify backend server is running and accessible
- Ensure test data doesn't conflict with existing data
- Use `screen.debug()` to inspect rendered DOM in failing tests

## Integration with CI/CD

These tests are designed to work in automated environments:
- Graceful handling of missing backend services
- Proper cleanup of test data
- Clear pass/fail criteria
- Informative error messages for debugging