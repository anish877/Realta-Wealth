import { z } from "zod";

/**
 * Custom Zod refinements and validation utilities
 */

/**
 * SSN validation: Accepts XXX-XX-XXXX or XXXXXXXXX format (9 digits)
 * Rejects invalid/test SSNs (000-xx-xxxx, 123-45-6789, etc.)
 */
export const ssnSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true; // Optional, use .optional() or required check separately
      const cleaned = val.replace(/-/g, "");
      if (!/^\d{9}$/.test(cleaned)) return false;
      
      // Reject invalid/test SSNs
      const area = cleaned.slice(0, 3);
      const group = cleaned.slice(3, 5);
      const serial = cleaned.slice(5);
      
      // Reject all zeros
      if (area === "000" || group === "00" || serial === "0000") return false;
      
      // Reject test SSNs (123-45-6789, 111-11-1111, etc.)
      if (cleaned === "123456789" || cleaned === "111111111" || cleaned === "000000000") return false;
      
      // Reject area numbers 000, 666, and 900-999
      const areaNum = parseInt(area, 10);
      if (areaNum === 0 || areaNum === 666 || areaNum >= 900) return false;
      
      // Reject group number 00
      if (group === "00") return false;
      
      // Reject serial number 0000
      if (serial === "0000") return false;
      
      return true;
    },
    {
      message: "SSN must be in format XXX-XX-XXXX or XXXXXXXXX (9 digits) and cannot be a test/invalid number",
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
 * Validates EIN format rules (first two digits cannot be invalid prefixes)
 */
export const einSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true; // Optional
      const cleaned = val.replace(/-/g, "");
      if (!/^\d{9}$/.test(cleaned)) return false;
      
      // EIN format validation: first two digits cannot be certain invalid prefixes
      const prefix = cleaned.slice(0, 2);
      const invalidPrefixes = ["00", "07", "08", "09", "17", "18", "19", "28", "29", "49", "69", "70", "78", "79", "88", "96", "97"];
      
      if (invalidPrefixes.includes(prefix)) {
        return false;
      }
      
      return true;
    },
    {
      message: "EIN must be in format XX-XXXXXXX (9 digits) with a valid prefix",
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
 * Enhanced with maxDaysAgo and maxDaysFuture options
 */
export const dateSchema = (options?: { 
  notFuture?: boolean; 
  notPast?: boolean; 
  minAge?: number; 
  maxAge?: number;
  maxDaysAgo?: number; // Maximum days in the past (e.g., 30 for signatures)
  maxDaysFuture?: number; // Maximum days in the future (e.g., 7300 for 20 years)
  minYear?: number; // Minimum year (e.g., 1900)
}) => {
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

  // Minimum year validation
  if (options?.minYear !== undefined) {
    schema = schema.refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return date.getFullYear() >= options.minYear!;
      },
      {
        message: `Date must be on or after ${options.minYear}`,
      }
    );
  }

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

  // Maximum days ago validation (e.g., signature dates must be recent)
  if (options?.maxDaysAgo !== undefined) {
    schema = schema.refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        const today = new Date();
        const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        return daysAgo <= options.maxDaysAgo!;
      },
      {
        message: `Date cannot be more than ${options.maxDaysAgo} days ago`,
      }
    );
  }

  // Maximum days future validation (e.g., ID expiration dates)
  if (options?.maxDaysFuture !== undefined) {
    schema = schema.refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        const today = new Date();
        const daysFuture = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysFuture <= options.maxDaysFuture!;
      },
      {
        message: `Date cannot be more than ${options.maxDaysFuture} days in the future`,
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
 * Enhanced with precision validation (2 decimal places max) and reasonable maximum
 */
export const currencySchema = (options?: { min?: number; max?: number }) => {
  const defaultMax = 999999999999; // $999,999,999,999 (999 billion)
  
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
    })
    .refine((val) => {
      // Validate precision (max 2 decimal places)
      if (typeof val === "number") {
        const str = val.toString();
        const decimalIndex = str.indexOf(".");
        if (decimalIndex !== -1) {
          return str.length - decimalIndex - 1 <= 2;
        }
      }
      return true;
    }, {
      message: "Amount cannot have more than 2 decimal places",
    });

  if (options?.min !== undefined) {
    schema = schema.refine((val) => val >= options.min!, {
      message: `Amount must be at least ${options.min}`,
    });
  }

  const maxValue = options?.max !== undefined ? options.max : defaultMax;
  schema = schema.refine((val) => val <= maxValue, {
    message: `Amount must be at most ${maxValue.toLocaleString()}`,
  });

  return schema;
};

/**
 * Email validation: Strict RFC 5322 compliant
 * Enhanced with length limit (max 254 chars per RFC)
 */
export const emailSchema = z
  .string()
  .max(254, {
    message: "Email address must be no more than 254 characters",
  })
  .email({
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
 * Enhanced with age-based validation options
 */
export const yearSchema = (options?: { 
  minYear?: number; 
  maxYear?: number;
  minAgeAtYear?: number; // Minimum age person should have been at this year (e.g., 18)
  dobYear?: number; // Date of birth year for age validation
}) => {
  const minYear = options?.minYear ?? 1900;
  const maxYear = options?.maxYear ?? new Date().getFullYear();
  
  let schema: z.ZodTypeAny = z
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
        return year >= minYear && year <= maxYear;
      },
      {
        message: `Year must be between ${minYear} and ${maxYear}`,
      }
    );

  // Age-based validation: year must be >= (DOB year + minAge)
  if (options?.minAgeAtYear !== undefined && options?.dobYear !== undefined) {
    schema = schema.refine(
      (val) => {
        if (!val) return true;
        const year = parseInt(val, 10);
        const minAllowedYear = options.dobYear! + options.minAgeAtYear!;
        return year >= minAllowedYear;
      },
      {
        message: `Year must be at least ${options.dobYear! + options.minAgeAtYear!} (person must have been ${options.minAgeAtYear} years old)`,
      }
    );
  }

  return schema;
};

