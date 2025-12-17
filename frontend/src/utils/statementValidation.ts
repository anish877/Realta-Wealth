/**
 * Validation utilities for Statement of Financial Condition form
 */

export interface CurrencyValidationOptions {
  min?: number;
  max?: number;
  required?: boolean;
  allowBlank?: boolean;
}

export interface TextValidationOptions {
  maxLength?: number;
  required?: boolean;
  pattern?: RegExp;
  trimWhitespace?: boolean;
}

export interface DateValidationOptions {
  notInFuture?: boolean;
  required?: boolean;
}

export interface SignatureValidationOptions {
  required?: boolean;
}

/**
 * Normalize currency value: strip $, commas, round to 2 decimals
 */
export function normalizeCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  
  const str = String(value);
  // Strip currency symbols, commas, and whitespace
  const cleaned = str.replace(/[$,\s]/g, "");
  
  // Parse as number
  const num = parseFloat(cleaned);
  
  if (isNaN(num)) {
    return "";
  }
  
  // Round to 2 decimals
  return num.toFixed(2);
}

/**
 * Format currency value for display: add $ and commas
 */
export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  
  const num = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return "";
  }
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Validate currency value
 */
export function validateCurrency(
  value: string | number | null | undefined,
  options: CurrencyValidationOptions = {}
): { isValid: boolean; error?: string; normalized?: string } {
  const { min = 0, max = 999999999999.99, required = false, allowBlank = true } = options;
  
  // Handle blank values
  if (value === null || value === undefined || value === "") {
    if (required) {
      return { isValid: false, error: "This field is required" };
    }
    if (allowBlank) {
      return { isValid: true, normalized: "" };
    }
  }
  
  const normalized = normalizeCurrency(value);
  
  if (normalized === "") {
    if (required) {
      return { isValid: false, error: "This field is required" };
    }
    return { isValid: true, normalized: "" };
  }
  
  const num = parseFloat(normalized);
  
  if (isNaN(num)) {
    return { isValid: false, error: "Please enter a valid number" };
  }
  
  if (num < min) {
    return { isValid: false, error: `Amount must be at least ${formatCurrency(min)}` };
  }
  
  if (num > max) {
    return { isValid: false, error: `Amount must not exceed ${formatCurrency(max)}` };
  }
  
  return { isValid: true, normalized };
}

/**
 * Validate text value
 */
export function validateText(
  value: string | null | undefined,
  options: TextValidationOptions = {}
): { isValid: boolean; error?: string; normalized?: string } {
  const {
    maxLength = 200,
    required = false,
    pattern,
    trimWhitespace = true,
  } = options;
  
  let normalized = value === null || value === undefined ? "" : String(value);
  
  if (trimWhitespace) {
    normalized = normalized.trim();
  }
  
  if (normalized === "") {
    if (required) {
      return { isValid: false, error: "This field is required" };
    }
    return { isValid: true, normalized: "" };
  }
  
  if (normalized.length > maxLength) {
    return {
      isValid: false,
      error: `This field must not exceed ${maxLength} characters`,
    };
  }
  
  if (pattern && !pattern.test(normalized)) {
    return { isValid: false, error: "This field contains invalid characters" };
  }
  
  return { isValid: true, normalized };
}

/**
 * Validate name (allows letters, spaces, periods, hyphens, apostrophes)
 */
export function validateName(
  value: string | null | undefined,
  maxLength: number = 120
): { isValid: boolean; error?: string; normalized?: string } {
  const namePattern = /^[a-zA-Z\s.\-']+$/;
  
  return validateText(value, {
    maxLength,
    pattern: namePattern,
    trimWhitespace: true,
  });
}

/**
 * Validate date value
 */
export function validateDate(
  value: string | null | undefined,
  options: DateValidationOptions = {}
): { isValid: boolean; error?: string } {
  const { notInFuture = true, required = false } = options;
  
  if (value === null || value === undefined || value === "") {
    if (required) {
      return { isValid: false, error: "This field is required" };
    }
    return { isValid: true };
  }
  
  // Validate YYYY-MM-DD format
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(value)) {
    return { isValid: false, error: "Please enter a valid date (YYYY-MM-DD)" };
  }
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: "Please enter a valid date" };
  }
  
  if (notInFuture) {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    if (date > today) {
      return { isValid: false, error: "Date cannot be in the future" };
    }
  }
  
  return { isValid: true };
}

/**
 * Validate signature value
 */
export function validateSignature(
  value: string | null | undefined,
  options: SignatureValidationOptions = {}
): { isValid: boolean; error?: string } {
  const { required = false } = options;
  
  const hasValue = value !== null && value !== undefined && value !== "";
  
  if (!hasValue && required) {
    return { isValid: false, error: "Signature is required" };
  }
  
  return { isValid: true };
}

/**
 * Validate complete signature set (signature + name + date)
 */
export function validateSignatureSet(
  signature: string | null | undefined,
  name: string | null | undefined,
  date: string | null | undefined,
  required: boolean = false
): { isValid: boolean; error?: string } {
  const hasSignature = signature !== null && signature !== undefined && signature !== "";
  const hasName = name !== null && name !== undefined && name.trim() !== "";
  const hasDate = date !== null && date !== undefined && date !== "";
  
  // If any part is present, all must be present
  if (hasSignature || hasName || hasDate) {
    if (!hasSignature) {
      return { isValid: false, error: "Signature is required when name or date is provided" };
    }
    if (!hasName) {
      return { isValid: false, error: "Printed name is required when signature is provided" };
    }
    if (!hasDate) {
      return { isValid: false, error: "Date is required when signature is provided" };
    }
  }
  
  // If required, all must be present
  if (required && (!hasSignature || !hasName || !hasDate)) {
    return {
      isValid: false,
      error: "Signature, printed name, and date must all be completed",
    };
  }
  
  return { isValid: true };
}

/**
 * Calculate total from currency fields (treats blank as 0)
 */
export function calculateTotal(
  fieldIds: string[],
  formData: Record<string, any>,
  excludeTotalField?: string
): number {
  let total = 0;
  
  for (const fieldId of fieldIds) {
    if (excludeTotalField && fieldId === excludeTotalField) {
      continue;
    }
    
    const value = formData[fieldId];
    if (value === null || value === undefined || value === "") {
      continue; // Treat blank as 0
    }
    
    const normalized = normalizeCurrency(value);
    if (normalized !== "") {
      const num = parseFloat(normalized);
      if (!isNaN(num)) {
        total += num;
      }
    }
  }
  
  return total;
}

/**
 * Validate total matches calculated sum
 */
export function validateTotalMatches(
  calculated: number,
  entered: string | number | null | undefined,
  tolerance: number = 0.01,
  message?: string
): { isValid: boolean; error?: string; difference?: number } {
  if (entered === null || entered === undefined || entered === "") {
    return { isValid: true };
  }
  
  const normalized = normalizeCurrency(entered);
  if (normalized === "") {
    return { isValid: true };
  }
  
  const enteredNum = parseFloat(normalized);
  if (isNaN(enteredNum) || isNaN(calculated)) {
    return { isValid: true }; // Let other validators handle invalid numbers
  }
  
  const difference = Math.abs(enteredNum - calculated);
  
  if (difference > tolerance) {
    return {
      isValid: false,
      error: message || "The total does not equal the sum of the line items.",
      difference,
    };
  }
  
  return { isValid: true, difference: 0 };
}

