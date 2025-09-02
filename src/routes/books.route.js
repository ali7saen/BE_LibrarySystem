const express = require('express');

const booksController = require('../controllers/books.controller');
const { checkIfTokenIsLoggedOut, requireJwtAuthToken } = require("../middlewares/auth.middlewares");
const router = express.Router();

router.use(requireJwtAuthToken);
router.use(checkIfTokenIsLoggedOut);


router.post('/', booksController.insertBook);
router.get('/', booksController.getAllBooks);
router.delete('/', booksController.deleteBook);
router.put('/', booksController.editBook);
router.get('/all-borrowed', booksController.getAllBorrowedBooks);
router.get('/get-count', booksController.getBooksCount);
router.get('/search', booksController.searchBooks)
router.get('/categories', booksController.getBooksCategories)
router.get('/by-category', booksController.getByCategory)
router.get('/my-borrowed-books', booksController.getMyBorrowedBooks)
router.get('/by-shelve', booksController.getBooksByShelveId)
router.get('/by-cage', booksController.getBooksByCageId)
router.get('/activate', booksController.activateBook);


router.post('/borrow', booksController.borrowBook);
router.post('/return', booksController.returnBook);
router.post('/change-cage', booksController.changeBookCage);
router.post('/send-to-temp', booksController.sendBookToTempStore);
router.get('/reorder-shelve', booksController.reorderShelveBookSequence);

router.get('/:bookId', booksController.getBookByBookId);
module.exports = router;
