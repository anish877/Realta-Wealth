import { z } from "zod";
import {
  ssnFieldSchema,
  einFieldSchema,
  emailFieldSchema,
  phoneFieldSchema,
  dateFieldSchema,
  currencyFieldSchema,
  zipCodeFieldSchema,
  stateFieldSchema,
  accountNumberFieldSchema,
  yearFieldSchema,
  textFieldSchema,
  requiredTextFieldSchema,
  numberFieldSchema,
  booleanFieldSchema,
  arrayFieldSchema,
  requiredArrayFieldSchema,
  enumFieldSchema,
} from "./formFieldValidators";

/**
 * Frontend form validation schemas for Investor Profile
 * These match backend validators but use frontend form field names (snake_case)
 */

// ============================================
// STEP 1: Account Registration
// ============================================

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

export const step1Schema = z
  .object({
    rr_name: textFieldSchema.optional(),
    rr_no: textFieldSchema.optional(),
    customer_names: textFieldSchema.optional(),
    account_no: accountNumberFieldSchema.optional(),
    retirement_checkbox: booleanFieldSchema,
    retail_checkbox: booleanFieldSchema,
    type_of_account: arrayFieldSchema(accountTypeSchema).optional(),
    additional_designation_left: arrayFieldSchema(additionalDesignationSchema).optional(),
    other_account_type_text: textFieldSchema.optional(),
    trust_checkbox: booleanFieldSchema.optional(),
    trust_establishment_date: dateFieldSchema().optional(),
    trust_type: arrayFieldSchema(trustTypeSchema).optional(),
    are_account_holders_married: enumFieldSchema(["Yes", "No"] as const).optional(),
    tenancy_state: textFieldSchema.optional(),
    number_of_tenants: numberFieldSchema.optional(),
    tenancy_clause: arrayFieldSchema(tenancyClauseSchema).optional(),
    state_in_which_gift_was_given_1: textFieldSchema.optional(),
    date_gift_was_given_1: dateFieldSchema().optional(),
    state_in_which_gift_was_given_2: textFieldSchema.optional(),
    date_gift_was_given_2: dateFieldSchema().optional(),
    transfer_on_death_individual_agreement_date: dateFieldSchema().optional(),
    transfer_on_death_joint_agreement_date: dateFieldSchema().optional(),
  })
  .superRefine((data, ctx) => {
    // RR Name and Customer Names required unless Retirement is checked
    if (!data.retirement_checkbox) {
      if (!data.rr_name || data.rr_name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "RR Name is required (unless Retirement account is selected)",
          path: ["rr_name"],
        });
      }
      if (!data.customer_names || data.customer_names.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Customer Name(s) is required (unless Retirement account is selected)",
          path: ["customer_names"],
        });
      }
    }

    // Other account type text required if "other" is selected
    if (data.type_of_account?.includes("other") && (!data.other_account_type_text || data.other_account_type_text.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the other account type",
        path: ["other_account_type_text"],
      });
    }

    // Trust information required if trust checkbox is checked
    if (data.trust_checkbox) {
      if (!data.trust_type || data.trust_type.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Trust type is required when Trust is selected",
          path: ["trust_type"],
        });
      }
    }

    // Joint account information required if joint account type is selected
    if (
      data.type_of_account?.some((type) => type === "joint_tenant" || type === "transfer_on_death_joint")
    ) {
      if (!data.are_account_holders_married) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Marital status is required for joint accounts",
          path: ["are_account_holders_married"],
        });
      }
    }
  });

// ============================================
// STEP 2: Patriot Act Information
// ============================================

export const step2Schema = z
  .object({
    initial_source_of_funds: arrayFieldSchema(z.string()).optional(),
    initial_source_of_funds_other_text: textFieldSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // At least one source of funds is required
    if (!data.initial_source_of_funds || data.initial_source_of_funds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one source of funds is required",
        path: ["initial_source_of_funds"],
      });
    }

    // Other text required if "Other" is selected
    if (data.initial_source_of_funds?.includes("Other")) {
      if (!data.initial_source_of_funds_other_text || data.initial_source_of_funds_other_text.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please specify the other source of funds",
          path: ["initial_source_of_funds_other_text"],
        });
      }
    }
  });

// ============================================
// STEP 3 & 4: Account Holder Information
// ============================================

export const personEntitySchema = z.enum(["Person", "Entity"]);

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

export const yesNoSchema = z.enum(["Yes", "No"]);

