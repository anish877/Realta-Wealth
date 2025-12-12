"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountHolderParamsSchema = exports.updateFinancialInfoSchema = exports.updateInvestmentKnowledgeSchema = exports.updatePhonesSchema = exports.updateAddressesSchema = exports.updateAccountHolderSchema = exports.accountHolderSchema = exports.publicCompanyInformationSchema = exports.exchangeFinraAffiliationSchema = exports.otherBrokerageAccountsSchema = exports.brokerDealerInformationSchema = exports.advisoryFirmInformationSchema = exports.employmentSchema = exports.financialInformationSchema = exports.governmentIdSchema = exports.investmentKnowledgeSchema = exports.phoneSchema = exports.addressSchema = exports.phoneTypeSchema = exports.addressTypeSchema = exports.taxBracketSchema = exports.investmentTypeSchema = exports.investmentKnowledgeLevelSchema = exports.employmentAffiliationSchema = exports.maritalStatusSchema = exports.genderSchema = exports.yesNoSchema = exports.personEntitySchema = void 0;
const zod_1 = require("zod");
// Common schemas
exports.personEntitySchema = zod_1.z.enum(["Person", "Entity"]);
exports.yesNoSchema = zod_1.z.enum(["Yes", "No"]);
exports.genderSchema = zod_1.z.enum(["Male", "Female"]);
exports.maritalStatusSchema = zod_1.z.enum([
    "Single",
    "Married",
    "Divorced",
    "Domestic Partner",
    "Widow",
    "Widowed",
]);
exports.employmentAffiliationSchema = zod_1.z.enum([
    "Employed",
    "SelfEmployed",
    "Retired",
    "Unemployed",
    "Student",
    "Homemaker",
]);
exports.investmentKnowledgeLevelSchema = zod_1.z.enum([
    "Limited",
    "Moderate",
    "Extensive",
    "None",
]);
exports.investmentTypeSchema = zod_1.z.enum([
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
exports.taxBracketSchema = zod_1.z.enum([
    "0 - 15%",
    "15.1% - 32%",
    "32.1% - 50%",
    "50.1% +",
]);
exports.addressTypeSchema = zod_1.z.enum(["legal", "mailing", "employer"]);
exports.phoneTypeSchema = zod_1.z.enum(["home", "business", "mobile"]);
// Address schema
exports.addressSchema = zod_1.z.object({
    addressType: exports.addressTypeSchema,
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    stateProvince: zod_1.z.string().optional(),
    zipPostalCode: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    mailingSameAsLegal: zod_1.z.boolean().optional(),
});
// Phone schema
exports.phoneSchema = zod_1.z.object({
    phoneType: exports.phoneTypeSchema,
    phoneNumber: zod_1.z.string().optional(),
});
// Investment Knowledge schema
exports.investmentKnowledgeSchema = zod_1.z.object({
    investmentType: exports.investmentTypeSchema,
    knowledgeLevel: exports.investmentKnowledgeLevelSchema,
    sinceYear: zod_1.z.string().optional(),
    otherInvestmentLabel: zod_1.z.string().optional(),
});
// Government ID schema
exports.governmentIdSchema = zod_1.z.object({
    idNumber: zod_1.z.number().int().min(1).max(2),
    idType: zod_1.z.string().optional(),
    idNumberValue: zod_1.z.string().optional(),
    countryOfIssue: zod_1.z.string().optional(),
    dateOfIssue: zod_1.z.string().datetime().optional(),
    dateOfExpiration: zod_1.z.string().datetime().optional(),
});
// Financial Information schema
exports.financialInformationSchema = zod_1.z.object({
    annualIncomeFrom: zod_1.z.number().nonnegative().optional(),
    annualIncomeTo: zod_1.z.number().nonnegative().optional(),
    netWorthFrom: zod_1.z.number().nonnegative().optional(),
    netWorthTo: zod_1.z.number().nonnegative().optional(),
    liquidNetWorthFrom: zod_1.z.number().nonnegative().optional(),
    liquidNetWorthTo: zod_1.z.number().nonnegative().optional(),
    taxBracket: exports.taxBracketSchema.optional(),
});
// Employment schema
exports.employmentSchema = zod_1.z.object({
    occupation: zod_1.z.string().optional(),
    yearsEmployed: zod_1.z.number().int().nonnegative().optional(),
    typeOfBusiness: zod_1.z.string().optional(),
    employerName: zod_1.z.string().optional(),
    employerAddress: exports.addressSchema.optional(),
});
// Advisory Firm Information schema
exports.advisoryFirmInformationSchema = zod_1.z.object({
    employeeOfAdvisoryFirm: exports.yesNoSchema.optional(),
    relatedToEmployeeAdvisory: exports.yesNoSchema.optional(),
    employeeNameAndRelationship: zod_1.z.string().optional(),
});
// Broker Dealer Information schema
exports.brokerDealerInformationSchema = zod_1.z.object({
    employeeOfBrokerDealer: exports.yesNoSchema.optional(),
    brokerDealerName: zod_1.z.string().optional(),
    relatedToEmployeeBrokerDealer: exports.yesNoSchema.optional(),
    brokerDealerEmployeeName: zod_1.z.string().optional(),
    brokerDealerEmployeeRelationship: zod_1.z.string().optional(),
});
// Other Brokerage Accounts schema
exports.otherBrokerageAccountsSchema = zod_1.z.object({
    maintainingOtherAccounts: exports.yesNoSchema.optional(),
    withWhatFirms: zod_1.z.string().optional(),
    yearsOfInvestmentExperience: zod_1.z.number().int().nonnegative().optional(),
});
// Exchange/FINRA Affiliation schema
exports.exchangeFinraAffiliationSchema = zod_1.z.object({
    affiliatedWithExchangeOrFinra: exports.yesNoSchema.optional(),
    affiliationDetails: zod_1.z.string().optional(),
});
// Public Company Information schema
exports.publicCompanyInformationSchema = zod_1.z.object({
    seniorOfficerOr10PctShareholder: exports.yesNoSchema.optional(),
    companyNames: zod_1.z.string().optional(),
});
// Complete Account Holder schema (Step 3 or Step 4)
exports.accountHolderSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    personEntity: exports.personEntitySchema.optional(),
    ssn: zod_1.z.string().optional(),
    ein: zod_1.z.string().optional(),
    yesNoBox: exports.yesNoSchema.optional(),
    dateOfBirth: zod_1.z.string().datetime().optional(),
    specifiedAdult: exports.yesNoSchema.optional(),
    primaryCitizenship: zod_1.z.string().optional(),
    additionalCitizenship: zod_1.z.string().optional(),
    gender: exports.genderSchema.optional(),
    generalInvestmentKnowledge: exports.investmentKnowledgeLevelSchema.optional(),
    addresses: zod_1.z.array(exports.addressSchema).optional(),
    phones: zod_1.z.array(exports.phoneSchema).optional(),
    maritalStatuses: zod_1.z.array(exports.maritalStatusSchema).optional(),
    employmentAffiliations: zod_1.z.array(exports.employmentAffiliationSchema).optional(),
    employment: exports.employmentSchema.optional(),
    investmentKnowledge: zod_1.z.array(exports.investmentKnowledgeSchema).optional(),
    financialInformation: exports.financialInformationSchema.optional(),
    governmentIdentifications: zod_1.z.array(exports.governmentIdSchema).optional(),
    advisoryFirmInformation: exports.advisoryFirmInformationSchema.optional(),
    brokerDealerInformation: exports.brokerDealerInformationSchema.optional(),
    otherBrokerageAccounts: exports.otherBrokerageAccountsSchema.optional(),
    exchangeFinraAffiliation: exports.exchangeFinraAffiliationSchema.optional(),
    publicCompanyInformation: exports.publicCompanyInformationSchema.optional(),
});
// Account Holder update schemas
exports.updateAccountHolderSchema = exports.accountHolderSchema.partial();
exports.updateAddressesSchema = zod_1.z.object({
    addresses: zod_1.z.array(exports.addressSchema),
});
exports.updatePhonesSchema = zod_1.z.object({
    phones: zod_1.z.array(exports.phoneSchema),
});
exports.updateInvestmentKnowledgeSchema = zod_1.z.object({
    investmentKnowledge: zod_1.z.array(exports.investmentKnowledgeSchema),
});
exports.updateFinancialInfoSchema = exports.financialInformationSchema;
// Account Holder params
exports.accountHolderParamsSchema = zod_1.z.object({
    profileId: zod_1.z.string().uuid(),
    holderId: zod_1.z.string().uuid().optional(),
});
