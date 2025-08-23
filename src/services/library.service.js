const db = require("../config/database")



async function getCages () {
    const query = `SELECT * FROM cages WHERE is_active = $1`
    const queryParams = [true]

    const result = await db.query(query, queryParams);

    return result.rows
}

async function getShelvesByCageId (cageId) {
    const query = `SELECT * FROM shelves WHERE cage_id = $1 AND is_active = $2`
    const queryParams = [cageId, true]

    const result = await db.query(query, queryParams);

    return result.rows
}

module.exports = {
    getCages,
    getShelvesByCageId
}