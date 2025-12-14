const fc = require('fast-check');
const AuthService = require('../../services/auth/authService');
const UserDAL = require('../../DAL/userDAL');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../DAL/userDAL');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * **Feature: api-documentation-and-activity-tracking, Property 1: User registration validation**
   * For any valid user registration data, the system should create a user and return user data without password
   */
  describe('Property 1: User registration validation', () => {
    it('should always return user data without password for valid registration', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('CONTENT_MANAGER', 'VIEWER')
          }),
          async (userData) => {
            // Arrange
            const hashedPassword = 'hashed-password';
            const newUser = {
              id: 'user-id',
              ...userData,
              passwordHash: hashedPassword,
              toJSON: () => ({
                id: 'user-id',
                ...userData,
                passwordHash: hashedPassword
              })
            };

            UserDAL.findUserByWhere.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue(hashedPassword);
            UserDAL.createUser.mockResolvedValue(newUser);

            // Act
            const result = await AuthService.register({ body: userData });

            // Assert
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name', userData.name);
            expect(result).toHaveProperty('email', userData.email);
            expect(result).toHaveProperty('role', userData.role);
            expect(result).not.toHaveProperty('passwordHash');
            expect(result).not.toHaveProperty('password');
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * **Feature: api-documentation-and-activity-tracking, Property 2: Login token generation**
   * For any valid user login, the system should generate a JWT token with correct user claims
   */
  describe('Property 2: Login token generation', () => {
    it('should always generate valid JWT token for successful login', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            email: fc.emailAddress(),
            role: fc.constantFrom('CONTENT_MANAGER', 'VIEWER'),
            passwordHash: fc.string({ minLength: 10 })
          }),
          fc.string({ minLength: 8, maxLength: 50 }),
          async (user, password) => {
            // Arrange
            const token = 'generated-jwt-token';
            const userWithToJSON = {
              ...user,
              toJSON: () => ({ ...user })
            };

            UserDAL.findUserByWhere.mockResolvedValue(userWithToJSON);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue(token);

            // Act
            const result = await AuthService.login({
              body: { email: user.email, password }
            });

            // Assert
            expect(result).toHaveProperty('access_token', token);
            expect(result).toHaveProperty('user');
            expect(result.user).toHaveProperty('id', user.id);
            expect(result.user).toHaveProperty('email', user.email);
            expect(result.user).toHaveProperty('role', user.role);
            expect(result.user).not.toHaveProperty('passwordHash');
            
            // Verify JWT was called with correct payload
            expect(jwt.sign).toHaveBeenCalledWith(
              {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
              },
              process.env.JWT_SECRET,
              { expiresIn: process.env.TOKEN_EXPIRY }
            );
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * **Feature: api-documentation-and-activity-tracking, Property 3: Password security**
   * For any password, the system should always hash it before storage and never store plain text
   */
  describe('Property 3: Password security', () => {
    it('should always hash passwords and never store plain text', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 50 }),
          fc.record({
            name: fc.string({ minLength: 1 }),
            email: fc.emailAddress(),
            role: fc.constantFrom('CONTENT_MANAGER', 'VIEWER')
          }),
          async (password, userData) => {
            // Arrange
            const hashedPassword = `hashed-${password}`;
            const newUser = {
              id: 'user-id',
              ...userData,
              passwordHash: hashedPassword,
              toJSON: () => ({
                id: 'user-id',
                ...userData,
                passwordHash: hashedPassword
              })
            };

            UserDAL.findUserByWhere.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue(hashedPassword);
            UserDAL.createUser.mockResolvedValue(newUser);

            // Act
            await AuthService.register({
              body: { ...userData, password }
            });

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
            expect(UserDAL.createUser).toHaveBeenCalledWith({
              ...userData,
              passwordHash: hashedPassword
            });
            
            // Verify plain password is never passed to createUser
            const createUserCall = UserDAL.createUser.mock.calls[0][0];
            expect(createUserCall).not.toHaveProperty('password');
            expect(createUserCall.passwordHash).not.toBe(password);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * **Feature: api-documentation-and-activity-tracking, Property 4: Email uniqueness validation**
   * For any email that already exists, registration should always fail with appropriate error
   */
  describe('Property 4: Email uniqueness validation', () => {
    it('should always reject registration for existing emails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.record({
            name: fc.string({ minLength: 1 }),
            password: fc.string({ minLength: 8 }),
            role: fc.constantFrom('CONTENT_MANAGER', 'VIEWER')
          }),
          async (email, userData) => {
            // Arrange
            const existingUser = { id: 'existing-id', email };
            UserDAL.findUserByWhere.mockResolvedValue(existingUser);

            // Act & Assert
            await expect(AuthService.register({
              body: { ...userData, email }
            })).rejects.toEqual({
              statusCode: 400,
              message: "User with this email already exists."
            });

            expect(UserDAL.findUserByWhere).toHaveBeenCalledWith({ email });
            expect(UserDAL.createUser).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});