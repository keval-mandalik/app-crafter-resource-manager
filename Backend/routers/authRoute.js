const router = require("express").Router();
const AuthController = require('../services/auth/authController');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

module.exports = router;