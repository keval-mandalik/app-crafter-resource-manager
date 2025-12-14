const ActivityService = require('./activityService');
const Utils = require('../../utils/httpResponseUtil');
const Joi = require('joi');

// Validation schema for query parameters
const activityQuerySchema = Joi.object({
    userId: Joi.string().uuid(),
    resourceId: Joi.string().uuid(),
    actionType: Joi.string().valid('CREATE', 'UPDATE', 'DELETE', 'VIEW'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10)
});

class ActivityController {
    
    /**
     * Get activity logs with filtering and pagination
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getActivityLogs(req, res) {
        try {
            // Validate query parameters
            const { error, value } = activityQuerySchema.validate(req.query, { 
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true
            });

            if (error) {
                const validationError = {
                    statusCode: 400,
                    message: `Validation error: ${error.details.map(d => d.message).join(', ')}`,
                    data: {}
                };
                return Utils.sendResponse(validationError, null, res, "");
            }

            // Additional validation for date range
            if (value.startDate && value.endDate && value.startDate > value.endDate) {
                const dateError = {
                    statusCode: 400,
                    message: 'Start date must be before or equal to end date',
                    data: {}
                };
                return Utils.sendResponse(dateError, null, res, "");
            }

            // Get activity logs from service
            const result = await ActivityService.getActivityLogs(value);
            
            // Format response with pagination metadata
            const responseData = {
                activities: result.data,
                pagination: result.pagination
            };

            Utils.sendResponse(null, responseData, res, "Activity logs retrieved successfully");

        } catch (error) {
            console.log('ActivityController.getActivityLogs error:', error);
            Utils.sendResponse(error, null, res, "");
        }
    }

    /**
     * Get activities for a specific user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getUserActivities(req, res) {
        try {
            const { userId } = req.params;
            
            // Validate user ID
            if (!userId) {
                const validationError = {
                    statusCode: 400,
                    message: 'User ID is required',
                    data: {}
                };
                return Utils.sendResponse(validationError, null, res, "");
            }

            // Validate pagination parameters
            const paginationSchema = Joi.object({
                page: Joi.number().integer().min(1).default(1),
                pageSize: Joi.number().integer().min(1).max(100).default(10)
            });

            const { error, value } = paginationSchema.validate(req.query);
            if (error) {
                const validationError = {
                    statusCode: 400,
                    message: `Validation error: ${error.details.map(d => d.message).join(', ')}`,
                    data: {}
                };
                return Utils.sendResponse(validationError, null, res, "");
            }

            const result = await ActivityService.getActivityByUser(userId, value);
            
            const responseData = {
                activities: result.data,
                pagination: result.pagination
            };

            Utils.sendResponse(null, responseData, res, "User activities retrieved successfully");

        } catch (error) {
            console.log('ActivityController.getUserActivities error:', error);
            Utils.sendResponse(error, null, res, "");
        }
    }

    /**
     * Get activities for a specific resource
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getResourceActivities(req, res) {
        try {
            const { resourceId } = req.params;
            
            // Validate resource ID
            if (!resourceId) {
                const validationError = {
                    statusCode: 400,
                    message: 'Resource ID is required',
                    data: {}
                };
                return Utils.sendResponse(validationError, null, res, "");
            }

            // Validate pagination parameters
            const paginationSchema = Joi.object({
                page: Joi.number().integer().min(1).default(1),
                pageSize: Joi.number().integer().min(1).max(100).default(10)
            });

            const { error, value } = paginationSchema.validate(req.query);
            if (error) {
                const validationError = {
                    statusCode: 400,
                    message: `Validation error: ${error.details.map(d => d.message).join(', ')}`,
                    data: {}
                };
                return Utils.sendResponse(validationError, null, res, "");
            }

            const result = await ActivityService.getActivityByResource(resourceId, value);
            
            const responseData = {
                activities: result.data,
                pagination: result.pagination
            };

            Utils.sendResponse(null, responseData, res, "Resource activities retrieved successfully");

        } catch (error) {
            console.log('ActivityController.getResourceActivities error:', error);
            Utils.sendResponse(error, null, res, "");
        }
    }
}

module.exports = ActivityController;