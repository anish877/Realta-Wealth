import { Request, Response, NextFunction } from "express";
import { additionalHolderService } from "../services/additionalHolderService";
import { sendSuccess, sendError } from "../utils/responses";
import { AuthenticatedRequest } from "../middleware/auth";

export class AdditionalHolderController {
  /**
   * Create a new additional holder profile
   */
  async createAdditionalHolder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.body.clientId ? undefined : req.user!.sub;
      const clientId = req.body.clientId || undefined;
      const profile = await additionalHolderService.createAdditionalHolder(userId, clientId, req.body);
      sendSuccess(res, profile, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get additional holder by ID
   */
  async getAdditionalHolder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await additionalHolderService.getAdditionalHolderById(id, true);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update specific step
   */
  async updateStep(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // Extract step number from URL path (e.g., /step1 -> 1, /step2 -> 2)
      const pathMatch = req.path.match(/\/step(\d+)$/);
      const stepNumber = pathMatch 
        ? parseInt(pathMatch[1], 10)
        : parseInt(req.params.step || req.body.step, 10);
      
      if (!stepNumber || stepNumber < 1 || stepNumber > 2) {
        return sendError(res, "INVALID_STEP", "Step number must be between 1 and 2", 400);
      }
      const profile = await additionalHolderService.updateStep(id, stepNumber, req.body);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit additional holder for review
   */
  async submitAdditionalHolder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await additionalHolderService.submitAdditionalHolder(id);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List additional holders with pagination and filtering
   */
  async listAdditionalHolders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const clientId = req.query.clientId as string | undefined;
      const userId = clientId ? undefined : req.user!.sub;
      const { page, limit, status } = req.query as any;
      const result = await additionalHolderService.getAdditionalHoldersByUser(
        userId,
        clientId,
        { status },
        { page: parseInt(page) || 1, limit: parseInt(limit) || 20 }
      );
      sendSuccess(res, result.profiles, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get additional holder progress
   */
  async getAdditionalHolderProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const progress = await additionalHolderService.getAdditionalHolderProgress(id);
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
      const result = await additionalHolderService.generatePdf(id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const additionalHolderController = new AdditionalHolderController();

