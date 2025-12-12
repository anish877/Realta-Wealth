"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || "4000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    databaseUrl: process.env.DATABASE_URL || "",
    jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
    // CORS_ORIGIN can be:
    // - "*" to allow all origins (development only, not recommended for production)
    // - Single origin: "http://localhost:5173"
    // - Multiple origins (comma-separated): "http://localhost:5173,https://example.com"
    // Defaults to "*" in development, empty string in production (must be set via env var)
    corsOrigin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === "production" ? "*" : "*"),
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || "https://n8n.srv891599.hstgr.cloud/webhook/8077a68e-05f4-40ca-bb66-e20b73808cdb",
};
if (!exports.config.databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
}
