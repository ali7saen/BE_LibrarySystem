const express = require('express');
const router = express.Router();




const userRoutes = require('./users.route');
router.use('/users', userRoutes);

const authRoutes = require('./auth.route');
router.use('/auth', authRoutes);


const booksRoutes = require('./books.route');
router.use('/books', booksRoutes);

const libraryRoutes = require('./library.route');
router.use('/library', libraryRoutes);

module.exports = router;
