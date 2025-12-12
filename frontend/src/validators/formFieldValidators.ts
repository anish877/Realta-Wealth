import { z } from "zod";
import {
  ssnSchema,
  einSchema,
  emailSchema,
  phoneSchema,
  dateSchema,
  currencySchema,
  zipCodeSchema,
  stateSchema,
  accountNumberSchema,
  yearSchema,
  nameFieldSchema,
  generalTextFieldSchema,
  occupationFieldSchema,
  businessNameFieldSchema,
  addressLineSchema,
  citySchema,
  stateProvinceSchema,
  zipPostalCodeSchema,
  countrySchema,
  signatureSchema,
} from "../utils/validation";

/**
 * Base field validators for form fields
 * These can be used directly or extended with .optional() or .required()
 */

/**
 * SSN field validator
 * Required when Person/Entity = "Person"
 */
export const ssnFieldSchema = ssnSchema;

/**
 * EIN field validator
 * Required when Person/Entity = "Entity"
 */
export const einFieldSchema = einSchema;

/**
 * Email field validator
 */
export const emailFieldSchema = emailSchema;

/**
 * Phone field validator (supports various formats)
 */
export const phoneFieldSchema = phoneSchema;

/**
 * Date field validator
 * Options:
 * - notFuture: Date cannot be in the future (for DOB)
 * - notPast: Date cannot be in the past (for future dates)
 * - minAge: Minimum age in years
 * - maxAge: Maximum age in years
 * - maxDaysAgo: Maximum days in the past (e.g., 30 for signatures)
 * - maxDaysFuture: Maximum days in the future (e.g., 7300 for 20 years)
 * - minYear: Minimum year (e.g., 1900)
 */
export const dateFieldSchema = (options?: { 
  notFuture?: boolean; 
  notPast?: boolean; 
  minAge?: number; 
  maxAge?: number;
  maxDaysAgo?: number;
  maxDaysFuture?: number;
  minYear?: number;
}) => dateSchema(options);

/**
 * Currency field validator
 * Options:
 * - min: Minimum value
 * - max: Maximum value
 */
export const currencyFieldSchema = (options?: { min?: number; max?: number }) => currencySchema(options);

/**
 * Zip code field validator (US format)
 */
export const zipCodeFieldSchema = zipCodeSchema;

/**
 * State field validator (US state abbreviations)
 */
export const stateFieldSchema = stateSchema;

/**
 * Account number field validator
 */
export const accountNumberFieldSchema = accountNumberSchema;

/**
 * Year field validator (4 digits, reasonable range)
 * Enhanced with age-based validation options
 */
export const yearFieldSchema = (options?: { 
  minYear?: number; 
  maxYear?: number;
  minAgeAtYear?: number;
  dobYear?: number;
}) => yearSchema(options);

/**
 * Text field validator (basic string)
 */
export const textFieldSchema = z.string();

/**
 * Required text field validator
 */
export const requiredTextFieldSchema = z.string().min(1, "This field is required");

/**
 * Number field validator
 */
export const numberFieldSchema = z.union([z.string(), z.number()]).transform((val: string | number) => {
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return val;
});

/**
 * Required number field validator
 */
export const requiredNumberFieldSchema = numberFieldSchema.refine((val: number | undefined) => val !== 0 && val !== undefined, {
  message: "This field is required",
});

/**
 * Boolean field validator (for checkboxes)
 */
export const booleanFieldSchema = z.boolean().default(false);

/**
 * Array field validator (for multicheck, etc.)
 */
export const arrayFieldSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.array(itemSchema);

/**
 * Required array field validator (min 1 item)
 */
export const requiredArrayFieldSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.array(itemSchema).min(1, "At least one selection is required");

/**
 * Enum field validator (for radio, select)
 */
export const enumFieldSchema = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values);

/**
 * Required enum field validator
 */
export const requiredEnumFieldSchema = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values, {
    required_error: "This field is required",
  });

/**
 * Conditional field validator helper
 * Returns a schema that validates based on a condition
 */
export const conditionalFieldSchema = <T extends z.ZodTypeAny>(
  schema: T,
  condition: (data: any) => boolean,
  errorMessage?: string
) => {
  return z.any().superRefine((val: any, ctx: { addIssue: (arg0: { code: any; message: any; path: any; }) => void; }) => {
    if (condition(val)) {
      const result = schema.safeParse(val);
      if (!result.success) {
        result.error.errors.forEach((err: { code: any; message: any; path: any; }) => {
          ctx.addIssue({
            code: err.code,
            message: errorMessage || err.message,
            path: err.path,
          });
        });
      }
    }
  });
};

// ============================================
// Field-Specific Validators
// ============================================

/**
 * RR Name field validator: Name format, 2-100 chars
 */
export const rrNameFieldSchema = nameFieldSchema;

/**
 * Customer Name field validator: Name format, 2-200 chars (can have multiple names)
 */
