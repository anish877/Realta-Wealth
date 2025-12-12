import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { AuthTokenPayload } from "../types";
import { UnauthorizedError } from "../utils/errors";

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header) {
    throw new UnauthorizedError("Missing authorization header");
  }

  const token = header.replace("Bearer ", "");
  if (!token) {
    throw new UnauthorizedError("Missing token");
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("Insufficient permissions");
    }

    next();
  };
}

