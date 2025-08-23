const db = require("../config/database")
const { BookDto, BorrowedBookDto, validateCreateBook } = require("../dto/bookDto")



async function getBookCount() {
    const query = `SELECT * FROM books WHERE is_active = $1`
    const queryParams = [true]

    const result = await db.query(query, queryParams);

    return result.rowCount
}

async function getBooksByShelveId(shelveId) {
    const query = `SELECT * FROM books WHERE shelve_id = $1`
    const queryParams = [shelveId, true]

    const result = await db.query(query, queryParams);

    return result.rows
}

async function generalSearch(searchItem, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    // Normalize searchItem to handle null/undefined/empty cases
    const searchTerm = searchItem && searchItem.trim() ? searchItem.trim() : null;

    const searchQuery = `
        SELECT 
            B.book_id,
            B.book_title,
            B.book_author,
            B.book_sequence,
            B.book_category,
            B.created_by,
            B.updated_by,
            B.created_at,
            B.updated_at,
            B.is_active,
            B.is_available,
            B.cage_id,
            B.shelve_id,
            C.cage_code,
            C.cage_categories,
            C.cage_name,
            SH.shelve_number,
            BB.is_active borrowed_is_active,
            COALESCE(U.first_name || ' ' || U.last_name, '') as borrowed_by
        FROM books B
            LEFT JOIN shelves SH 
                ON B.shelve_id = SH.shelve_id
            LEFT JOIN cages C
                ON B.cage_id = C.cage_id
            LEFT JOIN book_borrowings BB
                ON B.book_id = BB.book_id AND BB.is_active = $5
            LEFT JOIN users  U
                ON BB.user_id = U.user_id 
        WHERE B.is_active = $1
            AND (
                $2::text IS NULL 
                OR $2::text = '' 
                OR B.book_title ILIKE '%' || $2::text || '%'
                OR B.book_author ILIKE '%' || $2::text || '%'
                OR C.cage_code ILIKE '%' || $2::text || '%'
                OR C.cage_name ILIKE '%' || $2::text || '%'
                OR C.cage_categories ILIKE '%' || $2::text || '%'
            )
        ORDER BY B.book_title ASC
        LIMIT $3 OFFSET $4;
    `;
    const params = [true, searchTerm, limit, offset, true];
    const result = await db.query(searchQuery, params);

    console.log(result.rows.map(row => new BookDto(row)));
    return result.rows.map(row => new BookDto(row));
}

async function getByCategory(book_category, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    const searchTerm = book_category && book_category.trim() ? book_category.trim() : null;

    const searchQuery = `
        SELECT 
        B.book_id,
        B.book_title,
        B.book_author,
        B.book_sequence,
        B.book_category,
        B.created_by,
        B.updated_by,
        B.created_at,
        B.updated_at,
        B.is_active,
        B.is_available,
        B.cage_id,
        B.shelve_id,
        C.cage_code,
        C.cage_categories,
        C.cage_name,
        SH.shelve_number,
        BB.is_active borrowed_is_active,
        COALESCE(U.first_name || ' ' || U.last_name, '') as borrowed_by
        FROM books B
        LEFT JOIN shelves SH 
            ON B.shelve_id = SH.shelve_id
        LEFT JOIN cages C
            ON B.cage_id = C.cage_id
        LEFT JOIN book_borrowings BB
            ON B.book_id = BB.book_id AND BB.is_active = $5
        LEFT JOIN users  U
            ON BB.user_id = U.user_id 
        WHERE B.is_active = $1
        AND  B.book_category ILIKE '%' || $2::text || '%'
        
        ORDER BY B.book_title ASC
        LIMIT $3 OFFSET $4;
    `;
    const params = [true, searchTerm, limit, offset, true];
    const result = await db.query(searchQuery, params);

    console.log(result.rows.map(row => new BookDto(row)));
    return result.rows.map(row => new BookDto(row));
}


async function getBooksCategories() {
    const query = `SELECT DISTINCT book_category FROM books ORDER BY book_category;`
    const result = await db.query(query);

    return result.rows
}


