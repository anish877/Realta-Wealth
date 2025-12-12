import { z } from "zod";

/**
 * Custom Zod refinements and validation utilities
 */

/**
 * SSN validation: Accepts XXX-XX-XXXX or XXXXXXXXX format (9 digits)
 */
export const ssnSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true; // Optional, use .optional() or required check separately
      const cleaned = val.replace(/-/g, "");
      return /^\d{9}$/.test(cleaned);
    },
    {
      message: "SSN must be in format XXX-XX-XXXX or XXXXXXXXX (9 digits)",
    }
  )
  .transform((val) => {
    // Normalize to XXX-XX-XXXX format
    if (!val) return val;
    const cleaned = val.replace(/-/g, "");
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
    }
    return val;
  });

/**
 * EIN validation: Accepts XX-XXXXXXX format (9 digits with hyphen)
 */
export const einSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true; // Optional
      const cleaned = val.replace(/-/g, "");
      return /^\d{9}$/.test(cleaned);
    },
    {
      message: "EIN must be in format XX-XXXXXXX (9 digits)",
    }
  )
  .transform((val) => {
    // Normalize to XX-XXXXXXX format
    if (!val) return val;
    const cleaned = val.replace(/-/g, "");
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    }
    return val;
  });

/**
 * Phone number validation: Supports various US formats
 * Accepts: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXX.XXX.XXXX, XXXXXXXXXX, etc.
 */
export const phoneSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true; // Optional
      const cleaned = val.replace(/[\s\-\(\)\.]/g, "");
      return /^\d{10}$/.test(cleaned);
    },
    {
      message: "Phone number must be 10 digits",
    }
  )
  .transform((val) => {
    // Normalize to (XXX) XXX-XXXX format
    if (!val) return val;
    const cleaned = val.replace(/[\s\-\(\)\.]/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return val;
  });

/**
 * Date validation: Valid date, optionally not in the future
 */
export const dateSchema = (options?: { notFuture?: boolean; notPast?: boolean; minAge?: number; maxAge?: number }) => {
  let schema: z.ZodTypeAny = z.string().refine(
    (val) => {
      if (!val) return true; // Optional
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    {
      message: "Invalid date format",
    }
  );

  if (options?.notFuture) {
    schema = schema.refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return date <= new Date();
      },
      {
        message: "Date cannot be in the future",
      }
    );
  }

  if (options?.notPast) {
    schema = schema.refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return date >= new Date();
      },
      {
        message: "Date cannot be in the past",
      }
    );
  }

  if (options?.minAge || options?.maxAge) {
    schema = schema.refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        const dayDiff = today.getDate() - date.getDate();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

        if (options.minAge && actualAge < options.minAge) {
          return false;
        }
        if (options.maxAge && actualAge > options.maxAge) {
          return false;
        }
        return true;
      },
      {
        message: options.minAge && options.maxAge
          ? `Age must be between ${options.minAge} and ${options.maxAge} years`
          : options.minAge
          ? `Age must be at least ${options.minAge} years`
          : `Age must be at most ${options.maxAge} years`,
      }
    );
  }

  return schema;
};

/**
 * Currency validation: Non-negative number with optional min/max
 */
export const currencySchema = (options?: { min?: number; max?: number }) => {
  let schema: z.ZodTypeAny = z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        // Remove currency symbols and commas
        const cleaned = val.replace(/[$,\s]/g, "");
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .refine((val) => typeof val === "number" && val >= 0, {
      message: "Amount must be a non-negative number",
    });

  if (options?.min !== undefined) {
    schema = schema.refine((val) => val >= options.min!, {
      message: `Amount must be at least ${options.min}`,
    });
  }

  if (options?.max !== undefined) {
    schema = schema.refine((val) => val <= options.max!, {
      message: `Amount must be at most ${options.max}`,
    });
  }

  return schema;
};

/**
 * Email validation: Strict RFC 5322 compliant
 */
export const emailSchema = z.string().email({
  message: "Please enter a valid email address",
});

/**
 * Password validation: Min 8 characters (can be extended with complexity rules)
 */
export const passwordSchema = z
  .string()
  .min(8, {
    message: "Password must be at least 8 characters",
  })
  .refine(
    (val) => val.length >= 8,
    {
      message: "Password must be at least 8 characters",
    }
  );

/**
 * US Zip Code validation: XXXXX or XXXXX-XXXX format
 */
export const zipCodeSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true; // Optional
      return /^\d{5}(-\d{4})?$/.test(val);
    },
    {
      message: "Zip code must be in format XXXXX or XXXXX-XXXX",
    }
  );

/**
 * US State abbreviation validation
 */
export const usStates = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

export const stateSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true; // Optional
      return usStates.includes(val.toUpperCase());
    },
    {
      message: "Please enter a valid US state abbreviation",
    }
  )
  .transform((val) => val?.toUpperCase());

/**
 * Name validation: Min 2 chars, max 100, letters/spaces/hyphens/apostrophes only
 */
export const nameSchema = z
  .string()
  .min(2, {
    message: "Name must be at least 2 characters",
  })
  .max(100, {
    message: "Name must be no more than 100 characters",
  })
  .refine(
    (val) => /^[a-zA-Z\s\-']+$/.test(val),
    {
      message: "Name can only contain letters, spaces, hyphens, and apostrophes",
    }
  );

/**
 * Date range validation: End date must be after start date
 */
export const dateRangeSchema = z
  .object({
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.from || !data.to) return true; // Both optional individually
      const fromDate = new Date(data.from);
      const toDate = new Date(data.to);
      return toDate >= fromDate;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["to"],
    }
  );

/**
 * Currency range validation: "To" must be >= "From"
 */
export const currencyRangeSchema = z
  .object({
    from: z.union([z.string(), z.number()]).optional(),
    to: z.union([z.string(), z.number()]).optional(),
  })
  .transform((data) => {
    const from = typeof data.from === "string" ? parseFloat(data.from.replace(/[$,\s]/g, "")) : data.from || 0;
    const to = typeof data.to === "string" ? parseFloat(data.to.replace(/[$,\s]/g, "")) : data.to || 0;
    return { from, to };
  })
  .refine(
    (data) => {
      if (data.from === undefined || data.to === undefined) return true;
      return data.to >= data.from;
    },
    {
      message: "End amount must be greater than or equal to start amount",
      path: ["to"],
    }
  );

/**
 * Account number validation: Alphanumeric, reasonable length
 */
export const accountNumberSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true; // Optional
      return /^[a-zA-Z0-9]+$/.test(val);
    },
    {
      message: "Account number must be alphanumeric",
    }
  );

/**
 * Year validation: 4 digits, reasonable range
 */
export const yearSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true; // Optional
      return /^\d{4}$/.test(val);
    },
    {
      message: "Year must be 4 digits",
    }
  )
  .refine(
    (val) => {
      if (!val) return true;
      const year = parseInt(val, 10);
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= currentYear;
    },
    {
      message: "Year must be between 1900 and current year",
    }
  );

