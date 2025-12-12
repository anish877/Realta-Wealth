"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.investorProfileController = exports.InvestorProfileController = void 0;
const investorProfileService_1 = require("../services/investorProfileService");
const responses_1 = require("../utils/responses");
class InvestorProfileController {
    /**
     * Create a new investor profile
     */
    async createProfile(req, res, next) {
        try {
            const userId = req.user.sub;
            const profile = await investorProfileService_1.investorProfileService.createProfile(userId, req.body);
            (0, responses_1.sendSuccess)(res, profile, 201);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get profile by ID
     */
    async getProfile(req, res, next) {
        try {
            const { id } = req.params;
            const profile = await investorProfileService_1.investorProfileService.getProfileById(id, true);
            (0, responses_1.sendSuccess)(res, profile);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update profile
     */
    async updateProfile(req, res, next) {
        try {
            const { id } = req.params;
            const profile = await investorProfileService_1.investorProfileService.updateProfile(id, req.body);
            (0, responses_1.sendSuccess)(res, profile);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update specific step
     */
    async updateStep(req, res, next) {
        try {
            const { id } = req.params;
            // Extract step number from URL path (e.g., /step1 -> 1, /step2 -> 2)
            const pathMatch = req.path.match(/\/step(\d+)$/);
            const stepNumber = pathMatch
                ? parseInt(pathMatch[1], 10)
                : parseInt(req.params.step || req.body.step, 10);
            if (!stepNumber || stepNumber < 1 || stepNumber > 7) {
                return (0, responses_1.sendError)(res, "INVALID_STEP", "Step number must be between 1 and 7", 400);
            }
            const profile = await investorProfileService_1.investorProfileService.updateStep(id, stepNumber, req.body);
            (0, responses_1.sendSuccess)(res, profile);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Submit profile for review
     */
    async submitProfile(req, res, next) {
        try {
            const { id } = req.params;
            const profile = await investorProfileService_1.investorProfileService.submitProfile(id);
            (0, responses_1.sendSuccess)(res, profile);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete profile
     */
    async deleteProfile(req, res, next) {
        try {
            const { id } = req.params;
            await investorProfileService_1.investorProfileService.deleteProfile(id);
            (0, responses_1.sendSuccess)(res, { message: "Profile deleted successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * List profiles with pagination and filtering
     */
    async listProfiles(req, res, next) {
        try {
            const userId = req.user.sub;
            const { page, limit, status, search } = req.query;
            const result = await investorProfileService_1.investorProfileService.getProfilesByUser(userId, { status, search }, { page: parseInt(page) || 1, limit: parseInt(limit) || 20 });
            (0, responses_1.sendSuccess)(res, result.profiles, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get profile status
     */
    async getProfileStatus(req, res, next) {
        try {
            const { id } = req.params;
            const profile = await investorProfileService_1.investorProfileService.getProfileById(id, false);
            (0, responses_1.sendSuccess)(res, { status: profile.status });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get profile progress
     */
    async getProfileProgress(req, res, next) {
        try {
            const { id } = req.params;
            const progress = await investorProfileService_1.investorProfileService.getProfileProgress(id);
            (0, responses_1.sendSuccess)(res, progress);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Generate PDF for a profile
     */
    async generatePdf(req, res, next) {
        try {
            const { id } = req.params;
            const result = await investorProfileService_1.investorProfileService.generatePdf(id);
            (0, responses_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.InvestorProfileController = InvestorProfileController;
exports.investorProfileController = new InvestorProfileController();
