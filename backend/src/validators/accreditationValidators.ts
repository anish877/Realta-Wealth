import { z } from "zod";

/**
 * Backend validation schemas for Accredited Investor Verification (506c) form
 * All fields are optional to allow draft saves
 */

// Accreditation Schema - all fields optional for draft saves
export const accreditationSchema = z.object({
  // Client/Account Information
  rrName: z.string().trim().max(200).optional(),
  rrNo: z.string().trim().max(50).optional(),
  customerNames: z.string().trim().max(300).optional(),
  hasJointOwner: z.boolean().optional(),

  // Signatures
  accountOwnerSignature: z.string().optional(),
  accountOwnerPrintedName: z.string().trim().max(120).optional(),
  accountOwnerDate: z.string().datetime().optional(),
  jointAccountOwnerSignature: z.string().optional(),
  jointAccountOwnerPrintedName: z.string().trim().max(120).optional(),
  jointAccountOwnerDate: z.string().datetime().optional(),
  financialProfessionalSignature: z.string().optional(),
  financialProfessionalPrintedName: z.string().trim().max(120).optional(),
  financialProfessionalDate: z.string().datetime().optional(),
  registeredPrincipalSignature: z.string().optional(),
  registeredPrincipalPrintedName: z.string().trim().max(120).optional(),
  registeredPrincipalDate: z.string().datetime().optional(),
});

// Create Accreditation Schema (for POST /)
export const createAccreditationSchema = accreditationSchema;

// Params schema
export const accreditationParamsSchema = z.object({
  id: z.string().uuid(),
});

// Query schema
export const accreditationQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
  search: z.string().optional(),
});

