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
  yearFieldSchema,
  textFieldSchema,
  requiredTextFieldSchema,
  arrayFieldSchema,
  rrNameFieldSchema,
  customerNameFieldSchema,
  addressFieldSchema,
  cityFieldSchema,
  stateProvinceFieldSchema,
  zipPostalCodeFieldSchema,
  countryFieldSchema,
  citizenshipFieldSchema,
  governmentIdTypeFieldSchema,
  governmentIdNumberFieldSchema,
  relationshipFieldSchema,
  companyNameFieldSchema,
  signatureFieldSchema,
  generalTextFieldSchema,
  occupationFieldSchemaEnhanced,
  employerNameFieldSchema,
  yearsEmployedFieldSchema,
} from "./formFieldValidators";
import { currencyRangeSchema } from "../utils/validation";

/**
 * Frontend form validation schemas for Additional Holder form
 */

// Enums
export const personEntitySchema = z.enum(["Person", "Entity"]);
export const genderSchema = z.enum(["Male", "Female"]);
export const maritalStatusSchema = z.enum([
  "Single",
  "Married",
  "Divorced",
  "Domestic_Partner",
  "Widow_er",
]);
export const employmentStatusSchema = z.enum([
  "Employed",
  "Self-Employed",
  "Retired",
  "Unemployed",
  "Student",
]);
export const investmentKnowledgeLevelSchema = z.enum([
  "Limited",
  "Moderate",
  "Extensive",
  "None",
]);
export const taxBracketSchema = z.enum([
  "≤15%",
  "15% - 32%",
  "33% - 50%",
  "> 50% +",
]);
export const yesNoSchema = z.enum(["Yes", "No"]);

// Range Currency Schema
export const rangeCurrencyFieldSchema = currencyRangeSchema;

