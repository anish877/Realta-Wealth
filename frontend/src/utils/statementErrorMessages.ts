/**
 * Error and warning messages for Statement of Financial Condition form
 */

export const STATEMENT_ERROR_MESSAGES = {
  // Hard errors
  TOTAL_MISMATCH: "The total does not equal the sum of the line items.",
  NEGATIVE_NOT_ALLOWED: "Amounts must be 0 or greater.",
  SIGNATURE_SET_INCOMPLETE: "Signature, printed name, and date must all be completed for this signer.",
  REQUIRED_FIELD: "This field is required.",
  INVALID_CURRENCY: "Please enter a valid amount.",
  INVALID_DATE: "Please enter a valid date.",
  DATE_IN_FUTURE: "Date cannot be in the future.",
  INVALID_TEXT: "This field contains invalid characters.",
  MAX_LENGTH_EXCEEDED: (maxLength: number) => `This field must not exceed ${maxLength} characters.`,
  
  // Warnings
  MANUAL_OVERRIDE_DIFFERENCE: (difference: string) => 
    `This value differs from the calculated amount by ${difference}. Please confirm it is correct.`,
  
  // Field-specific messages
  CUSTOMER_NAMES_REQUIRED: "Customer name(s) is required.",
  SIGNATURE_REQUIRED: "Signature is required.",
  PRINTED_NAME_REQUIRED: "Printed name is required.",
  DATE_REQUIRED: "Date is required.",
  JOINT_OWNER_SIGNATURE_REQUIRED: "Joint owner signature is required for joint accounts.",
  
  // Paired entry rule
  PAIRED_ENTRY_NAME_REQUIRED: "Item name is required when purchase amount/value is provided.",
  PAIRED_ENTRY_AMOUNT_REQUIRED: "Purchase amount/value is required when item name is provided.",
  
  // Total validation
  TOTAL_LIQUID_ASSETS_MISMATCH: "Total liquid assets does not equal the sum of the line items.",
  TOTAL_LIABILITIES_MISMATCH: "Total liabilities does not equal the sum of the line items.",
  TOTAL_ILLIQUID_ASSETS_MISMATCH: "Total illiquid assets does not equal the sum of the line items.",
  TOTAL_QUALIFIED_ASSETS_MISMATCH: "Total liquid qualified assets does not equal the sum of the line items.",
  TOTAL_INCOME_MISMATCH: "Total annual income does not equal the sum of the line items.",
  
  // Currency validation
  CURRENCY_MIN: (min: string) => `Amount must be at least ${min}.`,
  CURRENCY_MAX: (max: string) => `Amount must not exceed ${max}.`,
  
  // Net worth warnings
  ASSETS_MANUAL_OVERRIDE: "Total assets value differs from calculated amount.",
  NET_WORTH_MANUAL_OVERRIDE: "Total net worth value differs from calculated amount.",
  LIQUIDITY_MANUAL_OVERRIDE: "Total potential liquidity differs from calculated amount.",
} as const;

/**
 * Get error message for a field
 */
export function getErrorMessage(
  errorCode: keyof typeof STATEMENT_ERROR_MESSAGES,
  ...args: unknown[]
): string {
  const message = STATEMENT_ERROR_MESSAGES[errorCode];
  
  if (typeof message === "function") {
    return (message as (...args: unknown[]) => string)(...args);
  }
  
  return message as string;
}

/**
 * Error message categories
 */
export const ERROR_CATEGORIES = {
  HARD_ERROR: "hard_error",
  WARNING: "warning",
} as const;

/**
 * Error type mapping
 */
export const ERROR_TYPES = {
  TOTAL_MISMATCH: ERROR_CATEGORIES.HARD_ERROR,
  NEGATIVE_NOT_ALLOWED: ERROR_CATEGORIES.HARD_ERROR,
  SIGNATURE_SET_INCOMPLETE: ERROR_CATEGORIES.HARD_ERROR,
  REQUIRED_FIELD: ERROR_CATEGORIES.HARD_ERROR,
  INVALID_CURRENCY: ERROR_CATEGORIES.HARD_ERROR,
  INVALID_DATE: ERROR_CATEGORIES.HARD_ERROR,
  DATE_IN_FUTURE: ERROR_CATEGORIES.HARD_ERROR,
  INVALID_TEXT: ERROR_CATEGORIES.HARD_ERROR,
  MAX_LENGTH_EXCEEDED: ERROR_CATEGORIES.HARD_ERROR,
  MANUAL_OVERRIDE_DIFFERENCE: ERROR_CATEGORIES.WARNING,
  ASSETS_MANUAL_OVERRIDE: ERROR_CATEGORIES.WARNING,
  NET_WORTH_MANUAL_OVERRIDE: ERROR_CATEGORIES.WARNING,
  LIQUIDITY_MANUAL_OVERRIDE: ERROR_CATEGORIES.WARNING,
} as const;

