const Utils = require("../../utils/httpResponseUtil");
const ResourceService = require("../../services/resource/resourceService");

class ResourceController {

    static async AddResource (req, res) {
        try {
            const result = await ResourceService.AddResource(req);
            Utils.sendResponse(null, result, res, "Resource created successfully");
        }
        catch (error) {
            Utils.sendResponse(error, null, res, "");
        }
    }

    static async getResource (req, res) {
        try {
            const result = await ResourceService.getResource(req);
            Utils.sendResponse(null, result, res, "Resource fetched successfully");
        } 
        catch (error) {
            Utils.sendResponse(error, null, res, "");
        }
    }

    static async updateResource (req, res) {
        try {
            const result = await ResourceService.updateResource(req);
            Utils.sendResponse(null, result, res, "Resource updated successfully");
        } catch (error) {
            Utils.sendResponse(error, null, res, "");
        }
    }

    static async deleteResource (req, res) {
        try {
            const result = await ResourceService.deleteResource(req);
            Utils.sendResponse(null, result, res, "Resource deleted successfully");
        } catch (error) {
            Utils.sendResponse(error, null, res, "");
        }
    }

    static async getResourceList (req, res) {
        try {
            const result = await ResourceService.getResourceList(req);
            Utils.sendResponse(null, result, res, "Resource list")
        } catch (error) {
            Utils.sendResponse(error, null, res, "");
        }
    }

}

module.exports = ResourceController;