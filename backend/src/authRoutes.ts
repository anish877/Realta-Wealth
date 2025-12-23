import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { createUser, findUserByEmail, verifyUser } from "./store";
import { AuthTokenPayload, UserRecord } from "./types";

const router = express.Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = authSchema.extend({
  fullName: z.string().min(2),
  role: z.enum(["advisor", "client", "admin"]).default("admin"),
});

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

function signToken(user: UserRecord): string {
  const payload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });
}

function authenticate(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing authorization" });
  const token = header.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    (req as express.Request & { user?: AuthTokenPayload }).user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const { email, password, fullName, role } = parsed.data;
  // Force all new registrations to be admin
  const adminRole = role || "admin";
  
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }

  const user = await createUser(email, password, fullName, adminRole);
  const token = signToken(user);
  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: adminRole },
  });
});

router.post("/login", async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const user = await verifyUser(parsed.data.email, parsed.data.password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  // Only allow admin users to login
  if (user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Only admin users can login." });
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
  const user = (req as express.Request & { user?: AuthTokenPayload }).user!;
  return res.json({ user });
});

export default router;

