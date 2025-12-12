"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const investorProfiles_1 = __importDefault(require("./investorProfiles"));
const accountHolders_1 = __importDefault(require("./accountHolders"));
const signatures_1 = __importDefault(require("./signatures"));
const router = (0, express_1.Router)();
router.use("/auth", auth_1.default);
router.use("/investor-profiles", investorProfiles_1.default);
router.use("/investor-profiles", accountHolders_1.default);
router.use("/investor-profiles", signatures_1.default);
exports.default = router;
