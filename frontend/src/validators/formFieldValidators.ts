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
 */
export const dateFieldSchema = (options?: { notFuture?: boolean; notPast?: boolean; minAge?: number; maxAge?: number }) =>
  dateSchema(options);

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
 */
export const yearFieldSchema = yearSchema;

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

