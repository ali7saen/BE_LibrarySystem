require('dotenv').config();
const { verifyToken } = require('../utils/jwt');
const db = require('../config/database');

function requireJwtAuthToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        req.token = token;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: err.message || 'Invalid token' });
    }
}


async function checkIfTokenIsLoggedOut(req, res, next) {
    const token = req.token

    // Check if the token is in the logout tokens table
    const query = 'SELECT * FROM logout_tokens WHERE token = $1';
    const result = await db.query(query, [token]);

    try {
        if (result.rows.length > 0) {
            return res.status(401).json({ success: false, message: 'Token has been logged out' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

}

module.exports = {
    requireJwtAuthToken,
    checkIfTokenIsLoggedOut
};