// Base account holder schema (used for both primary and secondary)
const baseAccountHolderSchema = z
  .object({
    // Basic info
    name: textFieldSchema.optional(),
    person_entity: personEntitySchema.optional(),
    ssn: ssnFieldSchema.optional(),
    ein: einFieldSchema.optional(),
    yes_no_box: yesNoSchema.optional(),
    email: emailFieldSchema.optional(),
    dob: dateFieldSchema({ notFuture: true, minAge: 18, maxAge: 120 }).optional(),
    specified_adult: yesNoSchema.optional(),

    // Contact info
    home_phone: phoneFieldSchema.optional(),
    business_phone: phoneFieldSchema.optional(),
    mobile_phone: phoneFieldSchema.optional(),

    // Addresses
    legal_address: textFieldSchema.optional(),
    city: textFieldSchema.optional(),
    state_province: stateFieldSchema.optional(),
    zip_postal_code: zipCodeFieldSchema.optional(),
    country: textFieldSchema.optional(),
    mailing_same_as_legal: booleanFieldSchema.optional(),
    mailing_address: textFieldSchema.optional(),
    mailing_city: textFieldSchema.optional(),
    mailing_state_province: stateFieldSchema.optional(),
    mailing_zip_postal_code: zipCodeFieldSchema.optional(),
    mailing_country: textFieldSchema.optional(),

    // Additional info
    citizenship_primary: textFieldSchema.optional(),
    citizenship_additional: textFieldSchema.optional(),
    gender: genderSchema.optional(),
    marital_status: arrayFieldSchema(maritalStatusSchema).optional(),
    employment_affiliations: arrayFieldSchema(employmentAffiliationSchema).optional(),
    occupation: textFieldSchema.optional(),
    years_employed: numberFieldSchema.optional(),
    type_of_business: textFieldSchema.optional(),
    employer_name: textFieldSchema.optional(),
    employer_address: textFieldSchema.optional(),
    employer_city: textFieldSchema.optional(),
    employer_state_province: stateFieldSchema.optional(),
    employer_zip_postal_code: zipCodeFieldSchema.optional(),
    employer_country: textFieldSchema.optional(),

    // Investment knowledge
    general_investment_knowledge: investmentKnowledgeLevelSchema.optional(),

    // Financial information
    annual_income_from: currencyFieldSchema().optional(),
    annual_income_to: currencyFieldSchema().optional(),
    net_worth_from: currencyFieldSchema().optional(),
    net_worth_to: currencyFieldSchema().optional(),
    liquid_net_worth_from: currencyFieldSchema().optional(),
    liquid_net_worth_to: currencyFieldSchema().optional(),
    tax_bracket: taxBracketSchema.optional(),

    // Government ID
    gov_id_type: textFieldSchema.optional(),
    gov_id_number: textFieldSchema.optional(),
    gov_id_country_of_issue: textFieldSchema.optional(),
    gov_id_date_of_issue: dateFieldSchema().optional(),
    gov_id_date_of_expiration: dateFieldSchema().optional(),

    // Affiliations
    employee_of_advisory_firm: yesNoSchema.optional(),
    related_to_employee_advisory: yesNoSchema.optional(),
    employee_name_and_relationship: textFieldSchema.optional(),
    employee_of_broker_dealer: yesNoSchema.optional(),
    broker_dealer_name: textFieldSchema.optional(),
    related_to_employee_broker_dealer: yesNoSchema.optional(),
    broker_dealer_employee_name: textFieldSchema.optional(),
    broker_dealer_employee_relationship: textFieldSchema.optional(),
    maintaining_other_brokerage_accounts: yesNoSchema.optional(),
    with_what_firms: textFieldSchema.optional(),
    years_of_investment_experience: numberFieldSchema.optional(),
    affiliated_with_exchange_or_finra: yesNoSchema.optional(),
    affiliation_employer_authorization_required: textFieldSchema.optional(),
    senior_officer_or_10pct_shareholder: yesNoSchema.optional(),
    company_names: textFieldSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // Name is required
    if (!data.name || data.name.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name is required",
        path: ["name"],
      });
    }

    // Person/Entity is required
    if (!data.person_entity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Person/Entity selection is required",
        path: ["person_entity"],
      });
    }

    // SSN required if Person
    if (data.person_entity === "Person") {
      if (!data.ssn || data.ssn.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "SSN is required for Person",
          path: ["ssn"],
        });
      }
    }

    // EIN required if Entity
    if (data.person_entity === "Entity") {
      if (!data.ein || data.ein.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "EIN is required for Entity",
          path: ["ein"],
        });
      }
    }

    // Email format validation if provided
    if (data.email && data.email.trim() !== "") {
      const emailResult = emailFieldSchema.safeParse(data.email);
      if (!emailResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid email address",
          path: ["email"],
        });
      }
    }

    // Mailing address required if "same as legal" is false
    if (data.mailing_same_as_legal === false) {
      if (!data.mailing_address || data.mailing_address.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mailing address is required when different from legal address",
          path: ["mailing_address"],
        });
      }
    }

    // Financial range validation: "To" must be >= "From"
    if (data.annual_income_from !== undefined && data.annual_income_to !== undefined) {
      const fromValue = data.annual_income_from;
      const toValue = data.annual_income_to;
      const from = typeof fromValue === "string" 
        ? parseFloat(fromValue.replace(/[$,\s]/g, "")) 
        : (typeof fromValue === "number" ? fromValue : 0);
      const to = typeof toValue === "string"
        ? parseFloat(toValue.replace(/[$,\s]/g, ""))
        : (typeof toValue === "number" ? toValue : 0);
      if (to < from) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End amount must be greater than or equal to start amount",
          path: ["annual_income_to"],
        });
      }
    }

    if (data.net_worth_from !== undefined && data.net_worth_to !== undefined) {
      const fromValue = data.net_worth_from;
      const toValue = data.net_worth_to;
      const from = typeof fromValue === "string"
        ? parseFloat(fromValue.replace(/[$,\s]/g, ""))
        : (typeof fromValue === "number" ? fromValue : 0);
      const to = typeof toValue === "string"
        ? parseFloat(toValue.replace(/[$,\s]/g, ""))
        : (typeof toValue === "number" ? toValue : 0);
      if (to < from) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End amount must be greater than or equal to start amount",
          path: ["net_worth_to"],
        });
      }
    }

    if (data.liquid_net_worth_from !== undefined && data.liquid_net_worth_to !== undefined) {
      const fromValue = data.liquid_net_worth_from;
      const toValue = data.liquid_net_worth_to;
      const from = typeof fromValue === "string"
        ? parseFloat(fromValue.replace(/[$,\s]/g, ""))
        : (typeof fromValue === "number" ? fromValue : 0);
      const to = typeof toValue === "string"
        ? parseFloat(toValue.replace(/[$,\s]/g, ""))
        : (typeof toValue === "number" ? toValue : 0);
      if (to < from) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End amount must be greater than or equal to start amount",
          path: ["liquid_net_worth_to"],
        });
      }
    }
  });

