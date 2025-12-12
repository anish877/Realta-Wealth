import { Request, Response, NextFunction } from "express";
import { investorProfileService } from "../services/investorProfileService";
import { sendSuccess, sendError, calculatePagination } from "../utils/responses";
import { AuthenticatedRequest } from "../middleware/auth";
import { NotFoundError } from "../utils/errors";

export class InvestorProfileController {
  /**
   * Create a new investor profile
   */
  async createProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.sub;
      const profile = await investorProfileService.createProfile(userId, req.body);
      sendSuccess(res, profile, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile by ID
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await investorProfileService.getProfileById(id, true);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await investorProfileService.updateProfile(id, req.body);
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
      
      if (!stepNumber || stepNumber < 1 || stepNumber > 7) {
        return sendError(res, "INVALID_STEP", "Step number must be between 1 and 7", 400);
      }
      const profile = await investorProfileService.updateStep(id, stepNumber, req.body);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit profile for review
   */
  async submitProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await investorProfileService.submitProfile(id);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete profile
   */
  async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await investorProfileService.deleteProfile(id);
      sendSuccess(res, { message: "Profile deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List profiles with pagination and filtering
   */
  async listProfiles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.sub;
      const { page, limit, status, search } = req.query as any;
      
      const result = await investorProfileService.getProfilesByUser(
        userId,
        { status, search },
        { page: parseInt(page) || 1, limit: parseInt(limit) || 20 }
      );
      
      sendSuccess(res, result.profiles, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile status
   */
  async getProfileStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await investorProfileService.getProfileById(id, false);
      sendSuccess(res, { status: profile.status });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile progress
   */
  async getProfileProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const progress = await investorProfileService.getProfileProgress(id);
      sendSuccess(res, progress);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate PDF for a profile
   */
  async generatePdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await investorProfileService.generatePdf(id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const investorProfileController = new InvestorProfileController();

