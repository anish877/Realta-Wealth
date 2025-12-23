import { Router } from "express";
import authRoutes from "./auth";
import investorProfileRoutes from "./investorProfiles";
import accountHolderRoutes from "./accountHolders";
import signatureRoutes from "./signatures";
import statementRoutes from "./statements";
import additionalHolderRoutes from "./additionalHolders";
import altOrderRoutes from "./altOrders";
import accreditationRoutes from "./accreditations";
import clientRoutes from "./clients";
import analyticsRoutes from "./analytics";

const router = Router();

router.use("/auth", authRoutes);
router.use("/clients", clientRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/investor-profiles", investorProfileRoutes);
router.use("/investor-profiles", accountHolderRoutes);
router.use("/investor-profiles", signatureRoutes);
router.use("/statements", statementRoutes);
router.use("/additional-holders", additionalHolderRoutes);
router.use("/alt-orders", altOrderRoutes);
router.use("/accreditations", accreditationRoutes);

export default router;

