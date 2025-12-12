"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const store_1 = require("./store");
const router = express_1.default.Router();
const authSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
const registerSchema = authSchema.extend({
    fullName: zod_1.z.string().min(2),
    role: zod_1.z.enum(["advisor", "client", "admin"]).default("client"),
});
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_TTL_SECONDS = 60 * 60; // 1 hour
function signToken(user) {
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });
}
function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header)
        return res.status(401).json({ error: "Missing authorization" });
    const token = header.replace("Bearer ", "");
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    }
    catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
router.post("/register", async (req, res) => {
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
});
router.post("/login", async (req, res) => {
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
});
router.get("/me", authenticate, (req, res) => {
    const user = req.user;
    return res.json({ user });
});
exports.default = router;
