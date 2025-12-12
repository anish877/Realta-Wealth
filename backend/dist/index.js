"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./middleware/logger");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const PORT = env_1.config.port;
// CORS Configuration
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // Handle "*" to allow all origins
        if (env_1.config.corsOrigin === "*") {
            return callback(null, true);
        }
        // Parse CORS_ORIGIN - can be comma-separated list
        const allowedOrigins = env_1.config.corsOrigin
            .split(",")
            .map(o => o.trim())
            .filter(o => o.length > 0);
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
        }
    },
    credentials: true, // Allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
    ],
    exposedHeaders: ["Authorization"],
    maxAge: 86400, // 24 hours
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(logger_1.requestLogger);
// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));
// API routes
app.use("/api", routes_1.default);
// Error handling (must be last)
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});
