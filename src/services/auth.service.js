const db = require('../config/database');
const bcrypt = require('bcrypt');
const { UserDto } = require('../dto/userDto');
require('dotenv').config();
const { createAccessToken } = require('../utils/jwt');

async function login(loginData) {

    const { username, password } = loginData;

    const query = 'SELECT * FROM users WHERE username = $1 AND is_active = $2';
    const result = await db.query(query, [username, true]);

    if (!result || result.rows.length === 0) {
        const err = new Error('User not found');
        err.name = 'UnauthorizedError';
        err.isJoi = false;
        throw err;
    }

    const user = result.rows[0];

    // Verify password (assuming you have a function to compare hashed passwords)
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        const err = new Error('Invalid password');
        err.name = 'UnauthorizedError';
        err.isJoi = false;
        throw err;
    }

    // Create access token
    const accessToken = createAccessToken(user);

    return {
        user: new UserDto(user),
        accessToken
    };
}


async function addToBlacklistedToken(token) {

    const select_query = `SELECT * FROM logout_tokens WHERE token = $1`
    const selectQueryResult = await db.query(select_query, [token]);

    if (selectQueryResult.rowCount > 0) {
        return true
    }


    const insert_query = `INSERT INTO logout_tokens(token) VALUES ($1) RETURNING *;`
    const result = await db.query(query, [token]);

    if (result.rowCount == 0) {
        const err = new Error('Logout Failed');
        err.name = 'InternalServerError';
        err.isJoi = false;
        throw err;

    }

    return true
}

module.exports = {
    login,
    addToBlacklistedToken
};