// STEP 1: Additional Holder Information
export const step1Schema = z
  .object({
    // Basic Information
    account_registration: generalTextFieldSchema.max(200).optional(),
    rr_name: rrNameFieldSchema.optional(),
    name: requiredTextFieldSchema.min(1).max(120),
    person_entity: arrayFieldSchema(personEntitySchema).optional(),
    ssn: ssnFieldSchema.optional(),
    ein: einFieldSchema.optional(),
    holder_participant_role: generalTextFieldSchema.max(100).optional(),
    email: emailFieldSchema.optional(),
    dob: dateFieldSchema({ notFuture: true }).optional(),
    position_held: generalTextFieldSchema.max(100).optional(),
    home_phone: phoneFieldSchema,
    business_phone: phoneFieldSchema,
    mobile_phone: phoneFieldSchema,

    // Legal Address
    legal_address_line: addressFieldSchema.optional(),
    legal_city: cityFieldSchema.optional(),
    legal_state_province: stateProvinceFieldSchema.optional(),
    legal_zip_postal_code: zipPostalCodeFieldSchema.optional(),
    legal_country: countryFieldSchema.optional(),

    // Mailing Address
    mailing_address_line: addressFieldSchema.optional(),
    mailing_city: cityFieldSchema.optional(),
    mailing_state_province: stateProvinceFieldSchema.optional(),
    mailing_zip_postal_code: zipPostalCodeFieldSchema.optional(),
    mailing_country: countryFieldSchema.optional(),
    mailing_same_as_legal: z.boolean().optional(),

    // Personal Information
    primary_citizenship: citizenshipFieldSchema.optional(),
    additional_citizenship: citizenshipFieldSchema.optional(),
    gender: arrayFieldSchema(genderSchema).optional(),
    marital_status: arrayFieldSchema(maritalStatusSchema).optional(),

    // Employment
    employment_status: arrayFieldSchema(employmentStatusSchema).optional(),
    occupation: occupationFieldSchemaEnhanced.optional(),
    years_employed: yearsEmployedFieldSchema.optional(),
    type_of_business: generalTextFieldSchema.max(100).optional(),
    employer_name: employerNameFieldSchema.optional(),
    employer_address_line: addressFieldSchema.optional(),
    employer_city: cityFieldSchema.optional(),
    employer_state_province: stateProvinceFieldSchema.optional(),
    employer_zip_postal_code: zipPostalCodeFieldSchema.optional(),
    employer_country: countryFieldSchema.optional(),

    // Investment Knowledge - Overall
    overall_level: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),

    // Investment Knowledge - Page 1
    commodities_futures_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    commodities_futures_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    equities_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    equities_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    exchange_traded_funds_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    exchange_traded_funds_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    fixed_annuities_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    fixed_annuities_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    fixed_insurance_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    fixed_insurance_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    mutual_funds_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    mutual_funds_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
  })
  .superRefine((data, ctx) => {
    // Enforce single-choice selections where only one answer is allowed
    const singleChoiceFields: Array<keyof typeof data> = [
      "person_entity",
      "gender",
      "marital_status",
      "employment_status",
      "overall_level",
    ];
    singleChoiceFields.forEach((field) => {
      const val = data[field];
      if (Array.isArray(val) && val.length > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select only one option",
          path: [field as string],
        });
      }
    });

    // Ensure each knowledge selection on page 1 is single-choice
    const page1KnowledgeFields: Array<keyof typeof data> = [
      "commodities_futures_knowledge",
      "equities_knowledge",
      "exchange_traded_funds_knowledge",
      "fixed_annuities_knowledge",
      "fixed_insurance_knowledge",
      "mutual_funds_knowledge",
    ];
    page1KnowledgeFields.forEach((field) => {
      const val = data[field];
      if (Array.isArray(val) && val.length > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Choose a single knowledge level",
          path: [field as string],
        });
      }
    });

    // SSN required if Person
    const personEntity = data.person_entity;
    if (Array.isArray(personEntity) && personEntity.includes("Person")) {
      if (!data.ssn || data.ssn === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "SSN is required when Person is selected",
          path: ["ssn"],
        });
      }
    }

    // EIN required if Entity
    if (Array.isArray(personEntity) && personEntity.includes("Entity")) {
      if (!data.ein || data.ein === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "EIN is required when Entity is selected",
          path: ["ein"],
        });
      }
    }

    // Legal address cannot be P.O. Box
    if (data.legal_address_line) {
      const addressLower = String(data.legal_address_line).toLowerCase();
      if (
        addressLower.includes("p.o. box") ||
        addressLower.includes("po box") ||
        addressLower.includes("p.o box") ||
        addressLower.includes("post office box")
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Legal address cannot be a P.O. Box",
          path: ["legal_address_line"],
        });
      }
    }

    // Mailing address required if mailing_same_as_legal is false
    if (data.mailing_same_as_legal === false) {
      if (!data.mailing_address_line || data.mailing_address_line === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mailing address is required when different from legal address",
          path: ["mailing_address_line"],
        });
      }
    }

    // Employment fields required if Employed or Self-Employed
    const employmentStatus = data.employment_status;
    if (Array.isArray(employmentStatus)) {
      if (
        employmentStatus.includes("Employed") ||
        employmentStatus.includes("Self-Employed")
      ) {
        if (!data.occupation || data.occupation === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Occupation is required when Employed or Self-Employed is selected",
            path: ["occupation"],
          });
        }
        if (!data.employer_name || data.employer_name === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Employer Name is required when Employed or Self-Employed is selected",
            path: ["employer_name"],
          });
        }
      }
    }

    // Note: other_investments_knowledge and other_investments_label are validated in step2Schema
  });

