"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const signatureController_1 = require("../controllers/signatureController");
const auth_1 = require("../middleware/auth");
const validator_1 = require("../middleware/validator");
const signatureValidators_1 = require("../validators/signatureValidators");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Get all signatures for a profile
router.get("/:profileId/signatures", (0, validator_1.validateParams)(signatureValidators_1.signatureParamsSchema), signatureController_1.signatureController.getSignatures.bind(signatureController_1.signatureController));
// Get specific signature by type
router.get("/:profileId/signatures/:type", (0, validator_1.validateParams)(signatureValidators_1.signatureParamsSchema), signatureController_1.signatureController.getSignature.bind(signatureController_1.signatureController));
// Create or update signature
router.post("/:profileId/signatures", (0, validator_1.validateParams)(signatureValidators_1.signatureParamsSchema), (0, validator_1.validate)(signatureValidators_1.createSignatureSchema), signatureController_1.signatureController.createOrUpdateSignature.bind(signatureController_1.signatureController));
// Update signature
router.put("/:profileId/signatures/:type", (0, validator_1.validateParams)(signatureValidators_1.signatureParamsSchema), (0, validator_1.validate)(signatureValidators_1.updateSignatureSchema), signatureController_1.signatureController.createOrUpdateSignature.bind(signatureController_1.signatureController));
// Delete signature
router.delete("/:profileId/signatures/:type", (0, validator_1.validateParams)(signatureValidators_1.signatureParamsSchema), signatureController_1.signatureController.deleteSignature.bind(signatureController_1.signatureController));
exports.default = router;
