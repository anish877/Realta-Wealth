import { Request, Response, NextFunction } from "express";
import { accreditationService } from "../services/accreditationService";
import { sendSuccess, sendError } from "../utils/responses";
import { AuthenticatedRequest } from "../middleware/auth";

export class AccreditationController {
  /**
   * Create a new accreditation profile
   */
  async createAccreditation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.sub;
      const profile = await accreditationService.createAccreditation(userId, req.body);
      sendSuccess(res, profile, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get accreditation by ID
   */
  async getAccreditation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await accreditationService.getAccreditationById(id, true);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update accreditation
   */
  async updateAccreditation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await accreditationService.updateAccreditation(id, req.body);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit accreditation for review
   */
  async submitAccreditation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await accreditationService.submitAccreditation(id);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List accreditations with pagination and filtering
   */
  async listAccreditations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.sub;
      const { page, limit, status } = req.query as any;
      const result = await accreditationService.getAccreditationsByUser(
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
   * Get accreditation progress
   */
  async getAccreditationProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const progress = await accreditationService.getAccreditationProgress(id);
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
      const result = await accreditationService.generatePdf(id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const accreditationController = new AccreditationController();