// STEP 2: Continuation and Signature
export const step2Schema = z
  .object({
    // Investment Knowledge - Page 2
    options_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    options_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    precious_metals_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    precious_metals_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    real_estate_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    real_estate_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    unit_investment_trusts_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    unit_investment_trusts_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    variable_annuities_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    variable_annuities_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    leveraged_inverse_etfs_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    leveraged_inverse_etfs_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    complex_products_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    complex_products_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    alternative_investments_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    alternative_investments_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    other_investments_knowledge: arrayFieldSchema(investmentKnowledgeLevelSchema).optional(),
    other_investments_since_year: yearFieldSchema({ minYear: 1900, maxYear: new Date().getFullYear() }).optional(),
    other_investments_label: generalTextFieldSchema.max(100).optional(),

    // Note: other_investments_knowledge and other_investments_label validation

    // Financial Information
    annual_income: rangeCurrencyFieldSchema.optional(),
    net_worth: rangeCurrencyFieldSchema.optional(),
    liquid_net_worth: rangeCurrencyFieldSchema.optional(),
    tax_bracket: arrayFieldSchema(taxBracketSchema).optional(),

    // Government ID #1
    gov_id_1_type: governmentIdTypeFieldSchema.optional(),
    gov_id_1_number: governmentIdNumberFieldSchema.optional(),
    gov_id_1_country_of_issue: countryFieldSchema.optional(),
    gov_id_1_date_of_issue: dateFieldSchema({ notFuture: true, minYear: 1900 }).optional(),
    gov_id_1_date_of_expiration: dateFieldSchema({ notPast: true, maxDaysFuture: 7300 }).optional(),

    // Government ID #2
    gov_id_2_type: governmentIdTypeFieldSchema.optional(),
    gov_id_2_number: governmentIdNumberFieldSchema.optional(),
    gov_id_2_country_of_issue: countryFieldSchema.optional(),
    gov_id_2_date_of_issue: dateFieldSchema({ notFuture: true, minYear: 1900 }).optional(),
    gov_id_2_date_of_expiration: dateFieldSchema({ notPast: true, maxDaysFuture: 7300 }).optional(),

    // Employment/Affiliation Questions
    employee_of_this_broker_dealer: yesNoSchema.optional(),
    related_to_employee_at_this_broker_dealer: yesNoSchema.optional(),
    employee_name: generalTextFieldSchema.max(120).optional(),
    relationship: relationshipFieldSchema.optional(),
    employee_of_another_broker_dealer: yesNoSchema.optional(),
    broker_dealer_name: generalTextFieldSchema.max(120).optional(),
    related_to_employee_at_another_broker_dealer: yesNoSchema.optional(),
    broker_dealer_name_2: generalTextFieldSchema.max(120).optional(),
    employee_name_2: generalTextFieldSchema.max(120).optional(),
    relationship_2: relationshipFieldSchema.optional(),
    maintaining_other_brokerage_accounts: yesNoSchema.optional(),
    with_what_firms: generalTextFieldSchema.max(200).optional(),
    years_of_investment_experience: yearsEmployedFieldSchema.optional(),
    affiliated_with_exchange_or_finra: yesNoSchema.optional(),
    what_is_the_affiliation: generalTextFieldSchema.max(200).optional(),
    senior_officer_director_shareholder: yesNoSchema.optional(),
    company_names: companyNameFieldSchema.optional(),

    // Signature
    signature: signatureFieldSchema,
    printed_name: requiredTextFieldSchema.min(1).max(120),
    date: dateFieldSchema({ notFuture: true }),
  })
  .superRefine((data, ctx) => {
    // Single-choice enforcement for page 2 knowledge + tax bracket
    const page2KnowledgeFields: Array<keyof typeof data> = [
      "options_knowledge",
      "precious_metals_knowledge",
      "real_estate_knowledge",
      "unit_investment_trusts_knowledge",
      "variable_annuities_knowledge",
      "leveraged_inverse_etfs_knowledge",
      "complex_products_knowledge",
      "alternative_investments_knowledge",
      "other_investments_knowledge",
      "tax_bracket",
    ];
    page2KnowledgeFields.forEach((field) => {
      const val = data[field];
      if (Array.isArray(val) && val.length > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select only one option",
          path: [field as string],
        });
      }
    });

    // Government ID #1: All fields required together if any is provided
    const govId1Fields = [
      data.gov_id_1_type,
      data.gov_id_1_number,
      data.gov_id_1_country_of_issue,
      data.gov_id_1_date_of_issue,
      data.gov_id_1_date_of_expiration,
    ];
    const hasAnyGovId1 = govId1Fields.some(
      (field) => field !== null && field !== undefined && field !== ""
    );
    if (hasAnyGovId1) {
      govId1Fields.forEach((field, index) => {
        if (!field || field === "") {
          const fieldNames = [
            "gov_id_1_type",
            "gov_id_1_number",
            "gov_id_1_country_of_issue",
            "gov_id_1_date_of_issue",
            "gov_id_1_date_of_expiration",
          ];
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "All government ID fields must be completed together",
            path: [fieldNames[index]],
          });
        }
      });
    }

    // Government ID #2: All fields required together if any is provided
    const govId2Fields = [
      data.gov_id_2_type,
      data.gov_id_2_number,
      data.gov_id_2_country_of_issue,
      data.gov_id_2_date_of_issue,
      data.gov_id_2_date_of_expiration,
    ];
    const hasAnyGovId2 = govId2Fields.some(
      (field) => field !== null && field !== undefined && field !== ""
    );
    if (hasAnyGovId2) {
      govId2Fields.forEach((field, index) => {
        if (!field || field === "") {
          const fieldNames = [
            "gov_id_2_type",
            "gov_id_2_number",
            "gov_id_2_country_of_issue",
            "gov_id_2_date_of_issue",
            "gov_id_2_date_of_expiration",
          ];
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "All government ID fields must be completed together",
            path: [fieldNames[index]],
          });
        }
      });
    }

    // Government ID expiration date must be after issue date
    if (data.gov_id_1_date_of_issue && data.gov_id_1_date_of_expiration) {
      const issueDate = new Date(String(data.gov_id_1_date_of_issue));
      const expDate = new Date(String(data.gov_id_1_date_of_expiration));
      if (expDate <= issueDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expiration date must be after issue date",
          path: ["gov_id_1_date_of_expiration"],
        });
      }
    }

    if (data.gov_id_2_date_of_issue && data.gov_id_2_date_of_expiration) {
      const issueDate = new Date(String(data.gov_id_2_date_of_issue));
      const expDate = new Date(String(data.gov_id_2_date_of_expiration));
      if (expDate <= issueDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expiration date must be after issue date",
          path: ["gov_id_2_date_of_expiration"],
        });
      }
    }

    // Yes/No follow-up fields required when "Yes"
    if (data.related_to_employee_at_this_broker_dealer === "Yes") {
      if (!data.employee_name || data.employee_name === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employee Name is required",
          path: ["employee_name"],
        });
      }
      if (!data.relationship || data.relationship === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Relationship is required",
          path: ["relationship"],
        });
      }
    }

    if (data.employee_of_another_broker_dealer === "Yes") {
      if (!data.broker_dealer_name || data.broker_dealer_name === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Broker Dealer Name is required",
          path: ["broker_dealer_name"],
        });
      }
    }

    if (data.related_to_employee_at_another_broker_dealer === "Yes") {
      if (!data.broker_dealer_name_2 || data.broker_dealer_name_2 === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Broker Dealer Name is required",
          path: ["broker_dealer_name_2"],
        });
      }
      if (!data.employee_name_2 || data.employee_name_2 === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employee Name is required",
          path: ["employee_name_2"],
        });
      }
      if (!data.relationship_2 || data.relationship_2 === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Relationship is required",
          path: ["relationship_2"],
        });
      }
    }

    if (data.maintaining_other_brokerage_accounts === "Yes") {
      if (!data.with_what_firms || data.with_what_firms === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Firm name(s) are required",
          path: ["with_what_firms"],
        });
      }
      const yearsExp = data.years_of_investment_experience;
      if (!yearsExp || (typeof yearsExp === "string" && yearsExp === "") || (typeof yearsExp === "number" && yearsExp === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Years of Investment Experience is required",
          path: ["years_of_investment_experience"],
        });
      }
    }

    if (data.affiliated_with_exchange_or_finra === "Yes") {
      if (!data.what_is_the_affiliation || data.what_is_the_affiliation === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Affiliation details are required",
          path: ["what_is_the_affiliation"],
        });
      }
    }

    if (data.senior_officer_director_shareholder === "Yes") {
      if (!data.company_names || data.company_names === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company Name(s) are required",
          path: ["company_names"],
        });
      }
    }
  });

