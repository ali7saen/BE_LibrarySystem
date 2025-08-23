const express = require('express');

const booksController = require('../controllers/books.controller');
const { checkIfTokenIsLoggedOut, requireJwtAuthToken } = require("../middlewares/auth.middlewares");
const router = express.Router();

router.use(requireJwtAuthToken);
router.use(checkIfTokenIsLoggedOut);


router.post('/', booksController.insertBook);
router.get('/', booksController.getAllBooks);
router.delete('/', booksController.deleteBook);

router.get('/get-count', booksController.getBooksCount);
router.get('/search', booksController.searchBooks)
router.get('/categories', booksController.getBooksCategories)
router.get('/by-category', booksController.getByCategory)
router.get('/my-borrowed-books', booksController.getMyBorrowedBooks)
router.get('/by-shelve', booksController.getBooksByShelveId)
router.get('/by-cage', booksController.getBooksByCageId)


router.post('/borrow', booksController.borrowBook);
router.post('/return', booksController.returnBook);

module.exports = router;
