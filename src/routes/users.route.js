const express = require('express');
const usersController = require('../controllers/users.controller');
const { checkIfTokenIsLoggedOut, requireJwtAuthToken } = require("../middlewares/auth.middlewares");
const router = express.Router();

router.use(requireJwtAuthToken);
router.use(checkIfTokenIsLoggedOut);

router.post('/', usersController.createUser);
router.get('/', usersController.getAllUsers);
module.exports = router;
