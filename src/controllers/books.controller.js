const bookService = require("../services/books.service")
const { successResponse } = require('../utils/response');



async function getBooksCount(req, res, next) {
    try {
        const booksCount = await bookService.getBookCount();
        successResponse(res, {
            booksCount: booksCount
        });
    } catch (error) {
        next(error);
    }
}

async function getBooksByShelveId(req, res, next) {
    const { shelveId } = req.query;
    try {
        const books = await bookService.getBooksByShelveId(shelveId);
        return successResponse(res, books);
    } catch (error) {
        next(error);
    }
}

async function getBooksByCageId(req, res, next) {
    const { cageId } = req.query;
    console.log(cageId);
    try {
        const books = await bookService.getBooksByCageId(cageId);
        return successResponse(res, books);
    } catch (error) {
        next(error);
    }
}

async function searchBooks(req, res, next) {
    try {
        const { searchQuery, page = 1, limit = 50 } = req.query;

        const books = await bookService.generalSearch(searchQuery, parseInt(page), parseInt(limit));
        return successResponse(res, books);
    } catch (error) {
        next(error);
    }
}

async function getBooksCategories(req, res, next) {
    try {
        const categories = await bookService.getBooksCategories();
        return successResponse(res, categories);
    } catch (error) {
        next(error);
    }
}


async function getByCategory(req, res, next) {
    try {
        const { category, page = 1, limit = 50 } = req.query;

        const books = await bookService.getByCategory(category, parseInt(page), parseInt(limit));
        return successResponse(res, books);
    } catch (error) {
        next(error);
    }
}

async function getMyBorrowedBooks(req, res, next) {
    try {

        const books = await bookService.getMyBorrowedBooks(req.user.user_id);
        return successResponse(res, books);
    } catch (error) {
        next(error);
    }
}


async function returnBook(req, res, next) {
    try {
        const { book_id, borrowing_id } = req.body;
        const user_id = req.user.user_id;

        const result = await bookService.returnBorrowedBook(book_id, user_id, borrowing_id);
        return successResponse(res, result);
    } catch (error) {
        next(error);
    }
}


async function borrowBook(req, res, next) {
    try {
        const { book_id } = req.body;
        const user_id = req.user.user_id;

        const result = await bookService.registerBorrowBook(book_id, user_id);
        return successResponse(res, result);
    } catch (error) {
        next(error);
    }
}


async function insertBook(req, res, next) {
    try {
        const bookData = req.body;
        const user_id = req.user.user_id;

        const result = await bookService.insertBook(bookData, user_id);
        return successResponse(res, result);
    } catch (error) {
        next(error);
    }
}

async function getAllBooks(req, res, next) {
    try {
        const { cageId, bookCategory } = req.query;
        const books = await bookService.getAllBooks(bookCategory, cageId);
        return successResponse(res, books);
    } catch (error) {
        next(error);
    }
}

async function deleteBook(req, res, next) {
    try {
        const { bookId } = req.query;
        const userId = req.user.user_id;

        await bookService.deleteBook(bookId, userId);
        return successResponse(res, { message: "Book deleted successfully" });
    } catch (error) {
        next(error);
    }
}

async function activateBook(req, res, next) {
    try {
        const { bookId } = req.query;
        const userId = req.user.user_id;

        await bookService.activateBook(bookId, userId);
        return successResponse(res, { message: "Book activated successfully" });
    } catch (error) {
        next(error);
    }
}

async function editBook(req, res, next) {
    try {
        const bookData = req.body;
        const user_id = req.user.user_id;

        const result = await bookService.editBook(bookData, user_id);
        return successResponse(res, result);
    } catch (error) {
        next(error);
    }
}

async function getBookByBookId(req, res, next) {
    try {
        const { bookId } = req.params;

        const book = await bookService.getBookByBookId(bookId);
        return successResponse(res, book);
    } catch (error) {
        next(error);
    }
}

async function getAllBorrowedBooks(req, res, next) {
    try {

        const { startDate, endDate } = req.query;

        const books = await bookService.getAllBorrowedBooks(startDate, endDate);
        return successResponse(res, books);
    } catch (error) {
        next(error);
    }
}

async function changeBookCage(req, res, next) {
    try {
        const { bookId, cageId, shelveId, bookSequence } = req.body;
        const userId = req.user.user_id;

        const result = await bookService.changeBookCage({ bookId, cageId, shelveId, bookSequence }, userId);
        return successResponse(res, result);
    } catch (error) {
        next(error);
    }
}

async function sendBookToTempStore(req, res, next) {
    try {
        const { bookId } = req.body;
        const userId = req.user.user_id;

        const result = await bookService.sendBookToTempStore(bookId, userId);
        return successResponse(res, result);
    } catch (error) {
        next(error);
    }
}

async function reorderShelveBookSequence(req, res, next) {
    try {
        const { shelveId } = req.query;
        const userId = req.user.user_id;

        const result = await bookService.reorderShelveBookSequence(shelveId, userId);
        return successResponse(res, result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getBooksCount,
    searchBooks,
    getBooksCategories,
    getAllBorrowedBooks,
    getByCategory,
    getMyBorrowedBooks,
    returnBook,
    borrowBook,
    getBooksByShelveId,
    insertBook,
    getAllBooks,
    getBooksByCageId,
    deleteBook,
    editBook,
    activateBook,
    getBookByBookId,
    changeBookCage,
    sendBookToTempStore,
    reorderShelveBookSequence
}