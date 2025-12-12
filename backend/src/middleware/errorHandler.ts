import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/responses";
import { config } from "../config/env";

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    sendError(
      res,
      err.code,
      err.message,
      err.statusCode,
      err.details,
      (err as any).field
    );
    return;
  }

  // Log unexpected errors
  console.error("Unexpected error:", err);

  // Don't leak error details in production
  const message =
    config.nodeEnv === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  sendError(res, "INTERNAL_SERVER_ERROR", message, 500);
}