async function getMyBorrowedBooks(user_id) {
    const searchQuery = `
        WITH LatestBorrowings AS (
            SELECT 
                borrowing_id,
                book_id,
                user_id,
                created_at,
                updated_at,
                status,
                ROW_NUMBER() OVER (PARTITION BY book_id ORDER BY created_at DESC) as rn
            FROM book_borrowings
            WHERE is_active = true AND user_id = $1
        )
        SELECT 
            B.book_id,
            B.book_title,
            B.book_author,
            B.book_sequence,
            B.book_category,
            B.created_by,
            B.updated_by,
            LB.created_at as borrowed_at,
            LB.updated_at as returned_at,
            B.is_active,
            B.is_available,
            B.cage_id,
            B.shelve_id,
            SH.shelve_number,
            C.cage_code,
            C.cage_categories,
            C.cage_name,
            LB.status as borrowed_status,
            COALESCE(U.first_name || ' ' || U.last_name, '') as borrowed_by
        FROM books B
        LEFT JOIN shelves SH ON B.shelve_id = SH.shelve_id
        LEFT JOIN cages C ON B.cage_id = C.cage_id
        INNER JOIN LatestBorrowings LB ON B.book_id = LB.book_id AND LB.rn = 1
        LEFT JOIN users U ON LB.user_id = U.user_id
        ORDER BY LB.created_at DESC; 
    `;
    const result = await db.query(searchQuery, [user_id]);

    return result.rows.map(row => new BorrowedBookDto(row));
}

async function registerBorrowBook(book_id, user_id) {

    const isBookAvailable = await db.query(
        "SELECT is_available FROM books WHERE book_id = $1 AND is_active = $2",
        [book_id, true]
    );

    if (!isBookAvailable.rows[0].is_available) {
        const err = new Error('Book is not available for borrowing');
        err.name = 'BookNotAvailableError';
        err.isJoi = false;
        throw err;
    }

    await db.query(
        "UPDATE books SET is_available = $1 WHERE book_id = $2",
        [false, book_id]
    );

    const result = await db.query(
        "INSERT INTO book_borrowings (book_id, user_id) VALUES ($1, $2) RETURNING *;",
        [book_id, user_id]
    );

    return result.rows[0];
}


async function returnBorrowedBook(book_id, user_id) {

    await db.query(
        "UPDATE books SET is_available = $1, updated_by = $2 WHERE book_id = $3",
        [true, user_id, book_id]
    );


    const borrowing_id = await db.query(
        "SELECT borrowing_id FROM book_borrowings WHERE book_id = $1 AND user_id = $2 AND status = $3",
        [book_id, user_id, 'borrowed']
    );

    await db.query(
        "UPDATE book_borrowings SET status = $1, updated_by = $2 WHERE borrowing_id = $3",
        ['returned', user_id, borrowing_id.rows[0].borrowing_id]
    );

    return true;
}

async function insertBook(book, user_id) {
    validateCreateBook(book);

    const query = `
        INSERT INTO books (book_title, book_author, book_sequence, book_category, created_by, cage_id, shelve_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const params = [
        book.book_title,
        book.book_author,
        book.book_sequence,
        book.book_category,
        user_id,
        book.cage_id,
        book.shelve_id
    ];

    const result = await db.query(query, params);
    console.log(result.rows[0]);
    return new BookDto(result.rows[0]);
}

async function getAllBooks(book_category, cage_id) {
    let query = `
        SELECT 
            book_id,
            book_title,
            book_author,
            book_category,
            is_active,
            cage_id
        FROM books 
    `;
    const params = [];
    if (book_category && cage_id) {
        query += ` WHERE book_category = $1 AND cage_id = $2`;
        params.push(book_category, cage_id);
    }
    if (cage_id) {
        query += ` WHERE cage_id = $1`;
        params.push(cage_id);
    } else if (book_category) {
        query += ` WHERE book_category = $1`;
        params.push(book_category);
    }

    const result = await db.query(query, params);

    return result.rows.map(row => new BookDto(row));
}


async function getBooksByCageId(cageId) {
    const query = `SELECT * FROM books WHERE cage_id = $1 AND is_active = $2`
    const queryParams = [cageId, true]

    const result = await db.query(query, queryParams);

    return result.rows.map(row => new BookDto(row));
}

async function deleteBook(book_id, userId) {
    const query = `
        UPDATE books SET is_active = $1, updated_by = $2 WHERE book_id = $3
    `;
    await db.query(query, [false, userId, book_id]);
}

module.exports = {
    getBookCount,
    generalSearch,
    getBooksCategories,
    getByCategory,
    getMyBorrowedBooks,
    registerBorrowBook,
    returnBorrowedBook,
    getBooksByShelveId,
    insertBook,
    getAllBooks,
    getBooksByCageId,
    deleteBook
};