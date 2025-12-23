import { Router } from "express";
import { analyticsController } from "../controllers/analyticsController";
import { authenticate } from "../middleware/auth";
import { adminOnly } from "../middleware/adminOnly";
import { validateParams } from "../middleware/validator";
import { z } from "zod";

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

const clientParamsSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
});

// Get dashboard analytics
router.get(
  "/dashboard",
  analyticsController.getDashboardAnalytics.bind(analyticsController)
);

// Get client-specific analytics
router.get(
  "/clients/:clientId",
  validateParams(clientParamsSchema),
  analyticsController.getClientAnalytics.bind(analyticsController)
);

export default router;


