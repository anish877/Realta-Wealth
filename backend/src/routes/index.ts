import { Router } from "express";
import authRoutes from "./auth";
import investorProfileRoutes from "./investorProfiles";
import accountHolderRoutes from "./accountHolders";
import signatureRoutes from "./signatures";

const router = Router();

router.use("/auth", authRoutes);
router.use("/investor-profiles", investorProfileRoutes);
router.use("/investor-profiles", accountHolderRoutes);
router.use("/investor-profiles", signatureRoutes);

export default router;

