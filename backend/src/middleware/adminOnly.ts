import express from "express";
import { AuthTokenPayload } from "../types";

export function adminOnly(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const user = (req as express.Request & { user?: AuthTokenPayload }).user;
  
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  if (user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  
  next();
}


