const libraryService = require("../services/library.service")
const { successResponse } = require('../utils/response');

async function getCages(req, res, next) {
    try {
        const cages = await libraryService.getCages();
        return successResponse(res, cages);
    } catch (error) {
        next(error);
    }
}

async function getShelvesByCageId(req, res, next) {
    const { cageId } = req.query;
    try {
        const shelves = await libraryService.getShelvesByCageId(cageId);
        return successResponse(res, shelves);
    } catch (error) {
        next(error);
    }
}


module.exports = {
    getCages,
    getShelvesByCageId
}