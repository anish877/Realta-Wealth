import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../utils/errors";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const error = result.error as ZodError;
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError?.message || "Validation failed",
          error.errors,
          firstError?.path.join(".")
        );
      }
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.query);
      if (!result.success) {
        const error = result.error as ZodError;
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError?.message || "Query validation failed",
          error.errors,
          firstError?.path.join(".")
        );
      }
      req.query = result.data as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.params);
      if (!result.success) {
        const error = result.error as ZodError;
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError?.message || "Parameter validation failed",
          error.errors,
          firstError?.path.join(".")
        );
      }
      req.params = result.data as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}

