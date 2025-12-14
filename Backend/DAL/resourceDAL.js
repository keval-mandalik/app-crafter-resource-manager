const { user,resource } = require("../models/index");

class ResourceDAL {

    static async createResource (data) {
        try {
            const newResource = await resource.create(data);
            return newResource;
        } catch (error) {
            throw error;
        }
    }

    static async findResourceByWhere (where) {
        try {
            const existingResource = await resource.findOne({ where });
            return existingResource ? existingResource.get() : null;
        } catch (error) {
            throw error;
        }
    }

    static async updateResource (data, where) {
        try {
            const updatedResource = await resource.update(data, { where });
            return updatedResource;
        } catch (error) {
            throw error;
        }
    }

     static async getResources({
        where = {},
        limit = 10,
        offset = 0,
        order = [['createdAt', 'DESC']]
    }) {
        return resource.findAndCountAll({
            where,
            limit,
            offset,
            order,
            include: [
                {
                    model: user,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ]
        });
    }

}

module.exports = ResourceDAL;