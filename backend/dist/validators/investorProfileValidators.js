"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileParamsSchema = exports.profileQuerySchema = exports.submitProfileSchema = exports.updateProfileSchema = exports.createProfileSchema = exports.step7Schema = exports.signatureSchema = exports.signatureTypeSchema = exports.step6Schema = exports.step5Schema = exports.liquidityNeedSchema = exports.accountInvestmentObjectiveSchema = exports.riskExposureSchema = exports.step2Schema = exports.step1Schema = exports.tenancyClauseSchema = exports.trustTypeSchema = exports.additionalDesignationSchema = exports.accountTypeSchema = void 0;
const zod_1 = require("zod");
const accountHolderValidators_1 = require("./accountHolderValidators");
// Step 1: Account Registration Validators
exports.accountTypeSchema = zod_1.z.enum([
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
exports.additionalDesignationSchema = zod_1.z.enum([
    "c_corp",
    "s_corp",
    "ugma",
    "utma",
    "partnership",
]);
exports.trustTypeSchema = zod_1.z.enum([
    "charitable",
    "living",
    "irrevocable_living",
    "family",
    "revocable",
    "irrevocable",
    "testamentary",
]);
exports.tenancyClauseSchema = zod_1.z.enum([
    "community_property",
    "tenants_by_entirety",
    "community_property_with_rights",
    "joint_tenants_with_rights_of_survivorship",
    "tenants_in_common",
]);
exports.step1Schema = zod_1.z.object({
    rrName: zod_1.z.string().optional(),
    rrNo: zod_1.z.string().optional(),
    customerNames: zod_1.z.string().optional(),
    accountNo: zod_1.z.string().optional(),
    retirementAccount: zod_1.z.boolean().default(false),
    retailAccount: zod_1.z.boolean().default(false),
    accountTypes: zod_1.z.array(exports.accountTypeSchema).optional(),
    additionalDesignations: zod_1.z.array(exports.additionalDesignationSchema).optional(),
    otherAccountTypeText: zod_1.z.string().optional(),
    trustInformation: zod_1.z
        .object({
        establishmentDate: zod_1.z.string().datetime().optional(),
        trustTypes: zod_1.z.array(exports.trustTypeSchema).optional(),
    })
        .optional(),
    jointAccountInformation: zod_1.z
        .object({
        areAccountHoldersMarried: zod_1.z.enum(["Yes", "No"]).optional(),
        tenancyState: zod_1.z.string().optional(),
        numberOfTenants: zod_1.z.number().int().positive().optional(),
        tenancyClauses: zod_1.z.array(exports.tenancyClauseSchema).optional(),
    })
        .optional(),
    custodialAccountInformation: zod_1.z
        .object({
        stateGiftGiven1: zod_1.z.string().optional(),
        dateGiftGiven1: zod_1.z.string().datetime().optional(),
        stateGiftGiven2: zod_1.z.string().optional(),
        dateGiftGiven2: zod_1.z.string().datetime().optional(),
    })
        .optional(),
    transferOnDeathInformation: zod_1.z
        .object({
        individualAgreementDate: zod_1.z.string().datetime().optional(),
        jointAgreementDate: zod_1.z.string().datetime().optional(),
    })
        .optional(),
});
// Step 2: Patriot Act Information Validators
exports.step2Schema = zod_1.z.object({
    initialSourceOfFunds: zod_1.z.array(zod_1.z.string()).min(1, "At least one source of funds is required"),
    otherSourceOfFundsText: zod_1.z.string().optional(),
});
// Step 5: Investment Objectives Validators
exports.riskExposureSchema = zod_1.z.enum(["Low", "Moderate", "Speculation", "High Risk"]);
exports.accountInvestmentObjectiveSchema = zod_1.z.enum([
    "Income",
    "Long-Term Growth",
    "Short-Term Growth",
]);
exports.liquidityNeedSchema = zod_1.z.enum(["High", "Medium", "Low"]);
// investmentTypeSchema is exported from accountHolderValidators to avoid duplication
exports.step5Schema = zod_1.z.object({
    riskExposure: zod_1.z.array(exports.riskExposureSchema).optional(),
    accountInvestmentObjectives: zod_1.z.array(exports.accountInvestmentObjectiveSchema).optional(),
    seeAttachedStatement: zod_1.z.boolean().default(false),
    timeHorizonFrom: zod_1.z.string().optional(),
    timeHorizonTo: zod_1.z.string().optional(),
    liquidityNeeds: zod_1.z.array(exports.liquidityNeedSchema).optional(),
    investmentValues: zod_1.z
        .array(zod_1.z.object({
        investmentType: accountHolderValidators_1.investmentTypeSchema,
        value: zod_1.z.number().nonnegative(),
    }))
        .optional(),
});
// Step 6: Trusted Contact Validators
exports.step6Schema = zod_1.z.object({
    declineToProvide: zod_1.z.boolean().default(false),
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    homePhone: zod_1.z.string().optional(),
    businessPhone: zod_1.z.string().optional(),
    mobilePhone: zod_1.z.string().optional(),
    mailingAddress: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    stateProvince: zod_1.z.string().optional(),
    zipPostalCode: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
});
// Step 7: Signatures Validators
exports.signatureTypeSchema = zod_1.z.enum([
    "account_owner",
    "joint_account_owner",
    "financial_professional",
    "supervisor_principal",
]);
exports.signatureSchema = zod_1.z.object({
    signatureType: exports.signatureTypeSchema,
    signatureData: zod_1.z.string().min(1, "Signature data is required"),
    printedName: zod_1.z.string().min(1, "Printed name is required"),
    signatureDate: zod_1.z.string().datetime(),
});
exports.step7Schema = zod_1.z.object({
    signatures: zod_1.z.array(exports.signatureSchema).min(1, "At least one signature is required"),
});
// Complete Profile Schema
exports.createProfileSchema = exports.step1Schema.extend({
    userId: zod_1.z.string().uuid().optional(),
});
exports.updateProfileSchema = zod_1.z.object({
    step1: exports.step1Schema.optional(),
    step2: exports.step2Schema.optional(),
    step3: zod_1.z.any().optional(), // Will be defined in accountHolderValidators
    step4: zod_1.z.any().optional(), // Will be defined in accountHolderValidators
    step5: exports.step5Schema.optional(),
    step6: exports.step6Schema.optional(),
    step7: exports.step7Schema.optional(),
});
exports.submitProfileSchema = zod_1.z.object({
    profileId: zod_1.z.string().uuid(),
});
exports.profileQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    status: zod_1.z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
    userId: zod_1.z.string().uuid().optional(),
    search: zod_1.z.string().optional(),
});
exports.profileParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
