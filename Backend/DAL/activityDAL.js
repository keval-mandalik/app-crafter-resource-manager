const { activity, user, resource } = require("../models/index");

class ActivityDAL {

    static async createActivity(data) {
        try {
            const newActivity = await activity.create(data);
            return newActivity;
        } catch (error) {
            throw error;
        }
    }

    static async findActivityByWhere(where) {
        try {
            const existingActivity = await activity.findOne({ where });
            return existingActivity ? existingActivity.get() : null;
        } catch (error) {
            throw error;
        }
    }

    static async getActivities({
        where = {},
        limit = 10,
        offset = 0,
        order = [['createdAt', 'DESC']]
    }) {
        try {
            return await activity.findAndCountAll({
                where,
                limit,
                offset,
                order,
                include: [
                    {
                        model: user,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'role'],
                        required: true
                    },
                    {
                        model: resource,
                        as: 'resource',
                        attributes: ['id', 'title', 'type', 'status'],
                        required: false
                    }
                ]
            });
        } catch (error) {
            throw error;
        }
    }

    static async getActivitiesByUser(userId, { limit = 10, offset = 0, order = [['createdAt', 'DESC']] }) {
        try {
            return await activity.findAndCountAll({
                where: { userId },
                limit,
                offset,
                order,
                include: [
                    {
                        model: user,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'role'],
                        required: true
                    },
                    {
                        model: resource,
                        as: 'resource',
                        attributes: ['id', 'title', 'type', 'status'],
                        required: false
                    }
                ]
            });
        } catch (error) {
            throw error;
        }
    }

    static async getActivitiesByResource(resourceId, { limit = 10, offset = 0, order = [['createdAt', 'DESC']] }) {
        try {
            return await activity.findAndCountAll({
                where: { resourceId },
                limit,
                offset,
                order,
                include: [
                    {
                        model: user,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'role'],
                        required: true
                    },
                    {
                        model: resource,
                        as: 'resource',
                        attributes: ['id', 'title', 'type', 'status'],
                        required: false
                    }
                ]
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ActivityDAL;