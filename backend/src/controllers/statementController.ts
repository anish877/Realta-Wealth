import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/responses";
import { AuthenticatedRequest } from "../middleware/auth";
import { statementService } from "../services/statementService";

export class StatementController {
  /**
   * Create a new statement (or update existing draft) - Step 1
   */
  async createStatement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.sub;
      const statement = await statementService.createStatement(userId, req.body);
      sendSuccess(res, statement, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get statement by ID
   */
  async getStatement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const statement = await statementService.getStatementById(id, true);
      sendSuccess(res, statement);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List statements for current user (at most one, for parity with profiles)
   */
  async listStatements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.sub;
      const { page, limit, status } = req.query as any;
      const result = await statementService.getStatementsByUser(
        userId,
        { status },
        { page: parseInt(page) || 1, limit: parseInt(limit) || 20 }
      );
      sendSuccess(res, result.statements, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update specific step (page)
   */
  async updateStep(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // Extract step/page number from URL path (e.g., /step1 -> 1)
      const pathMatch = req.path.match(/\/step(\d+)$/);
      const stepNumber = pathMatch
        ? parseInt(pathMatch[1], 10)
        : parseInt((req.params as any).step || (req.body as any).step, 10);

      if (!stepNumber || stepNumber < 1 || stepNumber > 2) {
        return sendSuccess(res, { message: "Step number must be between 1 and 2" }, 400);
      }

      const statement = await statementService.updateStep(id, stepNumber, req.body);
      sendSuccess(res, statement);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit statement for review
   */
  async submitStatement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const statement = await statementService.submitStatement(id);
      sendSuccess(res, statement);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get statement progress
   */
  async getStatementProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const progress = await statementService.getStatementProgress(id);
      sendSuccess(res, progress);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate PDF for a statement
   */
  async generatePdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await statementService.generatePdf(id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const statementController = new StatementController();


