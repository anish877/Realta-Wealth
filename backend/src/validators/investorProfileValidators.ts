import { z } from "zod";
import { investmentTypeSchema } from "./accountHolderValidators";

// Step 1: Account Registration Validators

export const accountTypeSchema = z.enum([
  "individual",
  "corporation",
  "corporate_pension_profit_sharing",
  "custodial",
  "estate",
  "joint_tenant",
  "limited_liability_company",
  "individual_single_member_llc",
  "sole_proprietorship",
  "transfer_on_death_individual",
  "transfer_on_death_joint",
  "nonprofit_organization",
  "partnership",
  "exempt_organization",
  "trust",
  "other",
]);

export const additionalDesignationSchema = z.enum([
  "c_corp",
  "s_corp",
  "ugma",
  "utma",
  "partnership",
]);

export const trustTypeSchema = z.enum([
  "charitable",
  "living",
  "irrevocable_living",
  "family",
  "revocable",
  "irrevocable",
  "testamentary",
]);

export const tenancyClauseSchema = z.enum([
  "community_property",
  "tenants_by_entirety",
  "community_property_with_rights",
  "joint_tenants_with_rights_of_survivorship",
  "tenants_in_common",
]);

export const step1Schema = z.object({
  rrName: z.string().optional(),
  rrNo: z.string().optional(),
  customerNames: z.string().optional(),
  accountNo: z.string().optional(),
  retirementAccount: z.boolean().default(false),
  retailAccount: z.boolean().default(false),
  accountTypes: z.array(accountTypeSchema).optional(),
  additionalDesignations: z.array(additionalDesignationSchema).optional(),
  otherAccountTypeText: z.string().optional(),
  trustInformation: z
    .object({
      establishmentDate: z.string().datetime().optional(),
      trustTypes: z.array(trustTypeSchema).optional(),
    })
    .optional(),
  jointAccountInformation: z
    .object({
      areAccountHoldersMarried: z.enum(["Yes", "No"]).optional(),
      tenancyState: z.string().optional(),
      numberOfTenants: z.number().int().positive().optional(),
      tenancyClauses: z.array(tenancyClauseSchema).optional(),
    })
    .optional(),
  custodialAccountInformation: z
    .object({
      stateGiftGiven1: z.string().optional(),
      dateGiftGiven1: z.string().datetime().optional(),
      stateGiftGiven2: z.string().optional(),
      dateGiftGiven2: z.string().datetime().optional(),
    })
    .optional(),
  transferOnDeathInformation: z
    .object({
      individualAgreementDate: z.string().datetime().optional(),
      jointAgreementDate: z.string().datetime().optional(),
    })
    .optional(),
});

// Step 2: Patriot Act Information Validators

export const step2Schema = z.object({
  initialSourceOfFunds: z.array(z.string()).min(1, "At least one source of funds is required"),
  otherSourceOfFundsText: z.string().optional(),
});

// Step 5: Investment Objectives Validators

export const riskExposureSchema = z.enum(["Low", "Moderate", "Speculation", "High Risk"]);

export const accountInvestmentObjectiveSchema = z.enum([
  "Income",
  "Long-Term Growth",
  "Short-Term Growth",
]);

export const liquidityNeedSchema = z.enum(["High", "Medium", "Low"]);

// investmentTypeSchema is exported from accountHolderValidators to avoid duplication

export const step5Schema = z.object({
  riskExposure: z.array(riskExposureSchema).optional(),
  accountInvestmentObjectives: z.array(accountInvestmentObjectiveSchema).optional(),
  seeAttachedStatement: z.boolean().default(false),
  timeHorizonFrom: z.string().optional(),
  timeHorizonTo: z.string().optional(),
  liquidityNeeds: z.array(liquidityNeedSchema).optional(),
  investmentValues: z
    .array(
      z.object({
        investmentType: investmentTypeSchema as any,
        value: z.number().nonnegative(),
      })
    )
    .optional(),
});

// Step 6: Trusted Contact Validators

export const step6Schema = z.object({
  declineToProvide: z.boolean().default(false),
  name: z.string().optional(),
  email: z.string().email().optional(),
  homePhone: z.string().optional(),
  businessPhone: z.string().optional(),
  mobilePhone: z.string().optional(),
  mailingAddress: z.string().optional(),
  city: z.string().optional(),
  stateProvince: z.string().optional(),
  zipPostalCode: z.string().optional(),
  country: z.string().optional(),
});

// Step 7: Signatures Validators

export const signatureTypeSchema = z.enum([
  "account_owner",
  "joint_account_owner",
  "financial_professional",
  "supervisor_principal",
]);

export const signatureSchema = z.object({
  signatureType: signatureTypeSchema,
  signatureData: z.string().min(1, "Signature data is required"),
  printedName: z.string().min(1, "Printed name is required"),
  signatureDate: z.string().datetime(),
});

export const step7Schema = z.object({
  signatures: z.array(signatureSchema).min(1, "At least one signature is required"),
});

// Complete Profile Schema

export const createProfileSchema = step1Schema.extend({
  userId: z.string().uuid().optional(),
});

export const updateProfileSchema = z.object({
  step1: step1Schema.optional(),
  step2: step2Schema.optional(),
  step3: z.any().optional(), // Will be defined in accountHolderValidators
  step4: z.any().optional(), // Will be defined in accountHolderValidators
  step5: step5Schema.optional(),
  step6: step6Schema.optional(),
  step7: step7Schema.optional(),
});

export const submitProfileSchema = z.object({
  profileId: z.string().uuid(),
});

export const profileQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
  userId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export const profileParamsSchema = z.object({
  id: z.string().uuid(),
});

