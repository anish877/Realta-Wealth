"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../utils/errors");
const responses_1 = require("../utils/responses");
const env_1 = require("../config/env");
function errorHandler(err, req, res, next) {
    if (err instanceof errors_1.AppError) {
        (0, responses_1.sendError)(res, err.code, err.message, err.statusCode, err.details, err.field);
        return;
    }
    // Log unexpected errors
    console.error("Unexpected error:", err);
    // Don't leak error details in production
    const message = env_1.config.nodeEnv === "production"
        ? "Internal server error"
        : err.message || "Internal server error";
    (0, responses_1.sendError)(res, "INTERNAL_SERVER_ERROR", message, 500);
}
