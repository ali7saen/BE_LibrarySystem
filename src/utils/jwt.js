require('dotenv').config() 

const jwt = require('jsonwebtoken');

// Create access token
function createAccessToken(user, expiresIn = '3d') {
    console.log(process.env);
    const payload = {
        user_id: user.user_id,
        username: user.username,
        full_name: `${user.first_name} ${user.last_name}`,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

// Verify token
function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        const err = new Error('Invalid or expired token');
        err.name = 'UnauthorizedError';
        err.isJoi = false;
        throw err;
    }
}

module.exports = {
    createAccessToken,  
    verifyToken
};