/**
 * Name field schema: Strict name format (letters, spaces, hyphens, apostrophes only, 2-100 chars)
 */
export const nameFieldSchema = z
  .string()
  .trim()
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
 * General text field schema: Length limits (2-200 chars, allow alphanumeric)
 */
export const generalTextFieldSchema = z
  .string()
  .trim()
  .min(2, {
    message: "This field must be at least 2 characters",
  })
  .max(200, {
    message: "This field must be no more than 200 characters",
  });

/**
 * Occupation field schema: 2-100 chars, allow alphanumeric and common punctuation
 */
export const occupationFieldSchema = z
  .string()
  .trim()
  .min(2, {
    message: "Occupation must be at least 2 characters",
  })
  .max(100, {
    message: "Occupation must be no more than 100 characters",
  })
  .refine(
    (val) => /^[a-zA-Z0-9\s\-'.,&()]+$/.test(val),
    {
      message: "Occupation can only contain letters, numbers, spaces, and common punctuation",
    }
  );

/**
 * Business name field schema: 2-200 chars, allow alphanumeric and business characters
 */
export const businessNameFieldSchema = z
  .string()
  .trim()
  .min(2, {
    message: "Business name must be at least 2 characters",
  })
  .max(200, {
    message: "Business name must be no more than 200 characters",
  })
  .refine(
    (val) => /^[a-zA-Z0-9\s\-'.,&()/]+$/.test(val),
    {
      message: "Business name can only contain letters, numbers, spaces, and common business characters",
    }
  );

/**
 * Address line schema: No P.O. Box validation, 2-200 chars
 */
export const addressLineSchema = z
  .string()
  .trim()
  .min(2, {
    message: "Address must be at least 2 characters",
  })
  .max(200, {
    message: "Address must be no more than 200 characters",
  })
  .refine(
    (val) => {
      // Check for P.O. Box patterns (case insensitive)
      const poBoxPattern = /^(p\.?\s*o\.?\s*box|post\s*office\s*box|po\s*box)/i;
      return !poBoxPattern.test(val);
    },
    {
      message: "P.O. Box addresses are not allowed for legal addresses",
    }
  );

/**
 * City schema: Letters, spaces, hyphens, apostrophes (2-100 chars)
 */
export const citySchema = z
  .string()
  .trim()
  .min(2, {
    message: "City must be at least 2 characters",
  })
  .max(100, {
    message: "City must be no more than 100 characters",
  })
  .refine(
    (val) => /^[a-zA-Z\s\-']+$/.test(val),
    {
      message: "City can only contain letters, spaces, hyphens, and apostrophes",
    }
  );

/**
 * State/Province schema: US state validation OR international format (2-50 chars)
 */
export const stateProvinceSchema = z
  .string()
  .trim()
  .min(2, {
    message: "State/Province must be at least 2 characters",
  })
  .max(50, {
    message: "State/Province must be no more than 50 characters",
  })
  .refine(
    (val) => {
      // Allow US state codes OR international format (letters, spaces, hyphens)
      const upperVal = val.toUpperCase();
      if (usStates.includes(upperVal)) return true;
      // International format: letters, spaces, hyphens
      return /^[a-zA-Z\s\-]+$/.test(val);
    },
    {
      message: "State/Province must be a valid US state abbreviation or international format",
    }
  );

/**
 * ZIP/Postal Code schema: US format (XXXXX or XXXXX-XXXX) OR international (alphanumeric, 3-10 chars)
 */
export const zipPostalCodeSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true; // Optional
      // US format: XXXXX or XXXXX-XXXX
      if (/^\d{5}(-\d{4})?$/.test(val)) return true;
      // International format: alphanumeric, 3-10 chars
      if (/^[a-zA-Z0-9\s\-]{3,10}$/.test(val)) return true;
      return false;
    },
    {
      message: "ZIP/Postal code must be in US format (XXXXX or XXXXX-XXXX) or international format (3-10 alphanumeric characters)",
    }
  );

/**
 * Country schema: Country list validation OR free text with length limit (2-100 chars)
 * For now, allows free text - can be enhanced with country list validation
 */
export const countrySchema = z
  .string()
  .trim()
  .min(2, {
    message: "Country must be at least 2 characters",
  })
  .max(100, {
    message: "Country must be no more than 100 characters",
  })
  .refine(
    (val) => /^[a-zA-Z\s\-']+$/.test(val),
    {
      message: "Country can only contain letters, spaces, hyphens, and apostrophes",
    }
  );

/**
 * Signature schema: Minimum length validation (10 chars for typed signature)
 */
export const signatureSchema = z
  .string()
  .trim()
  .min(10, {
    message: "Signature must be at least 10 characters",
  })
  .max(500, {
    message: "Signature must be no more than 500 characters",
  });

