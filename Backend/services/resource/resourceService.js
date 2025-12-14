const ResourceDAL = require("../../DAL/resourceDAL");
const ActivityService = require("../activity/activityService");
const { Op } = require('sequelize');
const Joi = require('joi');

// Validation Schema
const resourceSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    type: Joi.string().valid('Article', 'Video', 'Tutorial').required(),
    url: Joi.string().uri().required(),
    tags: Joi.string(),
    status: Joi.string().valid('Draft', 'Published', 'Archived').required(),
});

const updateResourceSchema = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    type: Joi.string().valid('Article', 'Video', 'Tutorial'),
    url: Joi.string().uri(),
    tags: Joi.string(),
    status: Joi.string().valid('Draft', 'Published', 'Archived'),
}).min(1); // At least one field required

class ResourceService {

    static async AddResource (req) {
        try {
            const { error, value } = resourceSchema.validate(req.body, { abortEarly: false });

            if (error) {
                throw { 
                    statusCode: 400, 
                    message: error.details.map(d => d.message).join(', '),
                    data: {}
                };
            }
            const resc = { ...value, createdByUserId: req.user.id }
            const resource = await ResourceDAL.createResource(resc);
            
            // Log activity after successful resource creation
            try {
                await ActivityService.logActivity({
                    userId: req.user.id,
                    resourceId: resource.id,
                    actionType: 'CREATE',
                    details: {
                        title: resource.title,
                        type: resource.type,
                        status: resource.status
                    },
                    ipAddress: req.ip || req.connection?.remoteAddress,
                    userAgent: req.get('User-Agent')
                });
            } catch (activityError) {
                // Log the error but don't fail the main operation
                console.error('Failed to log CREATE activity:', activityError);
            }
            
            return resource;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static async getResource (req) {
        try {
            const { id } = req.params;

            const resource = await ResourceDAL.findResourceByWhere({ id });

            if(!resource) {
                throw {
                    statusCode: 404,
                    message: 'Resource not found',
                    data: {}
                };
            }

            return resource;
 
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static async updateResource(req) {
        try {
            const { id } = req.params;

            // Validate request body
            const { error, value } = updateResourceSchema.validate(req.body, { abortEarly: false });

            if (error) {
                throw { 
                    statusCode: 400, 
                    message: error.details.map(d => d.message).join(', '),
                    data: {}
                };
            }

            // Check if resource exists
            const existingResource = await ResourceDAL.findResourceByWhere({ id });

            if (!existingResource) {
                throw {
                    statusCode: 404,
                    message: 'Resource not found',
                    data: {}
                };
            }

            // Update resource
            const updatedResource = await ResourceDAL.updateResource(
                { ...value},
                { id }
            );

            // Log activity after successful resource update
            try {
                // Determine what fields were changed
                const changedFields = {};
                Object.keys(value).forEach(key => {
                    if (existingResource[key] !== value[key]) {
                        changedFields[key] = {
                            from: existingResource[key],
                            to: value[key]
                        };
                    }
                });

                await ActivityService.logActivity({
                    userId: req.user.id,
                    resourceId: id,
                    actionType: 'UPDATE',
                    details: {
                        changedFields,
                        title: updatedResource.title
                    },
                    ipAddress: req.ip || req.connection?.remoteAddress,
                    userAgent: req.get('User-Agent')
                });
            } catch (activityError) {
                // Log the error but don't fail the main operation
                console.error('Failed to log UPDATE activity:', activityError);
            }

            return updatedResource;

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static async deleteResource(req) {
        try {
            const { id } = req.params;

            // Check if resource exists
            const resource = await ResourceDAL.findResourceByWhere({ id });

            if (!resource) {
                throw {
                    statusCode: 404,
                    message: 'Resource not found',
                    data: {}
                };
            }

            // Already archived
            if (resource.status === 'Archived') {
                return {
                    message: 'Resource already archived',
                    data: resource
                };
            }

            // Soft delete (archive)
            const updatedResource = await ResourceDAL.updateResource(
                {
                    status: 'Archived',
                },
                { id }
            );

            // Log activity after successful resource deletion (archiving)
            try {
                await ActivityService.logActivity({
                    userId: req.user.id,
                    resourceId: id,
                    actionType: 'DELETE',
                    details: {
                        title: resource.title,
                        type: resource.type,
                        previousStatus: resource.status,
                        action: 'archived'
                    },
                    ipAddress: req.ip || req.connection?.remoteAddress,
                    userAgent: req.get('User-Agent')
                });
            } catch (activityError) {
                // Log the error but don't fail the main operation
                console.error('Failed to log DELETE activity:', activityError);
            }

            return {
                message: 'Resource archived successfully',
                data: updatedResource
            };

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static async getResourceList(req) {
        try {
            const {
                page = 1,
                pageSize = 10,
                search,
                type,
                status,
                tag
            } = req.query;

            const limit = parseInt(pageSize);
            const offset = (parseInt(page) - 1) * limit;

            const where = {};

            // Search by title or description
            if (search) {
                where[Op.or] = [
                    { title: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } }
                ];
            }

            // Filter by type
            if (type) {
                where.type = type;
            }

            // Filter by status
            if (status) {
                where.status = status;
            }

            // Filter by tag (comma separated string match)
            if (tag) {
                where.tags = {
                    [Op.iLike]: `%${tag}%`
                };
            }

            const { rows, count } = await ResourceDAL.getResources({
                where,
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
            console.log(error);
            throw error;
        }
    }
}

module.exports = ResourceService;