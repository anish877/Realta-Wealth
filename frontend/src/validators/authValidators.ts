import { z } from "zod";
import { emailSchema, passwordSchema, nameSchema } from "../utils/validation";

/**
 * Login validation schema
 * Matches backend validation from backend/src/routes/auth.ts
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Register validation schema
 * Matches backend validation from backend/src/routes/auth.ts
 * All signups are client-only for now
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: nameSchema,
  role: z.enum(["advisor", "client", "admin"]).default("client"),
});

/**
 * Type exports for TypeScript
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

