import { z } from "zod";

// Common schemas

export const personEntitySchema = z.enum(["Person", "Entity"]);

export const yesNoSchema = z.enum(["Yes", "No"]);

export const genderSchema = z.enum(["Male", "Female"]);

export const maritalStatusSchema = z.enum([
  "Single",
  "Married",
  "Divorced",
  "Domestic Partner",
  "Widow",
  "Widowed",
]);

export const employmentAffiliationSchema = z.enum([
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

export const taxBracketSchema = z.enum([
  "0 - 15%",
  "15.1% - 32%",
  "32.1% - 50%",
  "50.1% +",
]);

export const addressTypeSchema = z.enum(["legal", "mailing", "employer"]);

export const phoneTypeSchema = z.enum(["home", "business", "mobile"]);

// Address schema
export const addressSchema = z.object({
  addressType: addressTypeSchema,
  address: z.string().optional(),
  city: z.string().optional(),
  stateProvince: z.string().optional(),
  zipPostalCode: z.string().optional(),
  country: z.string().optional(),
  mailingSameAsLegal: z.boolean().optional(),
});

// Phone schema
export const phoneSchema = z.object({
  phoneType: phoneTypeSchema,
  phoneNumber: z.string().optional(),
});

// Investment Knowledge schema
export const investmentKnowledgeSchema = z.object({
  investmentType: investmentTypeSchema,
  knowledgeLevel: investmentKnowledgeLevelSchema,
  sinceYear: z.string().optional(),
  otherInvestmentLabel: z.string().optional(),
});

// Government ID schema
export const governmentIdSchema = z.object({
  idNumber: z.number().int().min(1).max(2),
  idType: z.string().optional(),
  idNumberValue: z.string().optional(),
  countryOfIssue: z.string().optional(),
  dateOfIssue: z.string().datetime().optional(),
  dateOfExpiration: z.string().datetime().optional(),
});

// Financial Information schema
export const financialInformationSchema = z.object({
  annualIncomeFrom: z.number().nonnegative().optional(),
  annualIncomeTo: z.number().nonnegative().optional(),
  netWorthFrom: z.number().nonnegative().optional(),
  netWorthTo: z.number().nonnegative().optional(),
  liquidNetWorthFrom: z.number().nonnegative().optional(),
  liquidNetWorthTo: z.number().nonnegative().optional(),
  taxBracket: taxBracketSchema.optional(),
});

// Employment schema
export const employmentSchema = z.object({
  occupation: z.string().optional(),
  yearsEmployed: z.number().int().nonnegative().optional(),
  typeOfBusiness: z.string().optional(),
  employerName: z.string().optional(),
  employerAddress: addressSchema.optional(),
});

// Advisory Firm Information schema
export const advisoryFirmInformationSchema = z.object({
  employeeOfAdvisoryFirm: yesNoSchema.optional(),
  relatedToEmployeeAdvisory: yesNoSchema.optional(),
  employeeNameAndRelationship: z.string().optional(),
});

// Broker Dealer Information schema
export const brokerDealerInformationSchema = z.object({
  employeeOfBrokerDealer: yesNoSchema.optional(),
  brokerDealerName: z.string().optional(),
  relatedToEmployeeBrokerDealer: yesNoSchema.optional(),
  brokerDealerEmployeeName: z.string().optional(),
  brokerDealerEmployeeRelationship: z.string().optional(),
});

// Other Brokerage Accounts schema
export const otherBrokerageAccountsSchema = z.object({
  maintainingOtherAccounts: yesNoSchema.optional(),
  withWhatFirms: z.string().optional(),
  yearsOfInvestmentExperience: z.number().int().nonnegative().optional(),
});

// Exchange/FINRA Affiliation schema
export const exchangeFinraAffiliationSchema = z.object({
  affiliatedWithExchangeOrFinra: yesNoSchema.optional(),
  affiliationDetails: z.string().optional(),
});

// Public Company Information schema
export const publicCompanyInformationSchema = z.object({
  seniorOfficerOr10PctShareholder: yesNoSchema.optional(),
  companyNames: z.string().optional(),
});

// Complete Account Holder schema (Step 3 or Step 4)
export const accountHolderSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  personEntity: personEntitySchema.optional(),
  ssn: z.string().optional(),
  ein: z.string().optional(),
  yesNoBox: yesNoSchema.optional(),
  dateOfBirth: z.string().datetime().optional(),
  specifiedAdult: yesNoSchema.optional(),
  primaryCitizenship: z.string().optional(),
  additionalCitizenship: z.string().optional(),
  gender: genderSchema.optional(),
  generalInvestmentKnowledge: investmentKnowledgeLevelSchema.optional(),
  addresses: z.array(addressSchema).optional(),
  phones: z.array(phoneSchema).optional(),
  maritalStatuses: z.array(maritalStatusSchema).optional(),
  employmentAffiliations: z.array(employmentAffiliationSchema).optional(),
  employment: employmentSchema.optional(),
  investmentKnowledge: z.array(investmentKnowledgeSchema).optional(),
  financialInformation: financialInformationSchema.optional(),
  governmentIdentifications: z.array(governmentIdSchema).optional(),
  advisoryFirmInformation: advisoryFirmInformationSchema.optional(),
  brokerDealerInformation: brokerDealerInformationSchema.optional(),
  otherBrokerageAccounts: otherBrokerageAccountsSchema.optional(),
  exchangeFinraAffiliation: exchangeFinraAffiliationSchema.optional(),
  publicCompanyInformation: publicCompanyInformationSchema.optional(),
});

// Account Holder update schemas
export const updateAccountHolderSchema = accountHolderSchema.partial();

export const updateAddressesSchema = z.object({
  addresses: z.array(addressSchema),
});

export const updatePhonesSchema = z.object({
  phones: z.array(phoneSchema),
});

export const updateInvestmentKnowledgeSchema = z.object({
  investmentKnowledge: z.array(investmentKnowledgeSchema),
});

export const updateFinancialInfoSchema = financialInformationSchema;

// Account Holder params
export const accountHolderParamsSchema = z.object({
  profileId: z.string().uuid(),
  holderId: z.string().uuid().optional(),
});

