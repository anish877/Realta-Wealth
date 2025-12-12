import { Decimal } from "@prisma/client/runtime/library";

/**
 * Transform Prisma Decimal to number for API responses
 */
export function decimalToNumber(value: Decimal | null | undefined): number | null {
  if (!value) return null;
  return value.toNumber();
}

/**
 * Transform number to Prisma Decimal for database operations
 */
export function numberToDecimal(value: number | null | undefined): Decimal | null {
  if (value === null || value === undefined) return null;
  return new Decimal(value);
}

/**
 * Transform date to ISO string for API responses
 */
export function dateToISOString(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString();
}

/**
 * Transform ISO string to Date for database operations
 */
export function isoStringToDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  return new Date(value);
}

/**
 * Remove sensitive fields from object
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldsToRemove: string[]
): Omit<T, typeof fieldsToRemove[number]> {
  const sanitized = { ...obj };
  fieldsToRemove.forEach((field) => {
    delete sanitized[field];
  });
  return sanitized;
}

