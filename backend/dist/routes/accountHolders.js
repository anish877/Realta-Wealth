"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accountHolderController_1 = require("../controllers/accountHolderController");
const auth_1 = require("../middleware/auth");
const validator_1 = require("../middleware/validator");
const accountHolderValidators_1 = require("../validators/accountHolderValidators");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Get all account holders for a profile
router.get("/:profileId/account-holders", (0, validator_1.validateParams)(accountHolderValidators_1.accountHolderParamsSchema), accountHolderController_1.accountHolderController.getAccountHolders.bind(accountHolderController_1.accountHolderController));
// Get specific account holder
router.get("/:profileId/account-holders/:holderId", (0, validator_1.validateParams)(accountHolderValidators_1.accountHolderParamsSchema), accountHolderController_1.accountHolderController.getAccountHolder.bind(accountHolderController_1.accountHolderController));
// Create account holder
router.post("/:profileId/account-holders", (0, validator_1.validateParams)(accountHolderValidators_1.accountHolderParamsSchema), (0, validator_1.validate)(accountHolderValidators_1.accountHolderSchema), accountHolderController_1.accountHolderController.createAccountHolder.bind(accountHolderController_1.accountHolderController));
// Update account holder
router.put("/:profileId/account-holders/:holderId", (0, validator_1.validateParams)(accountHolderValidators_1.accountHolderParamsSchema), (0, validator_1.validate)(accountHolderValidators_1.updateAccountHolderSchema), accountHolderController_1.accountHolderController.updateAccountHolder.bind(accountHolderController_1.accountHolderController));
// Update addresses
router.patch("/:profileId/account-holders/:holderId/addresses", (0, validator_1.validateParams)(accountHolderValidators_1.accountHolderParamsSchema), (0, validator_1.validate)(accountHolderValidators_1.updateAddressesSchema), accountHolderController_1.accountHolderController.updateAddresses.bind(accountHolderController_1.accountHolderController));
// Update phones
router.patch("/:profileId/account-holders/:holderId/phones", (0, validator_1.validateParams)(accountHolderValidators_1.accountHolderParamsSchema), (0, validator_1.validate)(accountHolderValidators_1.updatePhonesSchema), accountHolderController_1.accountHolderController.updatePhones.bind(accountHolderController_1.accountHolderController));
// Update investment knowledge
router.patch("/:profileId/account-holders/:holderId/investment-knowledge", (0, validator_1.validateParams)(accountHolderValidators_1.accountHolderParamsSchema), (0, validator_1.validate)(accountHolderValidators_1.updateInvestmentKnowledgeSchema), accountHolderController_1.accountHolderController.updateInvestmentKnowledge.bind(accountHolderController_1.accountHolderController));
// Update financial info
router.patch("/:profileId/account-holders/:holderId/financial-info", (0, validator_1.validateParams)(accountHolderValidators_1.accountHolderParamsSchema), (0, validator_1.validate)(accountHolderValidators_1.updateFinancialInfoSchema), accountHolderController_1.accountHolderController.updateFinancialInfo.bind(accountHolderController_1.accountHolderController));
exports.default = router;
