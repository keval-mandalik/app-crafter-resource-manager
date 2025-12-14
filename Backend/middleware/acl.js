const Utils = require('../utils/httpResponseUtil');
const HTTPStatus = require('../utils/http-status');

module.exports = function (req, res, next) {
    const accessList = {
        'CONTENT_MANAGER' : [
            {
                method: 'POST',
                path: '/api/resource/add'
            },
            {
                method: 'GET',
                path: '/api/resource/'
            },
            {
                method: 'PUT',
                path: '/api/resource/'
            },
            {
                method: 'DELETE',
                path: '/api/resource/'
            },
            {
                method: 'GET',
                path: '/api/resource/list'
            },
            {
                method: 'GET',
                path: '/api/activity/list'
            },
            {
                method: 'GET',
                path: '/api/activity/resource/'
            }
        ],
        'VIEWER' : [
            {
                method: 'GET',
                path: '/api/resource/'
            },
            {
                method: 'GET',
                path: '/api/resource/list'
            }
        ]
    };

    const role = req.user.role;
    let isAllowed = accessList[role]?.some(
            permission => permission.method === req.method && (permission.path === req.originalUrl.split('?')[0] || req.originalUrl.includes(permission.path))
        );
    
    if (isAllowed) {
        next();
    } else {
         const responseObject = Utils.errorResponse();
        responseObject.message = 'ACCESS_DENIED';
        res.status(HTTPStatus.NOT_ACCEPTABLE).send(responseObject);
        return;
    }
}