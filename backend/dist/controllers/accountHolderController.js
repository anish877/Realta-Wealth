"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountHolderController = exports.AccountHolderController = void 0;
const accountHolderService_1 = require("../services/accountHolderService");
const responses_1 = require("../utils/responses");
class AccountHolderController {
    /**
     * Get all account holders for a profile
     */
    async getAccountHolders(req, res, next) {
        try {
            const { profileId } = req.params;
            const accountHolders = await accountHolderService_1.accountHolderService.getAccountHoldersByProfile(profileId);
            (0, responses_1.sendSuccess)(res, accountHolders);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get specific account holder
     */
    async getAccountHolder(req, res, next) {
        try {
            const { holderId } = req.params;
            const accountHolder = await accountHolderService_1.accountHolderService.getAccountHolderById(holderId);
            (0, responses_1.sendSuccess)(res, accountHolder);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Create account holder (Primary or Secondary)
     */
    async createAccountHolder(req, res, next) {
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
            const accountHolder = await accountHolderService_1.accountHolderService.createAccountHolder(profileId, holderType, data);
            (0, responses_1.sendSuccess)(res, accountHolder, 201);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update account holder
     */
    async updateAccountHolder(req, res, next) {
        try {
            const { holderId } = req.params;
            const accountHolder = await accountHolderService_1.accountHolderService.updateAccountHolder(holderId, req.body);
            (0, responses_1.sendSuccess)(res, accountHolder);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update addresses
     */
    async updateAddresses(req, res, next) {
        try {
            const { holderId } = req.params;
            const accountHolder = await accountHolderService_1.accountHolderService.updateAccountHolder(holderId, {
                addresses: req.body.addresses,
            });
            (0, responses_1.sendSuccess)(res, accountHolder);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update phones
     */
    async updatePhones(req, res, next) {
        try {
            const { holderId } = req.params;
            const accountHolder = await accountHolderService_1.accountHolderService.updateAccountHolder(holderId, {
                phones: req.body.phones,
            });
            (0, responses_1.sendSuccess)(res, accountHolder);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update investment knowledge
     */
    async updateInvestmentKnowledge(req, res, next) {
        try {
            const { holderId } = req.params;
            const accountHolder = await accountHolderService_1.accountHolderService.updateAccountHolder(holderId, {
                investmentKnowledge: req.body.investmentKnowledge,
            });
            (0, responses_1.sendSuccess)(res, accountHolder);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update financial info
     */
    async updateFinancialInfo(req, res, next) {
        try {
            const { holderId } = req.params;
            const accountHolder = await accountHolderService_1.accountHolderService.updateAccountHolder(holderId, {
                financialInformation: req.body,
            });
            (0, responses_1.sendSuccess)(res, accountHolder);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AccountHolderController = AccountHolderController;
exports.accountHolderController = new AccountHolderController();
