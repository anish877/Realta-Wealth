"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const store_1 = require("../store");
const auth_1 = require("../middleware/auth");
const env_1 = require("../config/env");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = express_1.default.Router();
// Rate limiting for auth endpoints
const authRateLimit = (0, rateLimiter_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    keyGenerator: (req) => {
        // Use IP + email for login/register to prevent brute force
        const ip = req.ip || "unknown";
        const email = req.body?.email || "";
        return `${ip}:${email}`;
    },
});
const authSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
const registerSchema = authSchema.extend({
    fullName: zod_1.z.string().min(2),
    role: zod_1.z.enum(["advisor", "client", "admin"]).default("client"),
});
function signToken(user) {
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
    };
    const expiresIn = (env_1.config.jwtExpiresIn || "1h");
    return jsonwebtoken_1.default.sign(payload, env_1.config.jwtSecret, { expiresIn });
}
router.post("/register", authRateLimit, async (req, res, next) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues });
        }
        const { email, password, fullName, role } = parsed.data;
        const existingUser = await (0, store_1.findUserByEmail)(email);
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }
        const user = await (0, store_1.createUser)(email, password, fullName, role);
        const token = signToken(user);
        return res.status(201).json({
            token,
            user: { id: user.id, email: user.email, fullName: user.fullName, role },
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/login", authRateLimit, async (req, res, next) => {
    try {
        const parsed = authSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues });
        }
        const user = await (0, store_1.verifyUser)(parsed.data.email, parsed.data.password);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = signToken(user);
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/me", auth_1.authenticate, async (req, res, next) => {
    try {
        const userPayload = req.user;
        // Fetch full user data from database
        const user = await (0, store_1.findUserByEmail)(userPayload.email);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json({
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// Refresh token endpoint - validates current token and returns new one if valid
router.post("/refresh", auth_1.authenticate, async (req, res, next) => {
    try {
        const userPayload = req.user;
        // Fetch full user data from database
        const user = await (0, store_1.findUserByEmail)(userPayload.email);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Issue new token
        const token = signToken(user);
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
