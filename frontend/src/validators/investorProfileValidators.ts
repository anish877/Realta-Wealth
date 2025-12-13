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
  rrNameFieldSchema,
  customerNameFieldSchema,
  accountNumberFieldSchemaEnhanced,
  rrNumberFieldSchema,
  numberOfTenantsFieldSchema,
  stateProvinceFieldSchema,
  sinceYearFieldSchema,
  yearsEmployedFieldSchema,
  yearsExperienceFieldSchema,
  occupationFieldSchemaEnhanced,
  businessTypeFieldSchema,
  employerNameFieldSchema,
  addressFieldSchema,
  cityFieldSchema,
  zipPostalCodeFieldSchema,
  countryFieldSchema,
  citizenshipFieldSchema,
  governmentIdTypeFieldSchema,
  governmentIdNumberFieldSchema,
  relationshipFieldSchema,
  companyNameFieldSchema,
  signatureFieldSchema,
  generalTextFieldSchema,
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

// Right column account type schema
export const accountTypeRightSchema = z.enum([
  "trust",
  "nonprofit_organization",
  "partnership",
  "exempt_organization",
  "other_account_type",
]);

export const step1Schema = z
  .object({
    rr_name: rrNameFieldSchema.optional(),
    rr_no: rrNumberFieldSchema,
    customer_names: customerNameFieldSchema.optional(),
    account_no: z.string().trim().max(50, "Account number must be no more than 50 characters").refine(
      (val) => !val || /^[a-zA-Z0-9]+$/.test(val),
      { message: "Account number must be alphanumeric" }
    ).optional(),
    retirement_checkbox: booleanFieldSchema,
    retail_checkbox: booleanFieldSchema,
    type_of_account: arrayFieldSchema(accountTypeSchema).optional(),
    type_of_account_right: arrayFieldSchema(accountTypeRightSchema).optional(),
    additional_designation_left: arrayFieldSchema(additionalDesignationSchema).optional(),
    other_account_type_text: generalTextFieldSchema.max(100, "Other account type must be no more than 100 characters").optional(),
    trust_checkbox: booleanFieldSchema.optional(),
    trust_establishment_date: dateFieldSchema({ notFuture: true, minYear: 1900 }).optional(),
    trust_type: arrayFieldSchema(trustTypeSchema).optional(),
    are_account_holders_married: enumFieldSchema(["Yes", "No"] as const).optional(),
    tenancy_state: stateProvinceFieldSchema.optional(),
    number_of_tenants: numberOfTenantsFieldSchema.optional(),
    tenancy_clause: arrayFieldSchema(tenancyClauseSchema).optional(),
    state_in_which_gift_was_given_1: stateProvinceFieldSchema.optional(),
    date_gift_was_given_1: dateFieldSchema({ notFuture: true, minYear: 1900 }).optional(),
    state_in_which_gift_was_given_2: stateProvinceFieldSchema.optional(),
    date_gift_was_given_2: dateFieldSchema({ notFuture: true, minYear: 1900 }).optional(),
    transfer_on_death_individual_agreement_date: dateFieldSchema({ notFuture: true, minYear: 1900 }).optional(),
    transfer_on_death_joint_agreement_date: dateFieldSchema({ notFuture: true, minYear: 1900 }).optional(),
  })
  .superRefine((data, ctx) => {
    // At least one account type must be selected (from either column)
    const hasLeftAccountType = Array.isArray(data.type_of_account) && data.type_of_account.length > 0;
    const hasRightAccountType = Array.isArray(data.type_of_account_right) && data.type_of_account_right.length > 0;
    if (!hasLeftAccountType && !hasRightAccountType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one account type must be selected",
        path: ["type_of_account"],
      });
    }

    // RR Name and Customer Names required unless Retirement is checked
    if (!data.retirement_checkbox) {
      if (!data.rr_name || (typeof data.rr_name === "string" && data.rr_name.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "RR Name is required (unless Retirement account is selected)",
          path: ["rr_name"],
        });
      }
      // RR Number required when RR Name is provided
      if (data.rr_name && (typeof data.rr_name === "string" && data.rr_name.trim() !== "")) {
        if (!data.rr_no || (typeof data.rr_no === "string" && data.rr_no.trim() === "")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "RR Number is required when RR Name is provided",
            path: ["rr_no"],
          });
        }
      }
      if (!data.customer_names || (typeof data.customer_names === "string" && data.customer_names.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Customer Name(s) is required (unless Retirement account is selected)",
          path: ["customer_names"],
        });
      }
    }

    // Other account type text required if "other_account_type" is selected in right column
    if (Array.isArray(data.type_of_account_right) && data.type_of_account_right.includes("other_account_type") && (!data.other_account_type_text || (typeof data.other_account_type_text === "string" && data.other_account_type_text.trim() === ""))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the other account type",
        path: ["other_account_type_text"],
      });
    }

    // Trust information required if trust checkbox is checked OR trust is in type_of_account_right
    const hasTrust = data.trust_checkbox === true || (Array.isArray(data.type_of_account_right) && data.type_of_account_right.includes("trust"));
    if (hasTrust) {
      if (!Array.isArray(data.trust_type) || data.trust_type.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Trust type is required when Trust is selected",
          path: ["trust_type"],
        });
      }
      if (!data.trust_establishment_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Trust establishment date is required when Trust is selected",
          path: ["trust_establishment_date"],
        });
      }
    }

    // Additional Designation validation based on account type
    if (Array.isArray(data.type_of_account)) {
      // Corporation requires C Corp or S Corp
      if (data.type_of_account.includes("corporation")) {
        if (!Array.isArray(data.additional_designation_left) || 
            (!data.additional_designation_left.includes("c_corp") && !data.additional_designation_left.includes("s_corp"))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "C Corp or S Corp designation is required for Corporation accounts",
            path: ["additional_designation_left"],
          });
        }
      }
      
      // Custodial requires UGMA or UTMA
      if (data.type_of_account.includes("custodial")) {
        if (!Array.isArray(data.additional_designation_left) || 
            (!data.additional_designation_left.includes("ugma") && !data.additional_designation_left.includes("utma"))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "UGMA or UTMA designation is required for Custodial accounts",
            path: ["additional_designation_left"],
          });
        }
      }
      
      // Limited Liability Company requires C Corp, S Corp, or Partnership
      if (data.type_of_account.includes("limited_liability_company")) {
        if (!Array.isArray(data.additional_designation_left) || 
            (!data.additional_designation_left.includes("c_corp") && 
             !data.additional_designation_left.includes("s_corp") && 
             !data.additional_designation_left.includes("partnership"))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "C Corp, S Corp, or Partnership designation is required for Limited Liability Company accounts",
            path: ["additional_designation_left"],
          });
        }
      }
    }

    // Joint account information required if joint account type is selected
    const hasJointAccount = Array.isArray(data.type_of_account) && 
      (data.type_of_account.includes("joint_tenant") || data.type_of_account.includes("transfer_on_death_joint"));
    if (hasJointAccount) {
      if (!data.are_account_holders_married) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Marital status is required for joint accounts",
          path: ["are_account_holders_married"],
        });
      }
      if (!data.tenancy_state || (typeof data.tenancy_state === "string" && data.tenancy_state.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tenancy state is required for joint accounts",
          path: ["tenancy_state"],
        });
      }
      if (!data.number_of_tenants) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Number of tenants is required for joint accounts",
          path: ["number_of_tenants"],
        });
      }
      if (!Array.isArray(data.tenancy_clause) || data.tenancy_clause.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one tenancy clause is required for joint accounts",
          path: ["tenancy_clause"],
        });
      }
    }

    // Custodial account fields required if custodial account type is selected
    if (Array.isArray(data.type_of_account) && data.type_of_account.includes("custodial")) {
      if (!data.state_in_which_gift_was_given_1 || (typeof data.state_in_which_gift_was_given_1 === "string" && data.state_in_which_gift_was_given_1.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "State in which gift was given (1) is required for custodial accounts",
          path: ["state_in_which_gift_was_given_1"],
        });
      }
      if (!data.date_gift_was_given_1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date gift was given (1) is required for custodial accounts",
          path: ["date_gift_was_given_1"],
        });
      }
      if (!data.state_in_which_gift_was_given_2 || (typeof data.state_in_which_gift_was_given_2 === "string" && data.state_in_which_gift_was_given_2.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "State in which gift was given (2) is required for custodial accounts",
          path: ["state_in_which_gift_was_given_2"],
        });
      }
      if (!data.date_gift_was_given_2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date gift was given (2) is required for custodial accounts",
          path: ["date_gift_was_given_2"],
        });
      }
    }

    // Transfer on Death agreement dates required when those account types are selected
    if (Array.isArray(data.type_of_account) && data.type_of_account.includes("transfer_on_death_individual")) {
      if (!data.transfer_on_death_individual_agreement_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Transfer on Death Individual agreement date is required",
          path: ["transfer_on_death_individual_agreement_date"],
        });
      }
    }
    
    if (Array.isArray(data.type_of_account) && data.type_of_account.includes("transfer_on_death_joint")) {
      if (!data.transfer_on_death_joint_agreement_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Transfer on Death Joint agreement date is required",
          path: ["transfer_on_death_joint_agreement_date"],
        });
      }
    }
  });

