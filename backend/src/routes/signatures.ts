import { Router } from "express";
import { signatureController } from "../controllers/signatureController";
import { authenticate } from "../middleware/auth";
import { validate, validateParams } from "../middleware/validator";
import {
  createSignatureSchema,
  updateSignatureSchema,
  signatureParamsSchema,
} from "../validators/signatureValidators";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all signatures for a profile
router.get(
  "/:profileId/signatures",
  validateParams(signatureParamsSchema),
  signatureController.getSignatures.bind(signatureController)
);

// Get specific signature by type
router.get(
  "/:profileId/signatures/:type",
  validateParams(signatureParamsSchema),
  signatureController.getSignature.bind(signatureController)
);

// Create or update signature
router.post(
  "/:profileId/signatures",
  validateParams(signatureParamsSchema),
  validate(createSignatureSchema),
  signatureController.createOrUpdateSignature.bind(signatureController)
);

// Update signature
router.put(
  "/:profileId/signatures/:type",
  validateParams(signatureParamsSchema),
  validate(updateSignatureSchema),
  signatureController.createOrUpdateSignature.bind(signatureController)
);

// Delete signature
router.delete(
  "/:profileId/signatures/:type",
  validateParams(signatureParamsSchema),
  signatureController.deleteSignature.bind(signatureController)
);

export default router;

