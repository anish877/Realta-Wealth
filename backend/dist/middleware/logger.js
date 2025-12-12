"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
function requestLogger(req, res, next) {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    res.on("finish", () => {
        const duration = Date.now() - start;
        const log = {
            timestamp,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        };
        if (res.statusCode >= 400) {
            console.error("Request error:", log);
        }
        else {
            console.log("Request:", log);
        }
    });
    next();
}
