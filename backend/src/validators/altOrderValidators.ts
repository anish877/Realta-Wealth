import { z } from "zod";

/**
 * Backend validation schemas for Alternative Investment Order form
 * All fields are optional to allow draft saves
 */

// Enums
export const yesNoSchema = z.enum(["Yes", "No"]);
export const custodianSchema = z.enum([
  "First Clearing",
  "Direct",
  "MainStar",
  "CNB",
  "Kingdom Trust",
  "Other",
]);

// Alt Order Schema - all fields optional for draft saves
export const altOrderSchema = z.object({
  // Customer/Account Information
  rrName: z.string().trim().max(200).optional(),
  rrNo: z.string().trim().max(50).optional(),
  customerNames: z.string().trim().max(300).optional(),
  proposedPrincipalAmount: z.number().optional(),
  qualifiedAccount: yesNoSchema.optional(),
  qualifiedAccountCertificationText: z.string().trim().max(500).optional(),
  solicitedTrade: yesNoSchema.optional(),
  taxAdvantagePurchase: yesNoSchema.optional(),

  // Customer Order Information
  custodian: custodianSchema.optional(),
  nameOfProduct: z.string().trim().max(200).optional(),
  sponsorIssuer: z.string().trim().max(200).optional(),
  dateOfPpm: z.string().datetime().optional(),
  datePpmSent: z.string().datetime().optional(),
  existingIlliquidAltPositions: z.number().optional(),
  existingIlliquidAltConcentration: z.number().min(0).max(100).optional(),
  existingSemiLiquidAltPositions: z.number().optional(),
  existingSemiLiquidAltConcentration: z.number().min(0).max(100).optional(),
  existingTaxAdvantageAltPositions: z.number().optional(),
  existingTaxAdvantageAltConcentration: z.number().min(0).max(100).optional(),
  totalNetWorth: z.number().optional(),
  liquidNetWorth: z.number().optional(),
  totalConcentration: z.number().min(0).max(100).optional(),

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

  // Internal Use Only
  notes: z.string().trim().max(2000).optional(),
  regBiDelivery: z.boolean().optional(),
  stateRegistration: z.boolean().optional(),
  aiInsight: z.boolean().optional(),
  statementOfFinancialCondition: z.boolean().optional(),
  suitabilityReceived: z.boolean().optional(),
});

// Create Alt Order Schema (for POST /)
export const createAltOrderSchema = altOrderSchema;

// Params schema
export const altOrderParamsSchema = z.object({
  id: z.string().uuid(),
});

// Query schema
export const altOrderQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
  search: z.string().optional(),
});

