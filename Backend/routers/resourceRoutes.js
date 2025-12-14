const router = require("express").Router();
const ResourceController = require('../services/resource/resourceController');
const auth = require('../middleware/auth');
const acl = require('../middleware/acl');
const { create, update, delete: deleteLogger, view } = require('../middleware/activityLogger');

router.post("/add", auth, acl, create(), ResourceController.AddResource);
router.get("/list", auth, acl, view(), ResourceController.getResourceList);
router.get("/:id", auth, acl, view(), ResourceController.getResource);
router.put("/:id", auth, acl, update(), ResourceController.updateResource);
router.delete("/:id", auth, acl, deleteLogger(), ResourceController.deleteResource);


module.exports = router;