// Step 3: Primary Account Holder (prefix fields with "primary_")
export const step3Schema = baseAccountHolderSchema;

// Step 4: Secondary Account Holder (prefix fields with "secondary_")
// Only validate if joint account is selected
export const step4Schema = baseAccountHolderSchema;

// ============================================
// STEP 5: Investment Objectives
// ============================================

export const riskExposureSchema = z.enum(["Low", "Moderate", "Speculation", "High Risk"]);

export const accountInvestmentObjectiveSchema = z.enum([
  "Income",
  "Long-Term Growth",
  "Short-Term Growth",
]);

export const liquidityNeedSchema = z.enum(["High", "Medium", "Low"]);

export const step5Schema = z.object({
  risk_exposure: arrayFieldSchema(riskExposureSchema).optional(),
  account_investment_objectives: arrayFieldSchema(accountInvestmentObjectiveSchema).optional(),
  other_investments_see_attached: booleanFieldSchema,
  investment_time_horizon_liquidity: z
    .object({
      from: dateFieldSchema().optional(),
      to: dateFieldSchema().optional(),
    })
    .optional(),
  liquidity_needs: arrayFieldSchema(liquidityNeedSchema).optional(),
  other_investments_table: z.record(z.any()).optional(),
});

// ============================================
// STEP 6: Trusted Contact
// ============================================

export const step6Schema = z
  .object({
    trusted_contact_decline_to_provide: booleanFieldSchema,
    trusted_contact_name: textFieldSchema.optional(),
    trusted_contact_email: emailFieldSchema.optional(),
    trusted_contact_home_phone: phoneFieldSchema.optional(),
    trusted_contact_business_phone: phoneFieldSchema.optional(),
    trusted_contact_mobile_phone: phoneFieldSchema.optional(),
    trusted_contact_mailing_address: textFieldSchema.optional(),
    trusted_contact_city: textFieldSchema.optional(),
    trusted_contact_state_province: stateFieldSchema.optional(),
    trusted_contact_zip_postal_code: zipCodeFieldSchema.optional(),
    trusted_contact_country: textFieldSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // If not declined, name and email are required
    if (!data.trusted_contact_decline_to_provide) {
      if (!data.trusted_contact_name || data.trusted_contact_name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Trusted contact name is required",
          path: ["trusted_contact_name"],
        });
      }
      if (!data.trusted_contact_email || data.trusted_contact_email.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Trusted contact email is required",
          path: ["trusted_contact_email"],
        });
      }
    }
  });