// ============================================
// STEP 2: Patriot Act Information
// ============================================

export const initialSourceOfFundsSchema = z.enum([
  "Accounts Receivable",
  "Income From Earnings",
  "Legal Settlement",
  "Spouse/Parent",
  "Accumulated Savings",
  "Inheritance",
  "Lottery/Gaming",
  "Rental Income",
  "Alimony",
  "Insurance Proceeds",
  "Pension/IRA/Retirement Savings",
  "Sale of Business",
  "Gift",
  "Investment Proceeds",
  "Sale of Real Estate",
  "Other",
]);

export const step2Schema = z
  .object({
    initial_source_of_funds: arrayFieldSchema(initialSourceOfFundsSchema).optional(),
    initial_source_of_funds_other_text: generalTextFieldSchema.min(2, "Other source of funds must be at least 2 characters").max(200, "Other source of funds must be no more than 200 characters").optional(),
  })
  .superRefine((data, ctx) => {
    // At least one source of funds is required
    if (!Array.isArray(data.initial_source_of_funds) || data.initial_source_of_funds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one source of funds is required",
        path: ["initial_source_of_funds"],
      });
      return; // Early return if no sources selected
    }

    // Validate each item in the array is a valid enum value
    data.initial_source_of_funds.forEach((item, index) => {
      if (!item || typeof item !== "string" || item.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Source of funds cannot be empty",
          path: ["initial_source_of_funds", index],
        });
      } else {
        const result = initialSourceOfFundsSchema.safeParse(item);
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid source of funds option: ${item}`,
            path: ["initial_source_of_funds", index],
          });
        }
      }
    });

    // Other text required if "Other" is selected
    if (data.initial_source_of_funds.includes("Other")) {
      if (!data.initial_source_of_funds_other_text || (typeof data.initial_source_of_funds_other_text === "string" && data.initial_source_of_funds_other_text.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please specify the other source of funds",
          path: ["initial_source_of_funds_other_text"],
        });
      } else if (typeof data.initial_source_of_funds_other_text === "string" && data.initial_source_of_funds_other_text.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Other source of funds must be at least 2 characters",
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
  "Widow(er)", // Support both formats from JSON schema
]);

export const employmentAffiliationSchema = z.enum([
  "Employed",
  "SelfEmployed",
  "Self-Employed", // Support both formats from JSON schema
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
    name: rrNameFieldSchema.optional(), // Using nameFieldSchema for name validation
    person_entity: personEntitySchema.optional(),
    ssn: ssnFieldSchema.optional(),
    ein: einFieldSchema.optional(),
    yes_no_box: yesNoSchema.optional(),
    email: emailFieldSchema.max(254, "Email must be no more than 254 characters").optional(),
    dob: dateFieldSchema({ notFuture: true, minAge: 18, maxAge: 120 }).optional(),
    specified_adult: yesNoSchema.optional(),

    // Contact info
    home_phone: phoneFieldSchema.optional(),
    business_phone: phoneFieldSchema.optional(),
    mobile_phone: phoneFieldSchema.optional(),

    // Addresses
    legal_address: addressFieldSchema.optional(), // No P.O. Box validation
    city: cityFieldSchema.optional(),
    state_province: stateProvinceFieldSchema.optional(),
    zip_postal_code: zipPostalCodeFieldSchema.optional(),
    country: countryFieldSchema.optional(),
    mailing_same_as_legal: booleanFieldSchema.optional(),
    mailing_address: generalTextFieldSchema.max(200, "Mailing address must be no more than 200 characters").optional(),
    mailing_city: cityFieldSchema.optional(),
    mailing_state_province: stateProvinceFieldSchema.optional(),
    mailing_zip_postal_code: zipPostalCodeFieldSchema.optional(),
    mailing_country: countryFieldSchema.optional(),

    // Additional info
    citizenship_primary: citizenshipFieldSchema.optional(),
    citizenship_additional: citizenshipFieldSchema.optional(),
    gender: genderSchema.optional(),
    marital_status: arrayFieldSchema(maritalStatusSchema).optional(),
    employment_affiliations: arrayFieldSchema(employmentAffiliationSchema).optional(),
    occupation: occupationFieldSchemaEnhanced.optional(),
    years_employed: yearsEmployedFieldSchema.optional(),
    type_of_business: businessTypeFieldSchema.optional(),
    employer_name: employerNameFieldSchema.optional(),
    employer_address: generalTextFieldSchema.max(200, "Employer address must be no more than 200 characters").optional(),
    employer_city: cityFieldSchema.optional(),
    employer_state_province: stateProvinceFieldSchema.optional(),
    employer_zip_postal_code: zipPostalCodeFieldSchema.optional(),
    employer_country: countryFieldSchema.optional(),

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

    // Government ID - First ID
    gov_id_type: governmentIdTypeFieldSchema.optional(),
    gov_id_number: governmentIdNumberFieldSchema.optional(),
    gov_id_country_of_issue: countryFieldSchema.optional(),
    gov_id_date_of_issue: dateFieldSchema({ notFuture: true, minYear: 1900 }).optional(),
    gov_id_date_of_expiration: dateFieldSchema({ notPast: true, maxDaysFuture: 7300 }).optional(), // Max 20 years

    // Government ID - Second ID (repeatable)
    gov2_type: governmentIdTypeFieldSchema.optional(),
    gov2_id_number: governmentIdNumberFieldSchema.optional(),
    gov2_country_of_issue: countryFieldSchema.optional(),
    gov2_date_of_issue: dateFieldSchema({ notFuture: true, minYear: 1900 }).optional(),
    gov2_date_of_expiration: dateFieldSchema({ notPast: true, maxDaysFuture: 7300 }).optional(), // Max 20 years

    // Investment Knowledge - All 15 types + Other
    commodities_futures_knowledge: investmentKnowledgeLevelSchema.optional(),
    commodities_futures_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    equities_knowledge: investmentKnowledgeLevelSchema.optional(),
    equities_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    etf_knowledge: investmentKnowledgeLevelSchema.optional(),
    etf_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    fixed_annuities_knowledge: investmentKnowledgeLevelSchema.optional(),
    fixed_annuities_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    fixed_insurance_knowledge: investmentKnowledgeLevelSchema.optional(),
    fixed_insurance_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    mutual_funds_knowledge: investmentKnowledgeLevelSchema.optional(),
    mutual_funds_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    options_knowledge: investmentKnowledgeLevelSchema.optional(),
    options_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    precious_metals_knowledge: investmentKnowledgeLevelSchema.optional(),
    precious_metals_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    real_estate_knowledge: investmentKnowledgeLevelSchema.optional(),
    real_estate_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    unit_investment_trusts_knowledge: investmentKnowledgeLevelSchema.optional(),
    unit_investment_trusts_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    variable_annuities_knowledge: investmentKnowledgeLevelSchema.optional(),
    variable_annuities_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    leveraged_inverse_etfs_knowledge: investmentKnowledgeLevelSchema.optional(),
    leveraged_inverse_etfs_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    complex_products_knowledge: investmentKnowledgeLevelSchema.optional(),
    complex_products_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    alternative_investments_knowledge: investmentKnowledgeLevelSchema.optional(),
    alternative_investments_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    other_investment_knowledge_value: investmentKnowledgeLevelSchema.optional(),
    other_investment_knowledge_label: generalTextFieldSchema.max(200, "Other investment label must be no more than 200 characters").optional(),
    other_investment_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),

    // Secondary Account Holder - Investment Knowledge (different field naming)
    secondary_commodities_futures: investmentKnowledgeLevelSchema.optional(),
    secondary_commodities_futures_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    secondary_equities: investmentKnowledgeLevelSchema.optional(),
    secondary_equities_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    secondary_etfs: investmentKnowledgeLevelSchema.optional(),
    secondary_etfs_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    secondary_fixed_annuities: investmentKnowledgeLevelSchema.optional(),
    secondary_fixed_annuities_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    secondary_fixed_insurance: investmentKnowledgeLevelSchema.optional(),
    secondary_fixed_insurance_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    secondary_mutual_funds: investmentKnowledgeLevelSchema.optional(),
    secondary_mutual_funds_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    secondary_options: investmentKnowledgeLevelSchema.optional(),
    secondary_options_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    secondary_precious_metals: investmentKnowledgeLevelSchema.optional(),
    secondary_precious_metals_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    secondary_real_estate: investmentKnowledgeLevelSchema.optional(),
    secondary_real_estate_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    secondary_unit_investment_trusts: investmentKnowledgeLevelSchema.optional(),
    secondary_unit_investment_trusts_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    secondary_variable_annuities: investmentKnowledgeLevelSchema.optional(),
    secondary_variable_annuities_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    secondary_leveraged_inverse_etfs: investmentKnowledgeLevelSchema.optional(),
    secondary_leveraged_inverse_etfs_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    secondary_complex_products: investmentKnowledgeLevelSchema.optional(),
    secondary_complex_products_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    secondary_alternative_investments_knowledge: investmentKnowledgeLevelSchema.optional(),
    secondary_alternative_investments_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    secondary_other_investments_knowledge: investmentKnowledgeLevelSchema.optional(),
    secondary_other_investments_label: generalTextFieldSchema.max(200, "Other investment label must be no more than 200 characters").optional(),
    secondary_other_investments_since: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),

    // Secondary Account Holder - Financial Information (with _2 suffix)
    annual_income_from_2: currencyFieldSchema().optional(),
    annual_income_to_2: currencyFieldSchema().optional(),
    net_worth_from_2: currencyFieldSchema().optional(),
    net_worth_to_2: currencyFieldSchema().optional(),
    liquid_net_worth_from_2: currencyFieldSchema().optional(),
    liquid_net_worth_to_2: currencyFieldSchema().optional(),
    tax_bracket_2: taxBracketSchema.optional(),

    // Secondary Account Holder - Different field names
    secondary_employee_name: generalTextFieldSchema.max(200, "Employee name must be no more than 200 characters").optional(),
    secondary_affiliation_details: generalTextFieldSchema.max(200, "Affiliation details must be no more than 200 characters").optional(),
    secondary_years_investment_experience: yearsExperienceFieldSchema.optional(),

    // Affiliations
    employee_of_advisory_firm: yesNoSchema.optional(),
    related_to_employee_advisory: yesNoSchema.optional(),
    employee_name_and_relationship: generalTextFieldSchema.max(200, "Employee name and relationship must be no more than 200 characters").optional(),
    employee_of_broker_dealer: yesNoSchema.optional(),
    broker_dealer_name: employerNameFieldSchema.optional(),
    related_to_employee_broker_dealer: yesNoSchema.optional(),
    broker_dealer_employee_name: rrNameFieldSchema.optional(),
    broker_dealer_employee_relationship: relationshipFieldSchema.optional(),
    maintaining_other_brokerage_accounts: yesNoSchema.optional(),
    with_what_firms: generalTextFieldSchema.max(200, "Firm names must be no more than 200 characters").optional(),
    years_of_investment_experience: yearsExperienceFieldSchema.optional(),
    affiliated_with_exchange_or_finra: yesNoSchema.optional(),
    affiliation_employer_authorization_required: generalTextFieldSchema.max(200, "Affiliation details must be no more than 200 characters").optional(),
    senior_officer_or_10pct_shareholder: yesNoSchema.optional(),
    company_names: companyNameFieldSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // Name is required
    if (!data.name || (typeof data.name === "string" && data.name.trim() === "")) {
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
      if (!data.ssn || (typeof data.ssn === "string" && data.ssn.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "SSN is required for Person",
          path: ["ssn"],
        });
      }
    }

    // EIN required if Entity
    if (data.person_entity === "Entity") {
      if (!data.ein || (typeof data.ein === "string" && data.ein.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "EIN is required for Entity",
          path: ["ein"],
        });
      }
    }

    // Email format validation if provided
    if (data.email && typeof data.email === "string" && data.email.trim() !== "") {
      const emailResult = emailFieldSchema.safeParse(data.email);
      if (!emailResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid email address",
          path: ["email"],
        });
      }
    }

    // DOB is required only if Person is selected
    if (data.person_entity === "Person") {
      if (!data.dob || (typeof data.dob === "string" && data.dob.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date of birth is required for Person",
          path: ["dob"],
        });
      }
    }

    // Legal address fields are required
    if (!data.legal_address || (typeof data.legal_address === "string" && data.legal_address.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Legal address is required",
        path: ["legal_address"],
      });
    }
    if (!data.city || (typeof data.city === "string" && data.city.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "City is required",
        path: ["city"],
      });
    }
    if (!data.state_province || (typeof data.state_province === "string" && data.state_province.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "State/Province is required",
        path: ["state_province"],
      });
    }
    if (!data.zip_postal_code || (typeof data.zip_postal_code === "string" && data.zip_postal_code.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Zip/Postal code is required",
        path: ["zip_postal_code"],
      });
    }
    if (!data.country || (typeof data.country === "string" && data.country.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Country is required",
        path: ["country"],
      });
    }

    // Mailing address components all required together if "same as legal" is false
    if (data.mailing_same_as_legal === false) {
      if (!data.mailing_address || (typeof data.mailing_address === "string" && data.mailing_address.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mailing address is required when different from legal address",
          path: ["mailing_address"],
        });
      }
      if (!data.mailing_city || (typeof data.mailing_city === "string" && data.mailing_city.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mailing city is required when different from legal address",
          path: ["mailing_city"],
        });
      }
      if (!data.mailing_state_province || (typeof data.mailing_state_province === "string" && data.mailing_state_province.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mailing state/province is required when different from legal address",
          path: ["mailing_state_province"],
        });
      }
      if (!data.mailing_zip_postal_code || (typeof data.mailing_zip_postal_code === "string" && data.mailing_zip_postal_code.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mailing zip/postal code is required when different from legal address",
          path: ["mailing_zip_postal_code"],
        });
      }
      if (!data.mailing_country || (typeof data.mailing_country === "string" && data.mailing_country.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mailing country is required when different from legal address",
          path: ["mailing_country"],
        });
      }
    }

    // Government ID validation - First ID: all fields required together
    if (data.gov_id_type || data.gov_id_number || data.gov_id_country_of_issue || data.gov_id_date_of_issue || data.gov_id_date_of_expiration) {
      if (!data.gov_id_type || (typeof data.gov_id_type === "string" && data.gov_id_type.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Government ID type is required",
          path: ["gov_id_type"],
        });
      }
      if (!data.gov_id_number || (typeof data.gov_id_number === "string" && data.gov_id_number.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Government ID number is required",
          path: ["gov_id_number"],
        });
      }
      if (!data.gov_id_country_of_issue || (typeof data.gov_id_country_of_issue === "string" && data.gov_id_country_of_issue.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Country of issue is required",
          path: ["gov_id_country_of_issue"],
        });
      }
      if (!data.gov_id_date_of_issue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date of issue is required",
          path: ["gov_id_date_of_issue"],
        });
      }
      if (!data.gov_id_date_of_expiration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date of expiration is required",
          path: ["gov_id_date_of_expiration"],
        });
      }

      // Government ID expiration must be after issue date
      if (data.gov_id_date_of_issue && data.gov_id_date_of_expiration && typeof data.gov_id_date_of_issue === "string" && typeof data.gov_id_date_of_expiration === "string") {
        const issueDate = new Date(data.gov_id_date_of_issue);
        const expDate = new Date(data.gov_id_date_of_expiration);
        if (!isNaN(issueDate.getTime()) && !isNaN(expDate.getTime()) && expDate <= issueDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Expiration date must be after issue date",
            path: ["gov_id_date_of_expiration"],
          });
        }
      }
    }

    // Government ID validation - Second ID: all fields required together
    if (data.gov2_type || data.gov2_id_number || data.gov2_country_of_issue || data.gov2_date_of_issue || data.gov2_date_of_expiration) {
      if (!data.gov2_type || (typeof data.gov2_type === "string" && data.gov2_type.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Government ID type is required",
          path: ["gov2_type"],
        });
      }
      if (!data.gov2_id_number || (typeof data.gov2_id_number === "string" && data.gov2_id_number.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Government ID number is required",
          path: ["gov2_id_number"],
        });
      }
      if (!data.gov2_country_of_issue || (typeof data.gov2_country_of_issue === "string" && data.gov2_country_of_issue.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Country of issue is required",
          path: ["gov2_country_of_issue"],
        });
      }
      if (!data.gov2_date_of_issue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date of issue is required",
          path: ["gov2_date_of_issue"],
        });
      }
      if (!data.gov2_date_of_expiration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date of expiration is required",
          path: ["gov2_date_of_expiration"],
        });
      }

      // Government ID expiration must be after issue date
      if (data.gov2_date_of_issue && data.gov2_date_of_expiration && typeof data.gov2_date_of_issue === "string" && typeof data.gov2_date_of_expiration === "string") {
        const issueDate = new Date(data.gov2_date_of_issue);
        const expDate = new Date(data.gov2_date_of_expiration);
        if (!isNaN(issueDate.getTime()) && !isNaN(expDate.getTime()) && expDate <= issueDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Expiration date must be after issue date",
            path: ["gov2_date_of_expiration"],
          });
        }
      }
    }

    // Employment fields required if Employed or SelfEmployed/Self-Employed is selected
    if (Array.isArray(data.employment_affiliations)) {
      const hasEmployment = data.employment_affiliations.includes("Employed") || 
                           data.employment_affiliations.includes("SelfEmployed") ||
                           data.employment_affiliations.includes("Self-Employed");
      if (hasEmployment) {
        if (!data.occupation || (typeof data.occupation === "string" && data.occupation.trim() === "")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Occupation is required when Employed or Self-Employed",
            path: ["occupation"],
          });
        }
        if (!data.employer_name || (typeof data.employer_name === "string" && data.employer_name.trim() === "")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Employer name is required when Employed or Self-Employed",
            path: ["employer_name"],
          });
        }
      }
    }

    // Employee/relationship fields required if related_to_employee_advisory is "Yes"
    if (data.related_to_employee_advisory === "Yes") {
      if (!data.employee_name_and_relationship || (typeof data.employee_name_and_relationship === "string" && data.employee_name_and_relationship.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employee name and relationship is required",
          path: ["employee_name_and_relationship"],
        });
      }
    }

    // Investment Knowledge: "Other" label required if "Other" knowledge is selected (Primary)
    if (data.other_investment_knowledge_value) {
      if (!data.other_investment_knowledge_label || (typeof data.other_investment_knowledge_label === "string" && data.other_investment_knowledge_label.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Other investment label is required when Other investment knowledge is selected",
          path: ["other_investment_knowledge_label"],
        });
      }
    }

    // Investment Knowledge: "Other" label required if "Other" knowledge is selected (Secondary)
    if (data.secondary_other_investments_knowledge) {
      if (!data.secondary_other_investments_label || (typeof data.secondary_other_investments_label === "string" && data.secondary_other_investments_label.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Other investment label is required when Other investment knowledge is selected",
          path: ["secondary_other_investments_label"],
        });
      }
    }

    // Financial range validation for secondary (with _2 suffix): "To" must be >= "From"
    if (data.annual_income_from_2 !== undefined && data.annual_income_to_2 !== undefined) {
      const fromValue = data.annual_income_from_2;
      const toValue = data.annual_income_to_2;
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
          path: ["annual_income_to_2"],
        });
      }
    }

    if (data.net_worth_from_2 !== undefined && data.net_worth_to_2 !== undefined) {
      const fromValue = data.net_worth_from_2;
      const toValue = data.net_worth_to_2;
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
          path: ["net_worth_to_2"],
        });
      }
    }

    if (data.liquid_net_worth_from_2 !== undefined && data.liquid_net_worth_to_2 !== undefined) {
      const fromValue = data.liquid_net_worth_from_2;
      const toValue = data.liquid_net_worth_to_2;
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
          path: ["liquid_net_worth_to_2"],
        });
      }
    }

    // Investment Knowledge: "Since Year" should be provided if knowledge level is selected (optional but recommended)
    // Note: This is informational - we don't require it, but validate format if provided

    // Broker dealer fields required if employee_of_broker_dealer is "Yes"
    if (data.employee_of_broker_dealer === "Yes") {
      if (!data.broker_dealer_name || (typeof data.broker_dealer_name === "string" && data.broker_dealer_name.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Broker dealer name is required",
          path: ["broker_dealer_name"],
        });
      }
    }

    // Broker dealer employee fields required if related_to_employee_broker_dealer is "Yes"
    if (data.related_to_employee_broker_dealer === "Yes") {
      if (!data.broker_dealer_employee_name || (typeof data.broker_dealer_employee_name === "string" && data.broker_dealer_employee_name.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Broker dealer employee name is required",
          path: ["broker_dealer_employee_name"],
        });
      }
      if (!data.broker_dealer_employee_relationship || (typeof data.broker_dealer_employee_relationship === "string" && data.broker_dealer_employee_relationship.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Broker dealer employee relationship is required",
          path: ["broker_dealer_employee_relationship"],
        });
      }
    }

    // With what firms required if maintaining_other_brokerage_accounts is "Yes"
    if (data.maintaining_other_brokerage_accounts === "Yes") {
      if (!data.with_what_firms || (typeof data.with_what_firms === "string" && data.with_what_firms.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Firm names are required when maintaining other brokerage accounts",
          path: ["with_what_firms"],
        });
      }
    }

    // Affiliation details required if affiliated_with_exchange_or_finra is "Yes"
    if (data.affiliated_with_exchange_or_finra === "Yes") {
      if (!data.affiliation_employer_authorization_required || (typeof data.affiliation_employer_authorization_required === "string" && data.affiliation_employer_authorization_required.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Affiliation details are required",
          path: ["affiliation_employer_authorization_required"],
        });
      }
    }

    // Company names required if senior_officer_or_10pct_shareholder is "Yes"
    if (data.senior_officer_or_10pct_shareholder === "Yes") {
      if (!data.company_names || (typeof data.company_names === "string" && data.company_names.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company name(s) are required",
          path: ["company_names"],
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

export const step5Schema = z
  .object({
    risk_exposure: arrayFieldSchema(riskExposureSchema).optional(),
    account_investment_objectives: arrayFieldSchema(accountInvestmentObjectiveSchema).optional(),
    other_investments_see_attached: booleanFieldSchema,
    investment_time_horizon_from: generalTextFieldSchema.max(100, "Time horizon from must be no more than 100 characters").optional(),
    investment_time_horizon_to: generalTextFieldSchema.max(100, "Time horizon to must be no more than 100 characters").optional(),
    liquidity_needs: arrayFieldSchema(liquidityNeedSchema).optional(),
    // Investment value fields - all currency with reasonable max
    investment_equities_value: currencyFieldSchema().optional(),
    investment_fixed_annuities_value: currencyFieldSchema().optional(),
    investment_options_value: currencyFieldSchema().optional(),
    investment_precious_metals_value: currencyFieldSchema().optional(),
    investment_fixed_income_value: currencyFieldSchema().optional(),
    investment_commodities_futures_value: currencyFieldSchema().optional(),
    investment_mutual_funds_value: currencyFieldSchema().optional(),
    investment_other_1_value: currencyFieldSchema().optional(),
    investment_unit_investment_trusts_value: currencyFieldSchema().optional(),
    investment_other_2_value: currencyFieldSchema().optional(),
    investment_etfs_value: currencyFieldSchema().optional(),
    investment_other_3_value: currencyFieldSchema().optional(),
    investment_real_estate_value: currencyFieldSchema().optional(),
    investment_insurance_value: currencyFieldSchema().optional(),
    investment_variable_annuities_value: currencyFieldSchema().optional(),
  })
  .superRefine((data, ctx) => {
    // Risk exposure validation - validate each item and filter empty strings
    if (Array.isArray(data.risk_exposure)) {
      if (data.risk_exposure.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one risk exposure is required",
          path: ["risk_exposure"],
        });
      } else {
        data.risk_exposure.forEach((item, index) => {
          if (!item || typeof item !== "string" || item.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Risk exposure cannot be empty",
              path: ["risk_exposure", index],
            });
          } else {
            const result = riskExposureSchema.safeParse(item);
            if (!result.success) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Invalid risk exposure option: ${item}`,
                path: ["risk_exposure", index],
              });
            }
          }
        });
      }
    } else {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one risk exposure is required",
        path: ["risk_exposure"],
      });
    }

    // Account investment objectives validation - validate each item and filter empty strings
    if (Array.isArray(data.account_investment_objectives)) {
      if (data.account_investment_objectives.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one account investment objective is required",
          path: ["account_investment_objectives"],
        });
      } else {
        data.account_investment_objectives.forEach((item, index) => {
          if (!item || typeof item !== "string" || item.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Account investment objective cannot be empty",
              path: ["account_investment_objectives", index],
            });
          } else {
            const result = accountInvestmentObjectiveSchema.safeParse(item);
            if (!result.success) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Invalid account investment objective option: ${item}`,
                path: ["account_investment_objectives", index],
              });
            }
          }
        });
      }
    } else {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one account investment objective is required",
        path: ["account_investment_objectives"],
      });
    }

    // Liquidity needs validation - validate each item if provided
    if (Array.isArray(data.liquidity_needs)) {
      data.liquidity_needs.forEach((item, index) => {
        if (!item || typeof item !== "string" || item.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Liquidity need cannot be empty",
            path: ["liquidity_needs", index],
          });
        } else {
          const result = liquidityNeedSchema.safeParse(item);
          if (!result.success) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Invalid liquidity need option: ${item}`,
              path: ["liquidity_needs", index],
            });
          }
        }
      });
    }

    // Investment time horizon validation - if dates, validate range
    if (data.investment_time_horizon_from && data.investment_time_horizon_to) {
      if (typeof data.investment_time_horizon_from === "string" && typeof data.investment_time_horizon_to === "string") {
        // Try to parse as dates
        const fromDate = new Date(data.investment_time_horizon_from);
        const toDate = new Date(data.investment_time_horizon_to);
        if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
          if (toDate < fromDate) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "End time horizon must be after or equal to start time horizon",
              path: ["investment_time_horizon_to"],
            });
          }
        }
      }
    }
  });

