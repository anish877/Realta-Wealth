import { Router } from "express";
import { accountHolderController } from "../controllers/accountHolderController";
import { authenticate } from "../middleware/auth";
import { validate, validateParams } from "../middleware/validator";
import {
  accountHolderSchema,
  updateAccountHolderSchema,
  updateAddressesSchema,
  updatePhonesSchema,
  updateInvestmentKnowledgeSchema,
  updateFinancialInfoSchema,
  accountHolderParamsSchema,
} from "../validators/accountHolderValidators";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all account holders for a profile
router.get(
  "/:profileId/account-holders",
  validateParams(accountHolderParamsSchema),
  accountHolderController.getAccountHolders.bind(accountHolderController)
);

// Get specific account holder
router.get(
  "/:profileId/account-holders/:holderId",
  validateParams(accountHolderParamsSchema),
  accountHolderController.getAccountHolder.bind(accountHolderController)
);

// Create account holder
router.post(
  "/:profileId/account-holders",
  validateParams(accountHolderParamsSchema),
  validate(accountHolderSchema),
  accountHolderController.createAccountHolder.bind(accountHolderController)
);

// Update account holder
router.put(
  "/:profileId/account-holders/:holderId",
  validateParams(accountHolderParamsSchema),
  validate(updateAccountHolderSchema),
  accountHolderController.updateAccountHolder.bind(accountHolderController)
);

// Update addresses
router.patch(
  "/:profileId/account-holders/:holderId/addresses",
  validateParams(accountHolderParamsSchema),
  validate(updateAddressesSchema),
  accountHolderController.updateAddresses.bind(accountHolderController)
);

// Update phones
router.patch(
  "/:profileId/account-holders/:holderId/phones",
  validateParams(accountHolderParamsSchema),
  validate(updatePhonesSchema),
  accountHolderController.updatePhones.bind(accountHolderController)
);

// Update investment knowledge
router.patch(
  "/:profileId/account-holders/:holderId/investment-knowledge",
  validateParams(accountHolderParamsSchema),
  validate(updateInvestmentKnowledgeSchema),
  accountHolderController.updateInvestmentKnowledge.bind(accountHolderController)
);

// Update financial info
router.patch(
  "/:profileId/account-holders/:holderId/financial-info",
  validateParams(accountHolderParamsSchema),
  validate(updateFinancialInfoSchema),
  accountHolderController.updateFinancialInfo.bind(accountHolderController)
);

export default router;

