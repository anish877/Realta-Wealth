import { z } from "zod";

// Shared enums mirrored from Prisma
export const statementRowCategorySchema = z.enum([
  "liquid_non_qualified",
  "liabilities",
  "net_worth",
  "illiquid_non_qualified",
  "liquid_qualified",
  "income_summary",
  "illiquid_qualified",
]);

export const statementSignatureTypeSchema = z.enum([
  "account_owner",
  "joint_account_owner",
  "financial_professional",
  "registered_principal",
]);

// Basic currency field - backend expects number (frontend will normalize)
const currencyFieldSchema = z
  .number({ invalid_type_error: "Must be a number" })
  .nonnegative("Amount cannot be negative");

export const statementFinancialRowSchema = z.object({
  category: statementRowCategorySchema,
  rowKey: z.string().min(1, "rowKey is required"),
  label: z.string().optional(),
  value: currencyFieldSchema,
  isTotal: z.boolean().optional(),
});

// Step 1: Header + all financial rows on page 1 (draft version - no required fields)
export const statementStep1DraftSchema = z.object({
  rrName: z.string().trim().max(200).optional(),
  rrNo: z.string().trim().max(50).optional(),
  customerNames: z.string().trim().max(300).optional(),
  notesPage1: z.string().trim().max(2000).optional(),
  financialRows: z.array(statementFinancialRowSchema).optional(),
});

// Step 1: Header + all financial rows on page 1 (full validation for submit)
export const statementStep1Schema = statementStep1DraftSchema.superRefine((data, ctx) => {
  // Require RR Name and Customer Names for a complete Step 1
  if (!data.rrName || data.rrName.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "RR Name is required",
      path: ["rrName"],
    });
  }
  if (!data.customerNames || data.customerNames.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Customer Names are required",
      path: ["customerNames"],
    });
  }

  // At least one financial row with a non-zero value is required
  const rows = data.financialRows || [];
  const hasNonZero = rows.some((r) => r.value > 0);
  if (!hasNonZero) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one financial amount must be provided",
      path: ["financialRows"],
    });
  }
});

// Step 2: Notes + signatures (payload is simplified; full rules in complete validation)
export const statementSignatureSchema = z.object({
  signatureType: statementSignatureTypeSchema,
  signatureData: z.string().min(1, "Signature data is required"),
  printedName: z.string().min(1, "Printed name is required"),
  signatureDate: z.string().datetime(),
});

// Draft version of signature schema (for saves)
export const statementSignatureDraftSchema = z.object({
  signatureType: statementSignatureTypeSchema,
  signatureData: z.string().optional(),
  printedName: z.string().optional(),
  signatureDate: z.string().optional(), // Allow any string for draft saves
});

// Step 2: Draft version (no required fields for saves)
export const statementStep2DraftSchema = z.object({
  additionalNotes: z.string().trim().max(4000).optional(),
  signatures: z.array(statementSignatureDraftSchema).optional(),
});

// Step 2: Full validation schema (for submit)
export const statementStep2Schema = z.object({
  additionalNotes: z.string().trim().max(4000).optional(),
  signatures: z.array(statementSignatureSchema).optional(),
});

// Create / update helpers

// Draft version for saves (no required fields)
export const createStatementDraftSchema = z.object({
  rrName: z.string().trim().max(200).optional(),
  rrNo: z.string().trim().max(50).optional(),
  customerNames: z.string().trim().max(300).optional(),
  notesPage1: z.string().trim().max(2000).optional(),
  financialRows: z.array(statementFinancialRowSchema).optional(),
  userId: z.string().uuid().optional(),
});

// Full validation schema (for submit validation - not used in routes, but kept for reference)
export const createStatementSchema = createStatementDraftSchema.superRefine((data, ctx) => {
  // Require RR Name and Customer Names for a complete Step 1
  if (!data.rrName || data.rrName.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "RR Name is required",
      path: ["rrName"],
    });
  }
  if (!data.customerNames || data.customerNames.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Customer Names are required",
      path: ["customerNames"],
    });
  }

  // At least one financial row with a non-zero value is required
  const rows = data.financialRows || [];
  const hasNonZero = rows.some((r) => r.value > 0);
  if (!hasNonZero) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one financial amount must be provided",
      path: ["financialRows"],
    });
  }
});

export const updateStatementSchema = z.object({
  step1: statementStep1Schema.optional(),
  step2: statementStep2Schema.optional(),
});

export const statementParamsSchema = z.object({
  id: z.string().uuid(),
});

export const statementQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
  userId: z.string().uuid().optional(),
});


