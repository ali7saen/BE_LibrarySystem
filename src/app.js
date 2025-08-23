require('dotenv').config();
const { errorResponse } = require('./utils/response');
const express = require('express');
const cors = require('cors');
const app = express();



app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
}));
app.use(express.json());

const index = require('./routes/index.route');
app.use('/api', index);






app.use((err, req, res, next) => {
    const errorStatusMap = {
        ValidationError: 400,
        UnauthorizedError: 401,
        AuthenticationError: 401,
        TokenError: 401,
        NotFoundError: 404,
        UserNotFoundError: 404,
        InternalServerError: 500
    };
    const statusCode = errorStatusMap[err.name] || 400;
    return errorResponse(res, err, statusCode);
});

module.exports = app;
