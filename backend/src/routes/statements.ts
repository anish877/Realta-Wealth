import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate, validateParams, validateQuery } from "../middleware/validator";
import {
  createStatementDraftSchema,
  updateStatementSchema,
  statementParamsSchema,
  statementQuerySchema,
  statementStep1DraftSchema,
  statementStep2DraftSchema,
} from "../validators/statementValidators";
import { statementController } from "../controllers/statementController";

const router = Router();

// All statement routes require authentication
router.use(authenticate);

// List statements for current user
router.get(
  "/",
  validateQuery(statementQuerySchema),
  statementController.listStatements.bind(statementController)
);

// Create new statement (Step 1) - uses draft schema to allow incomplete data
router.post(
  "/",
  validate(createStatementDraftSchema),
  statementController.createStatement.bind(statementController)
);

// Get statement by ID
router.get(
  "/:id",
  validateParams(statementParamsSchema),
  statementController.getStatement.bind(statementController)
);

// Step-specific update routes (2 pages) - use draft schemas to allow incomplete data
router.patch(
  "/:id/step1",
  validateParams(statementParamsSchema),
  validate(statementStep1DraftSchema),
  statementController.updateStep.bind(statementController)
);

router.patch(
  "/:id/step2",
  validateParams(statementParamsSchema),
  validate(statementStep2DraftSchema),
  statementController.updateStep.bind(statementController)
);

// Submit statement
router.post(
  "/:id/submit",
  validateParams(statementParamsSchema),
  statementController.submitStatement.bind(statementController)
);

// Get statement progress
router.get(
  "/:id/progress",
  validateParams(statementParamsSchema),
  statementController.getStatementProgress.bind(statementController)
);

// Generate PDF for statement
router.post(
  "/:id/generate-pdf",
  validateParams(statementParamsSchema),
  statementController.generatePdf.bind(statementController)
);

export default router;


