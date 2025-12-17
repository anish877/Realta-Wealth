import { Router } from "express";
import { additionalHolderController } from "../controllers/additionalHolderController";
import { authenticate } from "../middleware/auth";
import { validate, validateParams, validateQuery } from "../middleware/validator";
import {
  createAdditionalHolderSchema,
  additionalHolderParamsSchema,
  additionalHolderQuerySchema,
  step1Schema,
  step2Schema,
} from "../validators/additionalHolderValidators";

const router = Router();

// All routes require authentication
router.use(authenticate);

// List additional holders with pagination and filtering
router.get(
  "/",
  validateQuery(additionalHolderQuerySchema),
  additionalHolderController.listAdditionalHolders.bind(additionalHolderController)
);

// Create new additional holder
router.post(
  "/",
  validate(createAdditionalHolderSchema),
  additionalHolderController.createAdditionalHolder.bind(additionalHolderController)
);

// Get additional holder by ID
router.get(
  "/:id",
  validateParams(additionalHolderParamsSchema),
  additionalHolderController.getAdditionalHolder.bind(additionalHolderController)
);

// Step-specific update routes (2 pages)
router.patch(
  "/:id/step1",
  validateParams(additionalHolderParamsSchema),
  validate(step1Schema),
  additionalHolderController.updateStep.bind(additionalHolderController)
);

router.patch(
  "/:id/step2",
  validateParams(additionalHolderParamsSchema),
  validate(step2Schema),
  additionalHolderController.updateStep.bind(additionalHolderController)
);

// Submit additional holder for review
router.post(
  "/:id/submit",
  validateParams(additionalHolderParamsSchema),
  additionalHolderController.submitAdditionalHolder.bind(additionalHolderController)
);

// Get additional holder progress
router.get(
  "/:id/progress",
  validateParams(additionalHolderParamsSchema),
  additionalHolderController.getAdditionalHolderProgress.bind(additionalHolderController)
);

// Generate PDF
router.post(
  "/:id/generate-pdf",
  validateParams(additionalHolderParamsSchema),
  additionalHolderController.generatePdf.bind(additionalHolderController)
);

export default router;