// ============================================
// STEP 6: Trusted Contact
// ============================================

export const step6Schema = z
  .object({
    trusted_contact_decline_to_provide: booleanFieldSchema,
    trusted_contact_name: rrNameFieldSchema.optional(),
    trusted_contact_email: emailFieldSchema.max(254, "Email must be no more than 254 characters").optional(),
    trusted_contact_home_phone: phoneFieldSchema.optional(),
    trusted_contact_business_phone: phoneFieldSchema.optional(),
    trusted_contact_mobile_phone: phoneFieldSchema.optional(),
    trusted_contact_mailing_address: generalTextFieldSchema.max(200, "Mailing address must be no more than 200 characters").optional(),
    trusted_contact_city: cityFieldSchema.optional(),
    trusted_contact_state_province: stateProvinceFieldSchema.optional(),
    trusted_contact_zip_postal_code: zipPostalCodeFieldSchema.optional(),
    trusted_contact_country: countryFieldSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // If not declined, name and email are required
    if (!data.trusted_contact_decline_to_provide) {
      if (!data.trusted_contact_name || (typeof data.trusted_contact_name === "string" && data.trusted_contact_name.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Trusted contact name is required",
          path: ["trusted_contact_name"],
        });
      }
      if (!data.trusted_contact_email || (typeof data.trusted_contact_email === "string" && data.trusted_contact_email.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Trusted contact email is required",
          path: ["trusted_contact_email"],
        });
      } else if (typeof data.trusted_contact_email === "string" && data.trusted_contact_email.trim() !== "") {
        // Validate email format if provided
        const emailResult = emailFieldSchema.safeParse(data.trusted_contact_email);
        if (!emailResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please enter a valid email address",
            path: ["trusted_contact_email"],
          });
        }
      }
    }

    // Validate email format if provided (even when optional/declined)
    if (data.trusted_contact_email && typeof data.trusted_contact_email === "string" && data.trusted_contact_email.trim() !== "") {
      const emailResult = emailFieldSchema.safeParse(data.trusted_contact_email);
      if (!emailResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid email address",
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
    account_owner_signature: signatureFieldSchema.optional(),
    account_owner_printed_name: rrNameFieldSchema.optional(),
    account_owner_date: dateFieldSchema({ notFuture: true, maxDaysAgo: 30 }).optional(),
    joint_account_owner_signature: signatureFieldSchema.optional(),
    joint_account_owner_printed_name: rrNameFieldSchema.optional(),
    joint_account_owner_date: dateFieldSchema({ notFuture: true, maxDaysAgo: 30 }).optional(),
    financial_professional_signature: signatureFieldSchema.optional(),
    financial_professional_printed_name: rrNameFieldSchema.optional(),
    financial_professional_date: dateFieldSchema({ notFuture: true, maxDaysAgo: 30 }).optional(),
    supervisor_principal_signature: signatureFieldSchema.optional(),
    supervisor_principal_printed_name: rrNameFieldSchema.optional(),
    supervisor_principal_date: dateFieldSchema({ notFuture: true, maxDaysAgo: 30 }).optional(),
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

    // Validate individual signatures if they have any part filled - all three fields required together
    // Account Owner Signature
    if (data.account_owner_signature || data.account_owner_printed_name || data.account_owner_date) {
      if (!data.account_owner_signature || (typeof data.account_owner_signature === "string" && data.account_owner_signature.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Account owner signature is required",
          path: ["account_owner_signature"],
        });
      }
      if (!data.account_owner_printed_name || (typeof data.account_owner_printed_name === "string" && data.account_owner_printed_name.trim() === "")) {
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

    // Joint Account Owner Signature
    if (data.joint_account_owner_signature || data.joint_account_owner_printed_name || data.joint_account_owner_date) {
      if (!data.joint_account_owner_signature || (typeof data.joint_account_owner_signature === "string" && data.joint_account_owner_signature.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Joint account owner signature is required",
          path: ["joint_account_owner_signature"],
        });
      }
      if (!data.joint_account_owner_printed_name || (typeof data.joint_account_owner_printed_name === "string" && data.joint_account_owner_printed_name.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Joint account owner printed name is required",
          path: ["joint_account_owner_printed_name"],
        });
      }
      if (!data.joint_account_owner_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Joint account owner signature date is required",
          path: ["joint_account_owner_date"],
        });
      }
    }

    // Financial Professional Signature
    if (data.financial_professional_signature || data.financial_professional_printed_name || data.financial_professional_date) {
      if (!data.financial_professional_signature || (typeof data.financial_professional_signature === "string" && data.financial_professional_signature.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Financial professional signature is required",
          path: ["financial_professional_signature"],
        });
      }
      if (!data.financial_professional_printed_name || (typeof data.financial_professional_printed_name === "string" && data.financial_professional_printed_name.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Financial professional printed name is required",
          path: ["financial_professional_printed_name"],
        });
      }
      if (!data.financial_professional_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Financial professional signature date is required",
          path: ["financial_professional_date"],
        });
      }
    }

    // Supervisor/Principal Signature
    if (data.supervisor_principal_signature || data.supervisor_principal_printed_name || data.supervisor_principal_date) {
      if (!data.supervisor_principal_signature || (typeof data.supervisor_principal_signature === "string" && data.supervisor_principal_signature.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Supervisor/principal signature is required",
          path: ["supervisor_principal_signature"],
        });
      }
      if (!data.supervisor_principal_printed_name || (typeof data.supervisor_principal_printed_name === "string" && data.supervisor_principal_printed_name.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Supervisor/principal printed name is required",
          path: ["supervisor_principal_printed_name"],
        });
      }
      if (!data.supervisor_principal_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Supervisor/principal signature date is required",
          path: ["supervisor_principal_date"],
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

