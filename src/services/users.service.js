const db = require('../config/database');
const bcrypt = require('bcrypt');
const { UserDto } = require('../dto/userDto');


async function createUser(userData) {
    const { username, password, first_name, last_name } = userData;

    // Check if username already exists
    const checkQuery = 'SELECT user_id FROM users WHERE username = $1 AND is_active = $2';
    const existing = await db.query(checkQuery, [username, true]);

    if (existing && existing.rows.length > 0) {
        const err = new Error('Username is already taken');
        err.name = 'ValidationError';
        err.errors = [{ field: 'username', message: 'Username is already taken' }];
        throw err;
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (username, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await db.query(query, [username, hashedPassword, first_name, last_name]);


    if (result.rows.length === 0) {
        const err = new Error('Failed to create user');
        err.name = 'InternalServerError';
        err.errors = [{ field: 'general', message: 'Failed to create user' }];
        throw err;
    }

    return new UserDto({
        user_id: result.rows[0].user_id,
        username: result.rows[0].username,
        first_name: result.rows[0].first_name,
        last_name: result.rows[0].last_name,
        created_at: result.rows[0].created_at,
        updated_at: result.rows[0].updated_at
    });
}


// Get all users
async function getAllUsers() {
    try {
        const query = 'SELECT * FROM users WHERE is_active = $1 ORDER BY created_at DESC';
        const result = await db.query(query, [true]);
        return result.rows.map(user => new UserDto(user));
    } catch (error) {
        const err = new Error('Failed to retrieve users');
        err.name = 'InternalServerError';
        err.errors = [{ field: 'general', message: error.message }];
        throw err;
    }
}


module.exports = {
    createUser,
    getAllUsers
};
