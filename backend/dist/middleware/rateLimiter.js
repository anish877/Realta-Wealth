"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
const store = {};
// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 60000); // Clean every minute
function rateLimit(options) {
    const { windowMs, max, keyGenerator } = options;
    return (req, res, next) => {
        const key = keyGenerator ? keyGenerator(req) : req.ip || "unknown";
        const now = Date.now();
        const record = store[key];
        if (!record || record.resetTime < now) {
            // Create new record
            store[key] = {
                count: 1,
                resetTime: now + windowMs,
            };
            return next();
        }
        if (record.count >= max) {
            return res.status(429).json({
                error: "Too many requests, please try again later",
                retryAfter: Math.ceil((record.resetTime - now) / 1000),
            });
        }
        // Increment count
        record.count++;
        next();
    };
}