// ============================================
// STEP 7: Signatures
// ============================================

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

export const step7Schema = z
  .object({
    account_owner_signature: textFieldSchema.optional(),
    account_owner_printed_name: textFieldSchema.optional(),
    account_owner_date: dateFieldSchema().optional(),
    joint_account_owner_signature: textFieldSchema.optional(),
    joint_account_owner_printed_name: textFieldSchema.optional(),
    joint_account_owner_date: dateFieldSchema().optional(),
    financial_professional_signature: textFieldSchema.optional(),
    financial_professional_printed_name: textFieldSchema.optional(),
    financial_professional_date: dateFieldSchema().optional(),
    supervisor_principal_signature: textFieldSchema.optional(),
    supervisor_principal_printed_name: textFieldSchema.optional(),
    supervisor_principal_date: dateFieldSchema().optional(),
  })
  .superRefine((data, ctx) => {
    // At least one signature is required
    const hasAccountOwnerSignature =
      data.account_owner_signature && data.account_owner_printed_name && data.account_owner_date;
    const hasJointSignature =
      data.joint_account_owner_signature &&
      data.joint_account_owner_printed_name &&
      data.joint_account_owner_date;
    const hasFinancialProfessionalSignature =
      data.financial_professional_signature &&
      data.financial_professional_printed_name &&
      data.financial_professional_date;
    const hasSupervisorSignature =
      data.supervisor_principal_signature &&
      data.supervisor_principal_printed_name &&
      data.supervisor_principal_date;

    if (!hasAccountOwnerSignature && !hasJointSignature && !hasFinancialProfessionalSignature && !hasSupervisorSignature) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one signature is required",
        path: ["account_owner_signature"],
      });
    }

    // Validate individual signatures if they have any part filled
    if (data.account_owner_signature || data.account_owner_printed_name || data.account_owner_date) {
      if (!data.account_owner_signature || data.account_owner_signature.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Account owner signature is required",
          path: ["account_owner_signature"],
        });
      }
      if (!data.account_owner_printed_name || data.account_owner_printed_name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Account owner printed name is required",
          path: ["account_owner_printed_name"],
        });
      }
      if (!data.account_owner_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Account owner signature date is required",
          path: ["account_owner_date"],
        });
      }
    }
  });

// ============================================
// Complete Form Schema
// ============================================

// Note: We don't merge schemas here because they use superRefine (ZodEffects)
// Each step is validated separately using validateStep function

// Helper function to validate a specific step
export function validateStep(stepNumber: number, formData: Record<string, any>): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  try {
    let schema: z.ZodSchema;
    let dataToValidate: any;

    switch (stepNumber) {
      case 1:
        schema = step1Schema;
        dataToValidate = formData;
        break;
      case 2:
        schema = step2Schema;
        dataToValidate = formData;
        break;
      case 3:
        // Extract primary fields
        dataToValidate = Object.keys(formData)
          .filter((key) => key.startsWith("primary_"))
          .reduce((acc, key) => {
            acc[key.replace("primary_", "")] = formData[key];
            return acc;
          }, {} as Record<string, any>);
        schema = step3Schema;
        break;
      case 4:
        // Extract secondary fields
        dataToValidate = Object.keys(formData)
          .filter((key) => key.startsWith("secondary_"))
          .reduce((acc, key) => {
            acc[key.replace("secondary_", "")] = formData[key];
            return acc;
          }, {} as Record<string, any>);
        schema = step4Schema;
        break;
      case 5:
        schema = step5Schema;
        dataToValidate = formData;
        break;
      case 6:
        schema = step6Schema;
        dataToValidate = formData;
        break;
      case 7:
        schema = step7Schema;
        dataToValidate = formData;
        break;
      default:
        return { isValid: true, errors: {} };
    }

    schema.parse(dataToValidate);
    return { isValid: true, errors: {} };
  } catch (err) {
    if (err instanceof z.ZodError) {
      err.errors.forEach((error) => {
        const path = error.path.join(".");
        errors[path] = error.message;
      });
    }
    return { isValid: false, errors };
  }
}

