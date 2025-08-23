const usersService = require('../services/users.service');
const { validateCreateUser } = require('../dto/userDto');
const { successResponse } = require('../utils/response');


async function createUser(req, res, next) {
    try {

        // Validate request body
        validateCreateUser(req.body);

        const user = await usersService.createUser(req.body);
        successResponse(res, user);
    } catch (error) {
        next(error);
    }
}

async function getAllUsers(req, res, next) {
    try {
        const users = await usersService.getAllUsers();
        successResponse(res, users);
    }
    catch (error) {
        next(error);
    }
}

module.exports = {
    createUser,
    getAllUsers
};