import { z } from "zod";

/**
 * Backend validation schemas for Additional Holder form
 * All fields are optional to allow draft saves
 */

// Enums
export const personEntitySchema = z.enum(["Person", "Entity"]);
export const genderSchema = z.enum(["Male", "Female"]);
export const maritalStatusSchema = z.enum([
  "Single",
  "Married",
  "Divorced",
  "DomesticPartner",
  "Widow",
  "Widowed",
]);
export const employmentStatusSchema = z.enum([
  "Employed",
  "SelfEmployed",
  "Retired",
  "Unemployed",
  "Student",
  "Homemaker",
]);
export const investmentKnowledgeLevelSchema = z.enum([
  "Limited",
  "Moderate",
  "Extensive",
  "None",
]);
export const taxBracketSchema = z.enum([
  "zero_to_15",
  "fifteen_1_to_32",
  "thirtytwo_1_to_50",
  "fifty_1_plus",
]);
export const yesNoSchema = z.enum(["Yes", "No"]);
export const investmentTypeSchema = z.enum([
  "commodities_futures",
  "equities",
  "etf",
  "fixed_annuities",
  "fixed_insurance",
  "mutual_funds",
  "options",
  "precious_metals",
  "real_estate",
  "unit_investment_trusts",
  "variable_annuities",
  "leveraged_inverse_etfs",
  "complex_products",
  "alternative_investments",
  "other",
]);

// Address schema
const addressSchema = z.object({
  addressLine: z.string().trim().max(200).optional(),
  city: z.string().trim().max(100).optional(),
  stateProvince: z.string().trim().max(100).optional(),
  zipPostalCode: z.string().trim().max(20).optional(),
  country: z.string().trim().max(100).optional(),
}).optional();

// Government ID schema
const governmentIdSchema = z.object({
  type: z.string().trim().max(50).optional(),
  idNumber: z.string().trim().max(100).optional(),
  countryOfIssue: z.string().trim().max(100).optional(),
  dateOfIssue: z.string().datetime().optional(),
  dateOfExpiration: z.string().datetime().optional(),
}).optional();

// Investment Knowledge schema
const investmentKnowledgeSchema = z.array(z.object({
  investmentType: investmentTypeSchema,
  knowledgeLevel: investmentKnowledgeLevelSchema.optional(),
  sinceYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
})).optional();

// Range currency schema
const rangeCurrencySchema = z.object({
  from: z.number().optional(),
  to: z.number().optional(),
}).optional();

// Step 1 Schema - all fields optional for draft saves
export const step1Schema = z.object({
  accountRegistration: z.string().trim().max(200).optional(),
  rrName: z.string().trim().max(200).optional(),
  rrNo: z.string().trim().max(50).optional(),
  name: z.string().trim().max(120).optional(),
  personEntity: personEntitySchema.optional(),
  ssn: z.string().trim().max(20).optional(),
  ein: z.string().trim().max(20).optional(),
  holderParticipantRole: z.string().trim().max(100).optional(),
  email: z.string().email().max(255).optional(),
  dateOfBirth: z.string().datetime().optional(),
  positionHeld: z.string().trim().max(100).optional(),
  primaryCitizenship: z.string().trim().max(100).optional(),
  additionalCitizenship: z.string().trim().max(100).optional(),
  gender: genderSchema.optional(),
  maritalStatus: z.array(maritalStatusSchema).optional(),
  employmentStatus: z.array(employmentStatusSchema).optional(),
  occupation: z.string().trim().max(100).optional(),
  yearsEmployed: z.number().int().min(0).max(100).optional(),
  typeOfBusiness: z.string().trim().max(100).optional(),
  employerName: z.string().trim().max(200).optional(),
  legalAddress: addressSchema,
  mailingAddress: addressSchema,
  employerAddress: addressSchema,
  overallInvestmentKnowledge: investmentKnowledgeLevelSchema.optional(),
  investmentKnowledge: investmentKnowledgeSchema,
});

// Step 2 Schema - all fields optional for draft saves
export const step2Schema = z.object({
  investmentKnowledge: investmentKnowledgeSchema,
  annualIncome: rangeCurrencySchema,
  netWorth: rangeCurrencySchema,
  liquidNetWorth: rangeCurrencySchema,
  taxBracket: taxBracketSchema.optional(),
  governmentIds: z.array(governmentIdSchema).optional(),
  employeeOfThisBrokerDealer: yesNoSchema.optional(),
  relatedToEmployeeAtThisBrokerDealer: yesNoSchema.optional(),
  employeeName: z.string().trim().max(120).optional(),
  relationship: z.string().trim().max(100).optional(),
  employeeOfAnotherBrokerDealer: yesNoSchema.optional(),
  brokerDealerName: z.string().trim().max(120).optional(),
  relatedToEmployeeAtAnotherBrokerDealer: yesNoSchema.optional(),
  brokerDealerName2: z.string().trim().max(120).optional(),
  employeeName2: z.string().trim().max(120).optional(),
  relationship2: z.string().trim().max(100).optional(),
  maintainingOtherBrokerageAccounts: yesNoSchema.optional(),
  withWhatFirms: z.string().trim().max(200).optional(),
  yearsOfInvestmentExperience: z.number().int().min(0).max(100).optional(),
  affiliatedWithExchangeOrFinra: yesNoSchema.optional(),
  whatIsTheAffiliation: z.string().trim().max(200).optional(),
  seniorOfficerDirectorShareholder: yesNoSchema.optional(),
  companyNames: z.string().trim().max(500).optional(),
  signature: z.string().optional(),
  printedName: z.string().trim().max(120).optional(),
  signatureDate: z.string().datetime().optional(),
});

// Create Additional Holder Schema (for POST /)
export const createAdditionalHolderSchema = step1Schema;

// Update Additional Holder Schema (for PUT /:id)
export const updateAdditionalHolderSchema = z.object({
  step1: step1Schema.optional(),
  step2: step2Schema.optional(),
}).passthrough();

// Params schema
export const additionalHolderParamsSchema = z.object({
  id: z.string().uuid(),
});

// Query schema
export const additionalHolderQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
  search: z.string().optional(),
});

