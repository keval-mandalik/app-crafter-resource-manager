const Utils = require('../../../utils/httpResponseUtil');
const HTTPStatus = require('../../../utils/http-status');
const TestHelpers = require('../../helpers/testHelpers');

describe('HttpResponseUtil', () => {
  let res;

  beforeEach(() => {
    res = TestHelpers.createMockResponse();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('errorResponse', () => {
    it('should return error response structure', () => {
      const result = Utils.errorResponse();
      
      expect(result).toEqual({
        status: 0,
        data: {},
        message: 'Error'
      });
    });
  });

  describe('successResponse', () => {
    it('should return success response structure', () => {
      const result = Utils.successResponse();
      
      expect(result).toEqual({
        status: 1,
        data: {},
        message: 'Success'
      });
    });
  });

  describe('sendResponse', () => {
    it('should send success response', () => {
      // Arrange
      const data = { id: 1, name: 'Test' };
      const message = 'Operation successful';

      // Act
      Utils.sendResponse(null, data, res, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.OK);
      expect(res.send).toHaveBeenCalledWith({
        status: 1,
        data: data,
        message: message
      });
    });

    it('should send error response with object error', () => {
      // Arrange
      const error = {
        statusCode: 400,
        message: 'Validation failed',
        data: { field: 'email' }
      };

      // Act
      Utils.sendResponse(error, null, res, 'Success message');

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        status: 0,
        data: { field: 'email' },
        message: 'Validation failed'
      });
    });

    it('should send error response with default status code', () => {
      // Arrange
      const error = {
        message: 'Something went wrong'
      };

      // Act
      Utils.sendResponse(error, null, res, 'Success message');

      // Assert
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.send).toHaveBeenCalledWith({
        status: 0,
        data: undefined,
        message: 'Something went wrong'
      });
    });

    it('should handle error without message', () => {
      // Arrange
      const error = {
        statusCode: 500
      };

      // Act
      Utils.sendResponse(error, null, res, 'Success message');

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        status: 0,
        data: undefined,
        message: 'ERROR_MSG'
      });
    });

    it('should handle string error', () => {
      // Arrange
      const error = 'String error message';

      // Act
      Utils.sendResponse(error, null, res, 'Success message');

      // Assert
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.send).toHaveBeenCalledWith({
        status: 0,
        data: undefined,
        message: undefined
      });
    });
  });
});