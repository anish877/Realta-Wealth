import { Router } from "express";
import { altOrderController } from "../controllers/altOrderController";
import { authenticate } from "../middleware/auth";
import { validate, validateParams, validateQuery } from "../middleware/validator";
import {
  createAltOrderSchema,
  altOrderParamsSchema,
  altOrderQuerySchema,
  altOrderSchema,
} from "../validators/altOrderValidators";

const router = Router();

// All routes require authentication
router.use(authenticate);

// List alt orders with pagination and filtering
router.get(
  "/",
  validateQuery(altOrderQuerySchema),
  altOrderController.listAltOrders.bind(altOrderController)
);

// Create new alt order
router.post(
  "/",
  validate(createAltOrderSchema),
  altOrderController.createAltOrder.bind(altOrderController)
);

// Get alt order by ID
router.get(
  "/:id",
  validateParams(altOrderParamsSchema),
  altOrderController.getAltOrder.bind(altOrderController)
);

// Update alt order
router.patch(
  "/:id",
  validateParams(altOrderParamsSchema),
  validate(altOrderSchema),
  altOrderController.updateAltOrder.bind(altOrderController)
);

// Submit alt order for review
router.post(
  "/:id/submit",
  validateParams(altOrderParamsSchema),
  altOrderController.submitAltOrder.bind(altOrderController)
);

// Get alt order progress
router.get(
  "/:id/progress",
  validateParams(altOrderParamsSchema),
  altOrderController.getAltOrderProgress.bind(altOrderController)
);

// Generate PDF
router.post(
  "/:id/generate-pdf",
  validateParams(altOrderParamsSchema),
  altOrderController.generatePdf.bind(altOrderController)
);

export default router;