export const customerNameFieldSchema = z
  .string()
  .trim()
  .min(2, {
    message: "Customer name(s) must be at least 2 characters",
  })
  .max(200, {
    message: "Customer name(s) must be no more than 200 characters",
  })
  .refine(
    (val) => /^[a-zA-Z\s\-',.]+$/.test(val), // Allow commas and periods for multiple names
    {
      message: "Customer name(s) can only contain letters, spaces, hyphens, apostrophes, commas, and periods",
    }
  );

/**
 * Account Number field validator: Alphanumeric, 1-50 chars
 */
export const accountNumberFieldSchemaEnhanced = z
  .string()
  .trim()
  .min(1, {
    message: "Account number is required",
  })
  .max(50, {
    message: "Account number must be no more than 50 characters",
  })
  .refine(
    (val) => /^[a-zA-Z0-9]+$/.test(val),
    {
      message: "Account number must be alphanumeric",
    }
  );

/**
 * Occupation field validator: 2-100 chars, alphanumeric + punctuation
 */
export const occupationFieldSchemaEnhanced = occupationFieldSchema;

/**
 * Business Type field validator: 2-100 chars
 */
export const businessTypeFieldSchema = z
  .string()
  .trim()
  .min(2, {
    message: "Type of business must be at least 2 characters",
  })
  .max(100, {
    message: "Type of business must be no more than 100 characters",
  });

/**
 * Employer Name field validator: Business name format, 2-200 chars
 */
export const employerNameFieldSchema = businessNameFieldSchema;

/**
 * Relationship field validator: 2-50 chars, name format
 */
export const relationshipFieldSchema = z
  .string()
  .trim()
  .min(2, {
    message: "Relationship must be at least 2 characters",
  })
  .max(50, {
    message: "Relationship must be no more than 50 characters",
  })
  .refine(
    (val) => /^[a-zA-Z\s\-']+$/.test(val),
    {
      message: "Relationship can only contain letters, spaces, hyphens, and apostrophes",
    }
  );

/**
 * Company Name field validator: Business name format, 2-200 chars
 */
export const companyNameFieldSchema = businessNameFieldSchema;

/**
 * Citizenship field validator: 2-100 chars, allow country names
 */
export const citizenshipFieldSchema = z
  .string()
  .trim()
  .min(2, {
    message: "Citizenship must be at least 2 characters",
  })
  .max(100, {
    message: "Citizenship must be no more than 100 characters",
  })
  .refine(
    (val) => /^[a-zA-Z\s\-']+$/.test(val),
    {
      message: "Citizenship can only contain letters, spaces, hyphens, and apostrophes",
    }
  );

/**
 * Government ID Type field validator: Required, 2-50 chars
 */
export const governmentIdTypeFieldSchema = z
  .string()
  .trim()
  .min(2, {
    message: "ID type must be at least 2 characters",
  })
  .max(50, {
    message: "ID type must be no more than 50 characters",
  });

/**
 * Government ID Number field validator: Required, alphanumeric, 1-50 chars
 */
export const governmentIdNumberFieldSchema = z
  .string()
  .trim()
  .min(1, {
    message: "ID number is required",
  })
  .max(50, {
    message: "ID number must be no more than 50 characters",
  })
  .refine(
    (val) => /^[a-zA-Z0-9\s\-]+$/.test(val),
    {
      message: "ID number must be alphanumeric",
    }
  );

/**
 * Investment Time Horizon field validator: Date or text, validate format
 */
export const investmentTimeHorizonFieldSchema = z
  .union([
    z.string().datetime(), // ISO date format
    z.string().min(2).max(100), // Text format
  ]);

/**
 * Since Year field validator: Year with age-based validation
 */
export const sinceYearFieldSchema = (options?: { 
  minYear?: number; 
  maxYear?: number;
  minAgeAtYear?: number;
  dobYear?: number;
}) => yearSchema(options);

/**
 * Years Employed field validator: Integer, 0-100
 */
export const yearsEmployedFieldSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (typeof val === "string") {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return val;
  })
  .refine((val) => typeof val === "number" && Number.isInteger(val) && val >= 0 && val <= 100, {
    message: "Years employed must be an integer between 0 and 100",
  });

/**
 * Years Experience field validator: Integer, 0-100
 */
export const yearsExperienceFieldSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (typeof val === "string") {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return val;
  })
  .refine((val) => typeof val === "number" && Number.isInteger(val) && val >= 0 && val <= 100, {
    message: "Years of experience must be an integer between 0 and 100",
  });

/**
 * Number of Tenants field validator: Integer, 1-10
 */
export const numberOfTenantsFieldSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (typeof val === "string") {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return val;
  })
  .refine((val) => typeof val === "number" && Number.isInteger(val) && val >= 1 && val <= 10, {
    message: "Number of tenants must be an integer between 1 and 10",
  });

/**
 * RR Number field validator: Alphanumeric, 1-20 chars, optional
 */
export const rrNumberFieldSchema = z
  .string()
  .trim()
  .max(20, {
    message: "RR number must be no more than 20 characters",
  })
  .refine(
    (val) => !val || /^[a-zA-Z0-9]+$/.test(val),
    {
      message: "RR number must be alphanumeric",
    }
  )
  .optional();

/**
 * Address field validator: Address line validation, no P.O. Box, 2-200 chars
 */
export const addressFieldSchema = addressLineSchema;

/**
 * City field validator: City format validation, 2-100 chars
 */
export const cityFieldSchema = citySchema;

/**
 * State/Province field validator: US state or international format, 2-50 chars
 */
export const stateProvinceFieldSchema = stateProvinceSchema;

/**
 * ZIP/Postal Code field validator: US or international format
 */
export const zipPostalCodeFieldSchema = zipPostalCodeSchema;

/**
 * Country field validator: Country validation, 2-100 chars
 */
export const countryFieldSchema = countrySchema;

/**
 * Signature field validator: Minimum length validation
 */
export const signatureFieldSchema = signatureSchema;

/**
 * General text field validator: Length limits (2-200 chars, allow alphanumeric)
 * Re-exported from validation.ts
 */
export { generalTextFieldSchema };