/**
 * Validate a specific page
 */
export function validatePage(pageNumber: number, formData: Record<string, any>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  // Sanitize nulls to undefined and strip nulls from arrays/objects so optional fields don't error
  const sanitizeValue = (val: any): any => {
    if (val === null) return undefined;
    if (Array.isArray(val)) {
      const cleaned = val.map((item) => sanitizeValue(item)).filter((v) => v !== undefined);
      return cleaned.length ? cleaned : undefined;
    }
    if (typeof val === "object" && val !== undefined) {
      const result: Record<string, any> = {};
      Object.entries(val).forEach(([k, v]) => {
        const sanitized = sanitizeValue(v);
        if (sanitized !== undefined) {
          result[k] = sanitized;
        }
      });
      return Object.keys(result).length ? result : undefined;
    }
    return val;
  };

  const sanitizedData: Record<string, any> = {};
  Object.entries(formData || {}).forEach(([k, v]) => {
    const sanitized = sanitizeValue(v);
    if (sanitized !== undefined) {
      sanitizedData[k] = sanitized;
    }
  });

  let schema: z.ZodTypeAny;
  
  if (pageNumber === 1) {
    schema = step1Schema;
  } else if (pageNumber === 2) {
    schema = step2Schema;
  } else {
    return { isValid: true, errors: {} };
  }

  const result = schema.safeParse(sanitizedData);
  
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((error) => {
    const path = error.path.join(".");
    errors[path] = error.message;
  });

  return { isValid: false, errors };
}

