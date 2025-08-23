function successResponse(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
}

function errorResponse(res, error, statusCode = 400) {
    return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error',
        errors: error.errors || null
    });
}

module.exports = {
    successResponse,
    errorResponse
};
