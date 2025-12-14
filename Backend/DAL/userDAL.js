const { user } = require("../models/index");

class UserDAL {

    static async createUser (data) {
        try {
            const newUser = await user.create(data);
            return newUser;
        } catch (error) {
            throw error;
        }
    }

    static async findUserByWhere (where) {
        try {
            const existingUser = await user.findOne({ where });
            return existingUser;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = UserDAL;