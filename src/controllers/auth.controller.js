const authService = require('../services/auth.service');
const { validateLogin } = require('../dto/userDto');
const { successResponse } = require('../utils/response');


async function login(req, res, next) {
    try {

        // Validate request body
        validateLogin(req.body);

        // Call the service to handle login
        const user = await authService.login(req.body);
        successResponse(res, user);

    } catch (error) {
        next(error);
    }
}


async function logout(req, res, next) {
    try {

        const user = await authService.addToBlacklistedToken(req.body.token);
        successResponse(res, user);

    } catch (error) {
        next(error);
    }
}

module.exports = {
    login,
    logout
};