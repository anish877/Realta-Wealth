import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { analyticsService } from "../services/analyticsService";
import { sendSuccess, sendError } from "../utils/responses";
import { AppError } from "../utils/errors";

export class AnalyticsController {
  async getDashboardAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const analytics = await analyticsService.getDashboardAnalytics();
      return sendSuccess(res, analytics);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error getting dashboard analytics:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to get dashboard analytics", 500);
    }
  }

  async getClientAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const { clientId } = req.params;
      const analytics = await analyticsService.getClientAnalytics(clientId);
      return sendSuccess(res, analytics);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error getting client analytics:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to get client analytics", 500);
    }
  }
}

export const analyticsController = new AnalyticsController();


