import { Request, Response, NextFunction } from "express";
import { accountHolderService } from "../services/accountHolderService";
import { sendSuccess } from "../utils/responses";
import { AccountHolderType } from "@prisma/client";

export class AccountHolderController {
  /**
   * Get all account holders for a profile
   */
  async getAccountHolders(req: Request, res: Response, next: NextFunction) {
    try {
      const { profileId } = req.params;
      const accountHolders = await accountHolderService.getAccountHoldersByProfile(profileId);
      sendSuccess(res, accountHolders);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific account holder
   */
  async getAccountHolder(req: Request, res: Response, next: NextFunction) {
    try {
      const { holderId } = req.params;
      const accountHolder = await accountHolderService.getAccountHolderById(holderId);
      sendSuccess(res, accountHolder);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create account holder (Primary or Secondary)
   */
  async createAccountHolder(req: Request, res: Response, next: NextFunction) {
    try {
      const { profileId } = req.params;
      const { holderType, ...data } = req.body;
      
      if (!holderType || (holderType !== "primary" && holderType !== "secondary")) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_HOLDER_TYPE",
            message: "holderType must be 'primary' or 'secondary'",
          },
        });
      }

      const accountHolder = await accountHolderService.createAccountHolder(
        profileId,
        holderType as AccountHolderType,
        data
      );
      sendSuccess(res, accountHolder, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update account holder
   */
  async updateAccountHolder(req: Request, res: Response, next: NextFunction) {
    try {
      const { holderId } = req.params;
      const accountHolder = await accountHolderService.updateAccountHolder(holderId, req.body);
      sendSuccess(res, accountHolder);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update addresses
   */
  async updateAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const { holderId } = req.params;
      const accountHolder = await accountHolderService.updateAccountHolder(holderId, {
        addresses: req.body.addresses,
      });
      sendSuccess(res, accountHolder);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update phones
   */
  async updatePhones(req: Request, res: Response, next: NextFunction) {
    try {
      const { holderId } = req.params;
      const accountHolder = await accountHolderService.updateAccountHolder(holderId, {
        phones: req.body.phones,
      });
      sendSuccess(res, accountHolder);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update investment knowledge
   */
  async updateInvestmentKnowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const { holderId } = req.params;
      const accountHolder = await accountHolderService.updateAccountHolder(holderId, {
        investmentKnowledge: req.body.investmentKnowledge,
      });
      sendSuccess(res, accountHolder);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update financial info
   */
  async updateFinancialInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { holderId } = req.params;
      const accountHolder = await accountHolderService.updateAccountHolder(holderId, {
        financialInformation: req.body,
      });
      sendSuccess(res, accountHolder);
    } catch (error) {
      next(error);
    }
  }
}

export const accountHolderController = new AccountHolderController();

