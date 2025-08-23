const express = require('express');
const authController = require('../controllers/auth.controller');
const { requireJwtAuthToken } = require("../middlewares/auth.middlewares")
const router = express.Router();

router.post('/login', authController.login);

router.post('/logout', requireJwtAuthToken, authController.logout);

module.exports = router;
