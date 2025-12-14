const HTTPStatus = require('./http-status');

class Utils {
    static errorResponse() {
        return JSON.parse(
            JSON.stringify({
                status: 0,
                data: {},
                message: 'Error'
            })
        );
    }

    static successResponse() {
        return JSON.parse(
            JSON.stringify({
                status: 1,
                data: {},
                message: 'Success'
            })
        );
    }

    static sendResponse(error, data, res, successMessage, successMessageVars) {
        let responseObject;

        if (error) {
            let status;
            responseObject = Utils.errorResponse();
            if (typeof error === 'object') {
                responseObject.message = error.message
                    ? error.message : 'ERROR_MSG';
                status = error.statusCode ? error.statusCode : HTTPStatus.BAD_REQUEST;
            } else {
                responseObject.message = error.message;
                status = HTTPStatus.BAD_REQUEST;
            }
            console.log("Response Body,Error Detail:", error.data);
            responseObject.data = error.data;
            res.status(status).send(responseObject);
        } else {
            responseObject = Utils.successResponse();
            responseObject.message = successMessageVars
                ? res.__.apply('', [successMessage].concat(successMessageVars))
                : successMessage;
            responseObject.data = data;
            console.log("Response Body:", responseObject);
            res.status(HTTPStatus.OK).send(responseObject);
        }
    }
}

module.exports = Utils;