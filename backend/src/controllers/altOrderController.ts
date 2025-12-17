import { Request, Response, NextFunction } from "express";
import { altOrderService } from "../services/altOrderService";
import { sendSuccess, sendError } from "../utils/responses";
import { AuthenticatedRequest } from "../middleware/auth";

export class AltOrderController {
  /**
   * Create a new alt order
   */
  async createAltOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.sub;
      const order = await altOrderService.createAltOrder(userId, req.body);
      sendSuccess(res, order, 201);
    } catch (error) {
      next(error);
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
    } catch (error) {
      next(error);
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
    } catch (error) {
      next(error);
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * List alt orders with pagination and filtering
   */
  async listAltOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.sub;
      const { page, limit, status } = req.query as any;
      const result = await altOrderService.getAltOrdersByUser(
        userId,
        { status },
        { page: parseInt(page) || 1, limit: parseInt(limit) || 20 }
      );
      sendSuccess(res, result.profiles, 200, result.pagination);
    } catch (error) {
      next(error);
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
    } catch (error) {
      next(error);
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
    } catch (error) {
      next(error);
    }
  }
}

export const altOrderController = new AltOrderController();

