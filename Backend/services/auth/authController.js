const AuthService = require('./authService');
const Utils = require('../../utils/httpResponseUtil');

class AuthController {
    
    static async register (req, res) {
        try {
            const result = await AuthService.register(req);
            Utils.sendResponse(null, result, res, "User created successfully");
        } catch (error) {
            Utils.sendResponse(error, null, res, "");
        }
    }

    static async login (req, res) {
        try {
            const result = await AuthService.login(req);
            Utils.sendResponse(null, result, res, "User logged in successfully");
        } catch (error) {
            Utils.sendResponse(error, null, res, "");
        }
    }

}

module.exports = AuthController;