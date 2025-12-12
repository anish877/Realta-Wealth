"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGNATURE_TYPES = exports.PROFILE_STATUS = exports.PAGINATION = exports.CACHE_TTL = exports.RATE_LIMITS = void 0;
exports.RATE_LIMITS = {
    CREATE_PROFILE: 10, // per hour
    UPDATE_PROFILE: 100, // per hour
    SUBMIT_PROFILE: 5, // per hour
    GENERAL_API: 1000, // per hour
};
exports.CACHE_TTL = {
    DRAFT_PROFILE: 5 * 60, // 5 minutes
    SUBMITTED_PROFILE: 60 * 60, // 1 hour
};
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};
exports.PROFILE_STATUS = {
    DRAFT: "draft",
    SUBMITTED: "submitted",
    APPROVED: "approved",
    REJECTED: "rejected",
};
exports.SIGNATURE_TYPES = {
    ACCOUNT_OWNER: "account_owner",
    JOINT_ACCOUNT_OWNER: "joint_account_owner",
    FINANCIAL_PROFESSIONAL: "financial_professional",
    SUPERVISOR_PRINCIPAL: "supervisor_principal",
};
