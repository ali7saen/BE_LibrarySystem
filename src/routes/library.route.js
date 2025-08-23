const express = require('express');

const libraryController = require('../controllers/library.controller');

const { checkIfTokenIsLoggedOut, requireJwtAuthToken } = require("../middlewares/auth.middlewares");
const router = express.Router();

router.use(requireJwtAuthToken);
router.use(checkIfTokenIsLoggedOut);


router.get('/cages', libraryController.getCages)

router.get('/shelves', libraryController.getShelvesByCageId)

module.exports = router;