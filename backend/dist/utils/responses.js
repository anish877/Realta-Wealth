"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
exports.calculatePagination = calculatePagination;
function sendSuccess(res, data, statusCode = 200, pagination) {
    const response = {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            ...(pagination && { pagination }),
        },
    };
    res.status(statusCode).json(response);
}
function sendError(res, code, message, statusCode = 400, details, field) {
    const response = {
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
            ...(field && { field }),
        },
    };
    res.status(statusCode).json(response);
}
function calculatePagination(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}
