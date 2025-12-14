const ActivityService = require('../services/activity/activityService');

/**
 * Activity logging middleware to automatically capture resource operations
 * This middleware should be placed after auth middleware to access user context
 * and before the actual route handler to capture the operation details
 */
function activityLogger(actionType) {
    return async function(req, res, next) {
        try {
            // Store original res.json to intercept successful responses
            const originalJson = res.json;
            
            // Override res.json to capture successful operations
            res.json = function(data) {
                // Only log activity for successful operations (status 200-299)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    // Extract resource ID from different sources
                    let resourceId = null;
                    
                    // Try to get resource ID from URL params (for GET, PUT, DELETE operations)
                    if (req.params && req.params.id) {
                        resourceId = req.params.id;
                    }
                    // Try to get resource ID from response data (for CREATE operations)
                    else if (data && data.data && data.data.id) {
                        resourceId = data.data.id;
                    }
                    // Try to get resource ID from response data (alternative structure)
                    else if (data && data.id) {
                        resourceId = data.id;
                    }

                    // Extract request metadata
                    const ipAddress = req.ip || 
                                    req.connection.remoteAddress || 
                                    req.socket.remoteAddress ||
                                    (req.connection.socket ? req.connection.socket.remoteAddress : null);
                    
                    const userAgent = req.get('User-Agent') || null;

                    // Prepare activity data
                    const activityData = {
                        userId: req.user.id,
                        resourceId: resourceId,
                        actionType: actionType,
                        details: {
                            method: req.method,
                            path: req.originalUrl,
                            requestBody: actionType === 'CREATE' || actionType === 'UPDATE' ? req.body : null,
                            timestamp: new Date().toISOString()
                        },
                        ipAddress: ipAddress,
                        userAgent: userAgent
                    };

                    // Log activity asynchronously without blocking the response
                    ActivityService.logActivity(activityData)
                        .catch(error => {
                            // Log the error but don't affect the main operation
                            console.error('Activity logging failed:', error);
                        });
                }

                // Call original res.json with the data
                return originalJson.call(this, data);
            };

            // Continue to next middleware/route handler
            next();

        } catch (error) {
            // Log error but don't block the main operation
            console.error('Activity logging middleware error:', error);
            next();
        }
    };
}

/**
 * Convenience functions for different action types
 */
const activityLoggers = {
    create: () => activityLogger('CREATE'),
    update: () => activityLogger('UPDATE'),
    delete: () => activityLogger('DELETE'),
    view: () => activityLogger('VIEW')
};

module.exports = {
    activityLogger,
    ...activityLoggers
};