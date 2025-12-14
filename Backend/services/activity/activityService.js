const ActivityDAL = require("../../DAL/activityDAL");
const { Op } = require('sequelize');
const Joi = require('joi');

// Validation schemas
const logActivitySchema = Joi.object({
    userId: Joi.string().uuid().required(),
    resourceId: Joi.string().uuid().allow(null),
    actionType: Joi.string().valid('CREATE', 'UPDATE', 'DELETE', 'VIEW').required(),
    details: Joi.object().allow(null),
    ipAddress: Joi.string().ip().allow(null),
    userAgent: Joi.string().max(2000).allow(null)
});

const activityFiltersSchema = Joi.object({
    userId: Joi.string().uuid(),
    resourceId: Joi.string().uuid(),
    actionType: Joi.string().valid('CREATE', 'UPDATE', 'DELETE', 'VIEW'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10)
});

class ActivityService {

    /**
     * Log a new activity record
     * @param {Object} activityData - Activity data to log
     * @param {string} activityData.userId - ID of the user performing the action
     * @param {string|null} activityData.resourceId - ID of the resource being acted upon (optional)
     * @param {string} activityData.actionType - Type of action (CREATE, UPDATE, DELETE, VIEW)
     * @param {Object|null} activityData.details - Additional details about the action (optional)
     * @param {string|null} activityData.ipAddress - IP address of the client (optional)
     * @param {string|null} activityData.userAgent - User agent of the client (optional)
     * @returns {Promise<Object>} Created activity record
     */
    static async logActivity(activityData) {
        try {
            // Validate input data
            const { error, value } = logActivitySchema.validate(activityData, { abortEarly: false });

            if (error) {
                throw {
                    statusCode: 400,
                    message: error.details.map(d => d.message).join(', '),
                    data: {}
                };
            }

            // Create activity record
            const activity = await ActivityDAL.createActivity(value);
            return activity;

        } catch (error) {
            console.log('ActivityService.logActivity error:', error);
            throw error;
        }
    }

    /**
     * Retrieve activity logs with filtering and pagination
     * @param {Object} filters - Filter criteria
     * @param {string} filters.userId - Filter by user ID (optional)
     * @param {string} filters.resourceId - Filter by resource ID (optional)
     * @param {string} filters.actionType - Filter by action type (optional)
     * @param {Date} filters.startDate - Filter by start date (optional)
     * @param {Date} filters.endDate - Filter by end date (optional)
     * @param {number} filters.page - Page number for pagination (default: 1)
     * @param {number} filters.pageSize - Number of records per page (default: 10)
     * @returns {Promise<Object>} Paginated activity logs with metadata
     */
    static async getActivityLogs(filters = {}) {
        try {
            // Validate filters
            const { error, value } = activityFiltersSchema.validate(filters, { abortEarly: false });

            if (error) {
                throw {
                    statusCode: 400,
                    message: error.details.map(d => d.message).join(', '),
                    data: {}
                };
            }

            const { page, pageSize, userId, resourceId, actionType, startDate, endDate } = value;

            // Build where clause for filtering
            const where = {};

            if (userId) {
                where.userId = userId;
            }

            if (resourceId) {
                where.resourceId = resourceId;
            }

            if (actionType) {
                where.actionType = actionType;
            }

            // Date range filtering
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) {
                    where.createdAt[Op.gte] = startDate;
                }
                if (endDate) {
                    where.createdAt[Op.lte] = endDate;
                }
            }

            // Calculate pagination
            const limit = pageSize;
            const offset = (page - 1) * pageSize;

            // Retrieve activities with associations
            const { rows, count } = await ActivityDAL.getActivities({
                where,
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });

            return {
                data: rows,
                pagination: {
                    total: count,
                    page: page,
                    pageSize: pageSize,
                    totalPages: Math.ceil(count / pageSize)
                }
            };

        } catch (error) {
            console.log('ActivityService.getActivityLogs error:', error);
            throw error;
        }
    }

    /**
     * Get activities for a specific user
     * @param {string} userId - User ID to filter activities
     * @param {Object} pagination - Pagination options
     * @param {number} pagination.page - Page number (default: 1)
     * @param {number} pagination.pageSize - Number of records per page (default: 10)
     * @returns {Promise<Object>} Paginated user activities
     */
    static async getActivityByUser(userId, pagination = {}) {
        try {
            // Validate user ID
            if (!userId) {
                throw {
                    statusCode: 400,
                    message: 'User ID is required',
                    data: {}
                };
            }

            const { page = 1, pageSize = 10 } = pagination;
            const limit = parseInt(pageSize);
            const offset = (parseInt(page) - 1) * limit;

            const { rows, count } = await ActivityDAL.getActivitiesByUser(userId, {
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });

            return {
                data: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pageSize: limit,
                    totalPages: Math.ceil(count / limit)
                }
            };

        } catch (error) {
            console.log('ActivityService.getActivityByUser error:', error);
            throw error;
        }
    }

    /**
     * Get activities for a specific resource
     * @param {string} resourceId - Resource ID to filter activities
     * @param {Object} pagination - Pagination options
     * @param {number} pagination.page - Page number (default: 1)
     * @param {number} pagination.pageSize - Number of records per page (default: 10)
     * @returns {Promise<Object>} Paginated resource activities
     */
    static async getActivityByResource(resourceId, pagination = {}) {
        try {
            // Validate resource ID
            if (!resourceId) {
                throw {
                    statusCode: 400,
                    message: 'Resource ID is required',
                    data: {}
                };
            }

            const { page = 1, pageSize = 10 } = pagination;
            const limit = parseInt(pageSize);
            const offset = (parseInt(page) - 1) * limit;

            const { rows, count } = await ActivityDAL.getActivitiesByResource(resourceId, {
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });

            return {
                data: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pageSize: limit,
                    totalPages: Math.ceil(count / limit)
                }
            };

        } catch (error) {
            console.log('ActivityService.getActivityByResource error:', error);
            throw error;
        }
    }
}

module.exports = ActivityService;