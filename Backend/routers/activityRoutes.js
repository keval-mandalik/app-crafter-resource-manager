const router = require("express").Router();
const ActivityController = require('../services/activity/activityController');
const auth = require('../middleware/auth');
const acl = require('../middleware/acl');

// GET /api/activity/logs - Get activity logs with filtering and pagination
router.get("/logs", auth, acl, ActivityController.getActivityLogs);

// GET /api/activity/user/:userId - Get activities for a specific user
router.get("/user/:userId", auth, acl, ActivityController.getUserActivities);

// GET /api/activity/resource/:resourceId - Get activities for a specific resource
router.get("/resource/:resourceId", auth, acl, ActivityController.getResourceActivities);

module.exports = router;