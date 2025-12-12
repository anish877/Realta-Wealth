import { Router } from "express";
import { investorProfileController } from "../controllers/investorProfileController";
import { authenticate } from "../middleware/auth";
import { validate, validateParams, validateQuery } from "../middleware/validator";
import {
  createProfileSchema,
  updateProfileSchema,
  profileParamsSchema,
  profileQuerySchema,
  step1Schema,
  step2Schema,
  step5Schema,
  step6Schema,
  step7Schema,
} from "../validators/investorProfileValidators";
import { accountHolderSchema } from "../validators/accountHolderValidators";

const router = Router();

// All routes require authentication
router.use(authenticate);

// List profiles with pagination and filtering
router.get(
  "/",
  validateQuery(profileQuerySchema),
  investorProfileController.listProfiles.bind(investorProfileController)
);

// Create new profile
router.post(
  "/",
  validate(createProfileSchema),
  investorProfileController.createProfile.bind(investorProfileController)
);

// Get profile by ID
router.get(
  "/:id",
  validateParams(profileParamsSchema),
  investorProfileController.getProfile.bind(investorProfileController)
);

// Update entire profile
router.put(
  "/:id",
  validateParams(profileParamsSchema),
  validate(updateProfileSchema),
  investorProfileController.updateProfile.bind(investorProfileController)
);

// Partial update profile
router.patch(
  "/:id",
  validateParams(profileParamsSchema),
  investorProfileController.updateProfile.bind(investorProfileController)
);

// Delete profile
router.delete(
  "/:id",
  validateParams(profileParamsSchema),
  investorProfileController.deleteProfile.bind(investorProfileController)
);

// Submit profile for review
router.post(
  "/:id/submit",
  validateParams(profileParamsSchema),
  investorProfileController.submitProfile.bind(investorProfileController)
);

// Get profile status
router.get(
  "/:id/status",
  validateParams(profileParamsSchema),
  investorProfileController.getProfileStatus.bind(investorProfileController)
);

// Get profile progress
router.get(
  "/:id/progress",
  validateParams(profileParamsSchema),
  investorProfileController.getProfileProgress.bind(investorProfileController)
);

// Generate PDF
router.post(
  "/:id/generate-pdf",
  validateParams(profileParamsSchema),
  investorProfileController.generatePdf.bind(investorProfileController)
);

// Step-specific update routes
router.patch(
  "/:id/step1",
  validateParams(profileParamsSchema),
  validate(step1Schema),
  investorProfileController.updateStep.bind(investorProfileController)
);

router.patch(
  "/:id/step2",
  validateParams(profileParamsSchema),
  validate(step2Schema),
  investorProfileController.updateStep.bind(investorProfileController)
);

router.patch(
  "/:id/step3",
  validateParams(profileParamsSchema),
  validate(accountHolderSchema),
  investorProfileController.updateStep.bind(investorProfileController)
);

router.patch(
  "/:id/step4",
  validateParams(profileParamsSchema),
  validate(accountHolderSchema),
  investorProfileController.updateStep.bind(investorProfileController)
);

router.patch(
  "/:id/step5",
  validateParams(profileParamsSchema),
  validate(step5Schema),
  investorProfileController.updateStep.bind(investorProfileController)
);

router.patch(
  "/:id/step6",
  validateParams(profileParamsSchema),
  validate(step6Schema),
  investorProfileController.updateStep.bind(investorProfileController)
);

router.patch(
  "/:id/step7",
  validateParams(profileParamsSchema),
  validate(step7Schema),
  investorProfileController.updateStep.bind(investorProfileController)
);

export default router;

