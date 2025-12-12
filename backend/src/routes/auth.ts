import express from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { createUser, findUserByEmail, verifyUser } from "../store";
import { AuthTokenPayload, UserRecord } from "../types";
import { authenticate } from "../middleware/auth";
import { config } from "../config/env";
import { rateLimit } from "../middleware/rateLimiter";

const router = express.Router();

// Rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  keyGenerator: (req) => {
    // Use IP + email for login/register to prevent brute force
    const ip = req.ip || "unknown";
    const email = req.body?.email || "";
    return `${ip}:${email}`;
  },
});

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = authSchema.extend({
  fullName: z.string().min(2),
  role: z.enum(["advisor", "client", "admin"]).default("client"),
});

function signToken(user: UserRecord): string {
  const payload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  const expiresIn = (config.jwtExpiresIn || "1h") as string;
  return jwt.sign(payload, config.jwtSecret, { expiresIn } as SignOptions);
}

router.post("/register", authRateLimit, async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { email, password, fullName, role } = parsed.data;
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const user = await createUser(email, password, fullName, role);
    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName, role },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", authRateLimit, async (req, res, next) => {
  try {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const user = await verifyUser(parsed.data.email, parsed.data.password);
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
  } catch (error) {
    next(error);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const userPayload = (req as express.Request & { user?: AuthTokenPayload }).user!;
    // Fetch full user data from database
    const user = await findUserByEmail(userPayload.email);
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
  } catch (error) {
    next(error);
  }
});

// Refresh token endpoint - validates current token and returns new one if valid
router.post("/refresh", authenticate, async (req, res, next) => {
  try {
    const userPayload = (req as express.Request & { user?: AuthTokenPayload }).user!;
    // Fetch full user data from database
    const user = await findUserByEmail(userPayload.email);
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
  } catch (error) {
    next(error);
  }
});

export default router;

