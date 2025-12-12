"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        throw new errors_1.UnauthorizedError("Missing authorization header");
    }
    const token = header.replace("Bearer ", "");
    if (!token) {
        throw new errors_1.UnauthorizedError("Missing token");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        throw new errors_1.UnauthorizedError("Invalid or expired token");
    }
}
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            throw new errors_1.UnauthorizedError("Authentication required");
        }
        if (!roles.includes(req.user.role)) {
            throw new errors_1.UnauthorizedError("Insufficient permissions");
        }
        next();
    };
}
