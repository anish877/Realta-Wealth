import { Request, Response, NextFunction } from "express";
import { altOrderService } from "../services/altOrderService";
import { sendSuccess, sendError } from "../utils/responses";
import { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../utils/errors";

export class AltOrderController {
  /**
   * Create a new alt order
   */
  async createAltOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.body.clientId ? undefined : req.user!.sub;
      const clientId = req.body.clientId || undefined;
      const order = await altOrderService.createAltOrder(userId, clientId, req.body);
      sendSuccess(res, order, 201);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error creating alt order:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to create alt order", 500);
    }
  }

  /**
   * Get alt order by ID
   */
  async getAltOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await altOrderService.getAltOrderById(id, true);
      sendSuccess(res, order);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error getting alt order:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to get alt order", 500);
    }
  }

  /**
   * Get alt order formatted for n8n PDF filling
   * Returns all fields with sub-fields shown when checkboxes/conditions are true
   */
  async getAltOrderForN8N(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await altOrderService.getAltOrderById(id, true);
      
      // Format for n8n - flatten structure and show all fields
      const formatted = altOrderService.formatAltOrderForN8N(order);
      sendSuccess(res, formatted);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error getting alt order for n8n:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to get alt order", 500);
    }
  }

  /**
   * Update alt order
   */
  async updateAltOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await altOrderService.updateAltOrder(id, req.body);
      sendSuccess(res, order);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error updating alt order:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to update alt order", 500);
    }
  }

  /**
   * Submit alt order for review
   */
  async submitAltOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await altOrderService.submitAltOrder(id);
      sendSuccess(res, order);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error submitting alt order:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to submit alt order", 500);
    }
  }

  /**
   * List alt orders with pagination and filtering
   */
  async listAltOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const clientId = req.query.clientId as string | undefined;
      const userId = clientId ? undefined : req.user!.sub;
      const { page, limit, status } = req.query as any;
      const result = await altOrderService.getAltOrdersByUser(
        userId,
        clientId,
        { status },
        { page: parseInt(page) || 1, limit: parseInt(limit) || 20 }
      );
      sendSuccess(res, result.profiles, 200, result.pagination);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error listing alt orders:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to list alt orders", 500);
    }
  }

  /**
   * Get alt order progress
   */
  async getAltOrderProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const progress = await altOrderService.getAltOrderProgress(id);
      sendSuccess(res, progress);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error getting alt order progress:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to get alt order progress", 500);
    }
  }

  /**
   * Generate PDF
   */
  async generatePdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await altOrderService.generatePdf(id);
      sendSuccess(res, result);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error generating PDF:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to generate PDF", 500);
    }
  }
}

export const altOrderController = new AltOrderController();
