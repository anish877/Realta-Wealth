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
  "fixed_income",
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
  maritalStatus: z.array(maritalStatusSchema).max(1).optional(),
  employmentStatus: z.array(employmentStatusSchema).max(1).optional(),
  occupation: z.string().trim().max(100).optional(),
  yearsEmployed: z.number().int().min(0).max(100).optional(),
  typeOfBusiness: z.string().trim().max(100).optional(),
  employerName: z.string().trim().max(200).optional(),
  legalAddress: addressSchema,
  mailingAddress: addressSchema,
  employerAddress: addressSchema,
  overallInvestmentKnowledge: investmentKnowledgeLevelSchema.optional(),
  investmentKnowledge: investmentKnowledgeSchema,
}).superRefine((data, ctx) => {
  // Enforce single-choice fields (already limited via max) for safety
  if (data.maritalStatus && data.maritalStatus.length > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select only one marital status",
      path: ["maritalStatus"],
    });
  }

  if (data.employmentStatus && data.employmentStatus.length > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select only one employment status",
      path: ["employmentStatus"],
    });
  }

  // SSN required when Person
  if (data.personEntity === "Person" && !data.ssn) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "SSN is required when Person is selected",
      path: ["ssn"],
    });
  }

  // EIN required when Entity
  if (data.personEntity === "Entity" && !data.ein) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "EIN is required when Entity is selected",
      path: ["ein"],
    });
  }

  // Employment follow-ups required when employed/self-employed
  if (
    data.employmentStatus &&
    (data.employmentStatus.includes("Employed") || data.employmentStatus.includes("SelfEmployed"))
  ) {
    if (!data.occupation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Occupation is required when employed",
        path: ["occupation"],
      });
    }
    if (!data.employerName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employer Name is required when employed",
        path: ["employerName"],
      });
    }
  }
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
}).superRefine((data, ctx) => {
  // Government ID completeness when any field is provided
  if (data.governmentIds) {
    data.governmentIds.forEach((govId, index) => {
      const hasAny =
        govId?.type ||
        govId?.idNumber ||
        govId?.countryOfIssue ||
        govId?.dateOfIssue ||
        govId?.dateOfExpiration;
      if (hasAny) {
        const requiredFields: Array<keyof NonNullable<typeof govId>> = [
          "type",
          "idNumber",
          "countryOfIssue",
          "dateOfIssue",
          "dateOfExpiration",
        ];
        requiredFields.forEach((field) => {
          if (!govId?.[field]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "All government ID fields must be completed together",
              path: ["governmentIds", index, field],
            });
          }
        });
        if (govId?.dateOfIssue && govId?.dateOfExpiration) {
          const issue = new Date(govId.dateOfIssue);
          const exp = new Date(govId.dateOfExpiration);
          if (exp <= issue) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Expiration date must be after issue date",
              path: ["governmentIds", index, "dateOfExpiration"],
            });
          }
        }
      }
    });
  }

  // Follow-up requirements for yes/no questions
  if (data.relatedToEmployeeAtThisBrokerDealer === "Yes") {
    if (!data.employeeName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employee Name is required",
        path: ["employeeName"],
      });
    }
    if (!data.relationship) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Relationship is required",
        path: ["relationship"],
      });
    }
  }

  if (data.employeeOfAnotherBrokerDealer === "Yes" && !data.brokerDealerName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Broker Dealer Name is required",
      path: ["brokerDealerName"],
    });
  }

  if (data.relatedToEmployeeAtAnotherBrokerDealer === "Yes") {
    if (!data.brokerDealerName2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Broker Dealer Name is required",
        path: ["brokerDealerName2"],
      });
    }
    if (!data.employeeName2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employee Name is required",
        path: ["employeeName2"],
      });
    }
    if (!data.relationship2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Relationship is required",
        path: ["relationship2"],
      });
    }
  }

  if (data.maintainingOtherBrokerageAccounts === "Yes") {
    if (!data.withWhatFirms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Firm name(s) are required",
        path: ["withWhatFirms"],
      });
    }
    if (!data.yearsOfInvestmentExperience && data.yearsOfInvestmentExperience !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Years of Investment Experience is required",
        path: ["yearsOfInvestmentExperience"],
      });
    }
  }

  if (data.affiliatedWithExchangeOrFinra === "Yes" && !data.whatIsTheAffiliation) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Affiliation details are required",
      path: ["whatIsTheAffiliation"],
    });
  }

  if (data.seniorOfficerDirectorShareholder === "Yes" && !data.companyNames) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Company Name(s) are required",
      path: ["companyNames"],
    });
  }
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

