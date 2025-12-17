import { Router } from "express";
import { accreditationController } from "../controllers/accreditationController";
import { authenticate } from "../middleware/auth";
import { validate, validateParams, validateQuery } from "../middleware/validator";
import {
  createAccreditationSchema,
  accreditationParamsSchema,
  accreditationQuerySchema,
  accreditationSchema,
} from "../validators/accreditationValidators";

const router = Router();

// All routes require authentication
router.use(authenticate);

// List accreditations with pagination and filtering
router.get(
  "/",
  validateQuery(accreditationQuerySchema),
  accreditationController.listAccreditations.bind(accreditationController)
);

// Create new accreditation
router.post(
  "/",
  validate(createAccreditationSchema),
  accreditationController.createAccreditation.bind(accreditationController)
);

// Get accreditation by ID
router.get(
  "/:id",
  validateParams(accreditationParamsSchema),
  accreditationController.getAccreditation.bind(accreditationController)
);

// Update accreditation
router.patch(
  "/:id",
  validateParams(accreditationParamsSchema),
  validate(accreditationSchema),
  accreditationController.updateAccreditation.bind(accreditationController)
);

// Submit accreditation for review
router.post(
  "/:id/submit",
  validateParams(accreditationParamsSchema),
  accreditationController.submitAccreditation.bind(accreditationController)
);

// Get accreditation progress
router.get(
  "/:id/progress",
  validateParams(accreditationParamsSchema),
  accreditationController.getAccreditationProgress.bind(accreditationController)
);

// Generate PDF
router.post(
  "/:id/generate-pdf",
  validateParams(accreditationParamsSchema),
  accreditationController.generatePdf.bind(accreditationController)
);

export default router;

