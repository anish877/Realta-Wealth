import { Router } from "express";
import { clientController } from "../controllers/clientController";
import { authenticate } from "../middleware/auth";
import { adminOnly } from "../middleware/adminOnly";
import { validate, validateParams, validateQuery } from "../middleware/validator";
import { z } from "zod";

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

const clientParamsSchema = z.object({
  id: z.string().uuid("Invalid client ID"),
});

const clientQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
});

// List all clients
router.get(
  "/",
  validateQuery(clientQuerySchema),
  clientController.listClients.bind(clientController)
);

// Create new client
router.post(
  "/",
  validate(createClientSchema),
  clientController.createClient.bind(clientController)
);

// Get client by ID
router.get(
  "/:id",
  validateParams(clientParamsSchema),
  clientController.getClient.bind(clientController)
);

// Update client
router.put(
  "/:id",
  validateParams(clientParamsSchema),
  validate(updateClientSchema),
  clientController.updateClient.bind(clientController)
);

// Delete client
router.delete(
  "/:id",
  validateParams(clientParamsSchema),
  clientController.deleteClient.bind(clientController)
);

export default router;


