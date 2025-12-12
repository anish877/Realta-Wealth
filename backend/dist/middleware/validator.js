"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
const errors_1 = require("../utils/errors");
function validate(schema) {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                const error = result.error;
                const firstError = error.errors[0];
                throw new errors_1.ValidationError(firstError?.message || "Validation failed", error.errors, firstError?.path.join("."));
            }
            req.body = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.query);
            if (!result.success) {
                const error = result.error;
                const firstError = error.errors[0];
                throw new errors_1.ValidationError(firstError?.message || "Query validation failed", error.errors, firstError?.path.join("."));
            }
            req.query = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
function validateParams(schema) {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.params);
            if (!result.success) {
                const error = result.error;
                const firstError = error.errors[0];
                throw new errors_1.ValidationError(firstError?.message || "Parameter validation failed", error.errors, firstError?.path.join("."));
            }
            req.params = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
