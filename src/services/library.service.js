const db = require("../config/database")



async function getCages() {
    const query = `SELECT * FROM cages WHERE is_active = $1`
    const queryParams = [true]

    const result = await db.query(query, queryParams);

    return result.rows
}

async function getShelvesByCageId(cageId) {
    const query = `
        SELECT 
            s.shelve_id,
            s.shelve_number,
            s.created_by,
            s.created_at,
            s.is_active,
            s.cage_id,
            COALESCE(COUNT(b.book_id), 0) as books_count
        FROM shelves s
        LEFT JOIN books b ON s.shelve_id = b.shelve_id AND b.is_active = true
        WHERE s.cage_id = $1 AND s.is_active = $2
        GROUP BY s.shelve_id, s.shelve_number, s.created_by, s.created_at, s.is_active, s.cage_id
        ORDER BY s.shelve_number ASC
    `
    const queryParams = [cageId, true]

    const result = await db.query(query, queryParams);

    return result.rows
}

module.exports = {
    getCages,
    getShelvesByCageId
}