"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const investorProfileController_1 = require("../controllers/investorProfileController");
const auth_1 = require("../middleware/auth");
const validator_1 = require("../middleware/validator");
const investorProfileValidators_1 = require("../validators/investorProfileValidators");
const accountHolderValidators_1 = require("../validators/accountHolderValidators");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// List profiles with pagination and filtering
router.get("/", (0, validator_1.validateQuery)(investorProfileValidators_1.profileQuerySchema), investorProfileController_1.investorProfileController.listProfiles.bind(investorProfileController_1.investorProfileController));
// Create new profile
router.post("/", (0, validator_1.validate)(investorProfileValidators_1.createProfileSchema), investorProfileController_1.investorProfileController.createProfile.bind(investorProfileController_1.investorProfileController));
// Get profile by ID
router.get("/:id", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), investorProfileController_1.investorProfileController.getProfile.bind(investorProfileController_1.investorProfileController));
// Update entire profile
router.put("/:id", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), (0, validator_1.validate)(investorProfileValidators_1.updateProfileSchema), investorProfileController_1.investorProfileController.updateProfile.bind(investorProfileController_1.investorProfileController));
// Partial update profile
router.patch("/:id", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), investorProfileController_1.investorProfileController.updateProfile.bind(investorProfileController_1.investorProfileController));
// Delete profile
router.delete("/:id", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), investorProfileController_1.investorProfileController.deleteProfile.bind(investorProfileController_1.investorProfileController));
// Submit profile for review
router.post("/:id/submit", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), investorProfileController_1.investorProfileController.submitProfile.bind(investorProfileController_1.investorProfileController));
// Get profile status
router.get("/:id/status", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), investorProfileController_1.investorProfileController.getProfileStatus.bind(investorProfileController_1.investorProfileController));
// Get profile progress
router.get("/:id/progress", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), investorProfileController_1.investorProfileController.getProfileProgress.bind(investorProfileController_1.investorProfileController));
// Generate PDF
router.post("/:id/generate-pdf", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), investorProfileController_1.investorProfileController.generatePdf.bind(investorProfileController_1.investorProfileController));
// Step-specific update routes
router.patch("/:id/step1", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), (0, validator_1.validate)(investorProfileValidators_1.step1Schema), investorProfileController_1.investorProfileController.updateStep.bind(investorProfileController_1.investorProfileController));
router.patch("/:id/step2", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), (0, validator_1.validate)(investorProfileValidators_1.step2Schema), investorProfileController_1.investorProfileController.updateStep.bind(investorProfileController_1.investorProfileController));
router.patch("/:id/step3", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), (0, validator_1.validate)(accountHolderValidators_1.accountHolderSchema), investorProfileController_1.investorProfileController.updateStep.bind(investorProfileController_1.investorProfileController));
router.patch("/:id/step4", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), (0, validator_1.validate)(accountHolderValidators_1.accountHolderSchema), investorProfileController_1.investorProfileController.updateStep.bind(investorProfileController_1.investorProfileController));
router.patch("/:id/step5", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), (0, validator_1.validate)(investorProfileValidators_1.step5Schema), investorProfileController_1.investorProfileController.updateStep.bind(investorProfileController_1.investorProfileController));
router.patch("/:id/step6", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), (0, validator_1.validate)(investorProfileValidators_1.step6Schema), investorProfileController_1.investorProfileController.updateStep.bind(investorProfileController_1.investorProfileController));
router.patch("/:id/step7", (0, validator_1.validateParams)(investorProfileValidators_1.profileParamsSchema), (0, validator_1.validate)(investorProfileValidators_1.step7Schema), investorProfileController_1.investorProfileController.updateStep.bind(investorProfileController_1.investorProfileController));
exports.default = router;
