export const RATE_LIMITS = {
  CREATE_PROFILE: 10, // per hour
  UPDATE_PROFILE: 100, // per hour
  SUBMIT_PROFILE: 5, // per hour
  GENERAL_API: 1000, // per hour
} as const;

export const CACHE_TTL = {
  DRAFT_PROFILE: 5 * 60, // 5 minutes
  SUBMITTED_PROFILE: 60 * 60, // 1 hour
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const PROFILE_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const SIGNATURE_TYPES = {
  ACCOUNT_OWNER: "account_owner",
  JOINT_ACCOUNT_OWNER: "joint_account_owner",
  FINANCIAL_PROFESSIONAL: "financial_professional",
  SUPERVISOR_PRINCIPAL: "supervisor_principal",
} as const;

