import { z } from "zod";
import {
  normalizeCurrency,
  validateCurrency,
  validateText,
  validateDate,
  validateSignature,
  validateSignatureSet,
  calculateTotal,
  validateTotalMatches,
} from "../utils/statementValidation";

/**
 * Frontend Zod schemas for the Statement of Financial Condition form.
 * These work on the validator field IDs produced by statementFieldMapping.
 */

// Categories and signatures mirror backend enums, but using string literals on the frontend
export const statementRowCategorySchema = z.enum([
  "liquid_non_qualified",
  "liabilities",
  "net_worth",
  "illiquid_non_qualified",
  "liquid_qualified",
  "income_summary",
  "illiquid_qualified",
]);

export const statementSignatureTypeSchema = z.enum([
  "account_owner",
  "joint_account_owner",
  "financial_professional",
  "registered_principal",
]);

export const financialRowSchema = z.object({
  category: statementRowCategorySchema,
  rowKey: z.string().min(1, "rowKey is required"),
  value: z.string().transform((val) => normalizeCurrency(val)),
});

/**
 * Base field validators for Statement of Financial Condition form
 */

// Currency field schema
export function currencyFieldSchema(min: number = 0, max: number = 999999999999.99, required: boolean = false): z.ZodTypeAny {
  const baseSchema = z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === null || val === undefined || val === "") {
        return "";
      }
      return normalizeCurrency(val);
    })
    .refine(
      (val: string) => {
        if (val === "") {
          return !required;
        }
        const num = parseFloat(val);
        return !isNaN(num) && num >= min && num <= max;
      },
      {
        message: required
          ? `Please enter a valid amount between ${min.toLocaleString()} and ${max.toLocaleString()}`
          : `Amount must be between ${min.toLocaleString()} and ${max.toLocaleString()}`,
      }
    );

  if (required) {
    return baseSchema.refine((val: string) => val !== "", {
      message: "This field is required",
    }) as z.ZodTypeAny;
  }

  return baseSchema as z.ZodTypeAny;
}

// Text field schema
export function textFieldSchema(maxLength: number = 200, required: boolean = false, pattern?: RegExp): z.ZodTypeAny {
  let schema: z.ZodString = z
    .string()
    .trim()
    .max(maxLength, `This field must not exceed ${maxLength} characters`);

  if (pattern) {
    schema = schema.regex(pattern, "This field contains invalid characters");
  }

  if (required) {
    return schema.min(1, "This field is required") as z.ZodTypeAny;
  } else {
    return z.union([schema.optional(), z.literal("")]) as z.ZodTypeAny;
  }
}

// Date field schema
export function dateFieldSchema(notInFuture: boolean = true, required: boolean = false): z.ZodTypeAny {
  let schema: z.ZodEffects<z.ZodString, string, string> = z.string().refine(
    (val: string) => {
      if (val === "" && !required) {
        return true;
      }
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(val)) {
        return false;
      }
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        return false;
      }
      if (notInFuture) {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return date <= today;
      }
      return true;
    },
    {
      message: notInFuture
        ? "Please enter a valid date that is not in the future"
        : "Please enter a valid date (YYYY-MM-DD)",
    }
  );

  if (required) {
    return schema.refine((val: string) => val.length > 0, {
      message: "This field is required",
    }) as z.ZodTypeAny;
  } else {
    return z.union([schema.optional(), z.literal("")]) as z.ZodTypeAny;
  }
}

// Signature field schema
export function signatureFieldSchema(required: boolean = false): z.ZodTypeAny {
  if (required) {
    return z.string().min(1, "Signature is required") as z.ZodTypeAny;
  } else {
    return z.union([z.string().optional(), z.literal("")]) as z.ZodTypeAny;
  }
}

/**
 * Group-level validators
 */

// Account Registration
export const accountRegistrationSchema = z.object({
  rr_name: textFieldSchema(120, false),
  rr_no: textFieldSchema(50, false),
  customer_names: textFieldSchema(500, true),
  account_type: z.enum(["Individual", "Joint"]).optional(),
  has_joint_owner: z.boolean().optional(),
});

// Liquid Non-Qualified Assets table
export const liquidNonQualifiedAssetsSchema = z
  .object({
    lnqa_cash: currencyFieldSchema(0, 999999999999.99, false),
    lnqa_brokerage_nonmanaged: currencyFieldSchema(0, 999999999999.99, false),
    lnqa_managed_accounts: currencyFieldSchema(0, 999999999999.99, false),
    lnqa_mutual_funds_direct: currencyFieldSchema(0, 999999999999.99, false),
    lnqa_annuities_less_surrender: currencyFieldSchema(0, 999999999999.99, false),
    lnqa_cash_value_life: currencyFieldSchema(0, 999999999999.99, false),
    lnqa_other_business_collectibles: currencyFieldSchema(0, 999999999999.99, false),
    lnqa_total_liquid_assets: currencyFieldSchema(0, 999999999999.99, false),
  })
  .superRefine((data, ctx) => {
    const fieldIds = [
      "lnqa_cash",
      "lnqa_brokerage_nonmanaged",
      "lnqa_managed_accounts",
      "lnqa_mutual_funds_direct",
      "lnqa_annuities_less_surrender",
      "lnqa_cash_value_life",
      "lnqa_other_business_collectibles",
    ];
    
    const calculated = calculateTotal(fieldIds, data, "lnqa_total_liquid_assets");
    const entered = data.lnqa_total_liquid_assets;
    
    const validation = validateTotalMatches(calculated, entered, 0.01);
    if (!validation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.error || "The total does not equal the sum of the line items.",
        path: ["lnqa_total_liquid_assets"],
      });
    }
  });

// Liabilities table
export const liabilitiesSchema = z
  .object({
    liab_mortgage_primary_residence: currencyFieldSchema(0, 999999999999.99, false),
    liab_mortgages_secondary_investment: currencyFieldSchema(0, 999999999999.99, false),
    liab_home_equity_loans: currencyFieldSchema(0, 999999999999.99, false),
    liab_credit_cards: currencyFieldSchema(0, 999999999999.99, false),
    liab_other: currencyFieldSchema(0, 999999999999.99, false),
    liab_total: currencyFieldSchema(0, 999999999999.99, false),
  })
  .superRefine((data, ctx) => {
    const fieldIds = [
      "liab_mortgage_primary_residence",
      "liab_mortgages_secondary_investment",
      "liab_home_equity_loans",
      "liab_credit_cards",
      "liab_other",
    ];
    
    const calculated = calculateTotal(fieldIds, data, "liab_total");
    const entered = data.liab_total;
    
    const validation = validateTotalMatches(calculated, entered, 0.01);
    if (!validation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.error || "The total does not equal the sum of the line items.",
        path: ["liab_total"],
      });
    }
  });

// Illiquid Non-Qualified Assets table
export const illiquidNonQualifiedAssetsSchema = z
  .object({
    inqa_primary_residence_value_equity: currencyFieldSchema(0, 999999999999.99, false),
    inqa_investment_real_estate_value_equity: currencyFieldSchema(0, 999999999999.99, false),
    inqa_private_business_value_equity: currencyFieldSchema(0, 999999999999.99, false),
    inqa_total_illiquid_assets_equity: currencyFieldSchema(0, 999999999999.99, false),
  })
  .superRefine((data, ctx) => {
    const fieldIds = [
      "inqa_primary_residence_value_equity",
      "inqa_investment_real_estate_value_equity",
      "inqa_private_business_value_equity",
    ];
    
    const calculated = calculateTotal(fieldIds, data, "inqa_total_illiquid_assets_equity");
    const entered = data.inqa_total_illiquid_assets_equity;
    
    const validation = validateTotalMatches(calculated, entered, 0.01);
    if (!validation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.error || "The total does not equal the sum of the line items.",
        path: ["inqa_total_illiquid_assets_equity"],
      });
    }
  });

// Liquid Qualified Assets table
export const liquidQualifiedAssetsSchema = z
  .object({
    lqa_cash: currencyFieldSchema(0, 999999999999.99, false),
    lqa_retirement_plans: currencyFieldSchema(0, 999999999999.99, false),
    lqa_brokerage_nonmanaged: currencyFieldSchema(0, 999999999999.99, false),
    lqa_managed_accounts: currencyFieldSchema(0, 999999999999.99, false),
    lqa_mutual_funds_direct: currencyFieldSchema(0, 999999999999.99, false),
    lqa_annuities: currencyFieldSchema(0, 999999999999.99, false),
    lqa_total: currencyFieldSchema(0, 999999999999.99, false),
  })
  .superRefine((data, ctx) => {
    const fieldIds = [
      "lqa_cash",
      "lqa_retirement_plans",
      "lqa_brokerage_nonmanaged",
      "lqa_managed_accounts",
      "lqa_mutual_funds_direct",
      "lqa_annuities",
    ];
    
    const calculated = calculateTotal(fieldIds, data, "lqa_total");
    const entered = data.lqa_total;
    
    const validation = validateTotalMatches(calculated, entered, 0.01);
    if (!validation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.error || "The total does not equal the sum of the line items.",
        path: ["lqa_total"],
      });
    }
  });

// Income Summary table
export const incomeSummarySchema = z
  .object({
    inc_salary_commissions: currencyFieldSchema(0, 999999999999.99, false),
    inc_investment_income: currencyFieldSchema(0, 999999999999.99, false),
    inc_pension: currencyFieldSchema(0, 999999999999.99, false),
    inc_social_security: currencyFieldSchema(0, 999999999999.99, false),
    inc_net_rental_income: currencyFieldSchema(0, 999999999999.99, false),
    inc_other: currencyFieldSchema(0, 999999999999.99, false),
    inc_total_annual_income: currencyFieldSchema(0, 999999999999.99, false),
  })
  .superRefine((data, ctx) => {
    const fieldIds = [
      "inc_salary_commissions",
      "inc_investment_income",
      "inc_pension",
      "inc_social_security",
      "inc_net_rental_income",
      "inc_other",
    ];
    
    const calculated = calculateTotal(fieldIds, data, "inc_total_annual_income");
    const entered = data.inc_total_annual_income;
    
    const validation = validateTotalMatches(calculated, entered, 0.01);
    if (!validation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.error || "The total does not equal the sum of the line items.",
        path: ["inc_total_annual_income"],
      });
    }
  });

// Illiquid Qualified Assets (repeatable rows)
export const illiquidQualifiedAssetsRowSchema = z
  .object({
    iqa_item_name: textFieldSchema(200, false),
    iqa_purchase_amount_value: currencyFieldSchema(0, 999999999999.99, false),
  })
  .superRefine((data, ctx) => {
    // Paired entry rule: if name filled, amount required; if amount filled, name required
    const hasName = data.iqa_item_name && data.iqa_item_name.trim() !== "";
    const hasAmount = data.iqa_purchase_amount_value && data.iqa_purchase_amount_value !== "";

    if (hasName && !hasAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Purchase amount/value is required when item name is provided",
        path: ["iqa_purchase_amount_value"],
      });
    }

    if (hasAmount && !hasName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Item name is required when purchase amount/value is provided",
        path: ["iqa_item_name"],
      });
    }
  });

export const illiquidQualifiedAssetsSchema = z
  .object({
    iqa_rows: z.array(illiquidQualifiedAssetsRowSchema).optional(),
    iqa_total: currencyFieldSchema(0, 999999999999.99, false),
  })
  .superRefine((data, ctx) => {
    // Calculate total from all rows
    const rows = data.iqa_rows || [];
    let calculated = 0;
    
    for (const row of rows) {
      const value = row.iqa_purchase_amount_value;
      if (value !== null && value !== undefined && value !== "") {
        const normalized = normalizeCurrency(String(value));
        if (normalized !== "") {
          const num = parseFloat(normalized);
          if (!isNaN(num)) {
            calculated += num;
          }
        }
      }
    }
    
    // Also check for static rows (illiquid_qualified_assets_illiquid_qualified_1, 2, etc.)
    // These would be in the formData but not in iqa_rows
    // For now, we validate based on iqa_rows array
    
    const entered = data.iqa_total;
    const validation = validateTotalMatches(calculated, entered, 0.01);
    if (!validation.isValid && calculated > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.error || "The total does not equal the sum of the line items.",
        path: ["iqa_total"],
      });
    }
  });

// Net Worth
export const netWorthSchema = z
  .object({
    nw_total_assets_less_primary_residence: currencyFieldSchema(0, 999999999999.99, false),
    nw_total_liabilities: currencyFieldSchema(0, 999999999999.99, false),
    nw_total_net_worth_assets_less_pr_minus_liab: currencyFieldSchema(undefined, undefined, false),
    nw_total_illiquid_securities: currencyFieldSchema(0, 999999999999.99, false),
    nw_total_net_worth_final: currencyFieldSchema(undefined, undefined, false),
    nw_total_potential_liquidity: currencyFieldSchema(0, 999999999999.99, false),
    // Include source fields for calculation
    lnqa_total_liquid_assets: currencyFieldSchema(0, 999999999999.99, false),
    lqa_total: currencyFieldSchema(0, 999999999999.99, false),
    inqa_investment_real_estate_value_equity: currencyFieldSchema(0, 999999999999.99, false),
    inqa_private_business_value_equity: currencyFieldSchema(0, 999999999999.99, false),
    liab_total: currencyFieldSchema(0, 999999999999.99, false),
    iqa_rows: z.array(z.any()).optional(),
  })
  .superRefine((data, ctx) => {
    // Calculate totals inline to avoid circular dependencies
    // Total Assets (less primary residence) = lnqa_total + lqa_total + inqa_investment_real_estate + inqa_private_business + iqa_total
    const lnqaTotal = parseFloat(normalizeCurrency(String(data.lnqa_total_liquid_assets || ""))) || 0;
    const lqaTotal = parseFloat(normalizeCurrency(String(data.lqa_total || ""))) || 0;
    const inqaInvestmentRealEstate = parseFloat(normalizeCurrency(String(data.inqa_investment_real_estate_value_equity || ""))) || 0;
    const inqaPrivateBusiness = parseFloat(normalizeCurrency(String(data.inqa_private_business_value_equity || ""))) || 0;
    
    // Calculate iqa_total from rows
    let iqaTotal = 0;
    const iqaRows = data.iqa_rows || [];
    for (const row of iqaRows) {
      const value = (row as any).iqa_purchase_amount_value;
      if (value !== null && value !== undefined && value !== "") {
        const normalized = normalizeCurrency(String(value));
        if (normalized !== "") {
          const num = parseFloat(normalized);
          if (!isNaN(num)) {
            iqaTotal += num;
          }
        }
      }
    }
    
    const calculatedAssets = lnqaTotal + lqaTotal + inqaInvestmentRealEstate + inqaPrivateBusiness + iqaTotal;
    
    // Validate nw_total_assets_less_primary_residence
    const enteredAssets = data.nw_total_assets_less_primary_residence;
    const assetsValidation = validateTotalMatches(calculatedAssets, enteredAssets, 0.01);
    if (!assetsValidation.isValid && calculatedAssets > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: assetsValidation.error || `Total Assets (less primary residence) should be ${calculatedAssets.toFixed(2)}.`,
        path: ["nw_total_assets_less_primary_residence"],
      });
    }
    
    // Validate nw_total_net_worth_assets_less_pr_minus_liab = assets - liabilities
    const liabTotal = parseFloat(normalizeCurrency(String(data.liab_total || ""))) || 0;
    const calculatedNetWorth = calculatedAssets - liabTotal;
    const enteredNetWorth = data.nw_total_net_worth_assets_less_pr_minus_liab;
    const netWorthValidation = validateTotalMatches(calculatedNetWorth, enteredNetWorth, 0.01);
    if (!netWorthValidation.isValid && (calculatedNetWorth !== 0 || enteredNetWorth)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: netWorthValidation.error || `Total Net Worth (Assets less PR - Liabilities) should be ${calculatedNetWorth.toFixed(2)}.`,
        path: ["nw_total_net_worth_assets_less_pr_minus_liab"],
      });
    }
    
    // Validate nw_total_net_worth_final = net worth + illiquid securities
    const illiquidSecurities = parseFloat(normalizeCurrency(String(data.nw_total_illiquid_securities || ""))) || 0;
    const calculatedFinal = calculatedNetWorth + illiquidSecurities;
    const enteredFinal = data.nw_total_net_worth_final;
    const finalValidation = validateTotalMatches(calculatedFinal, enteredFinal, 0.01);
    if (!finalValidation.isValid && (calculatedFinal !== 0 || enteredFinal)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: finalValidation.error || `Total Net Worth should be ${calculatedFinal.toFixed(2)}.`,
        path: ["nw_total_net_worth_final"],
      });
    }
    
    // Validate nw_total_potential_liquidity = lnqa_total + lqa_total
    const calculatedLiquidity = lnqaTotal + lqaTotal;
    const enteredLiquidity = data.nw_total_potential_liquidity;
    const liquidityValidation = validateTotalMatches(calculatedLiquidity, enteredLiquidity, 0.01);
    if (!liquidityValidation.isValid && calculatedLiquidity > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: liquidityValidation.error || `Total Potential Liquidity should be ${calculatedLiquidity.toFixed(2)}.`,
        path: ["nw_total_potential_liquidity"],
      });
    }
    
    // Validate nw_total_liabilities matches liab_total (they should be the same)
    const nwLiabilities = parseFloat(normalizeCurrency(String(data.nw_total_liabilities || ""))) || 0;
    if (liabTotal > 0 && nwLiabilities > 0 && Math.abs(liabTotal - nwLiabilities) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Total Liabilities should match the Liabilities table total (${liabTotal.toFixed(2)}).`,
        path: ["nw_total_liabilities"],
      });
    }
  });

// Notes
export const notesSchema = z.object({
  notes: textFieldSchema(4000, false),
  additional_notes: textFieldSchema(8000, false),
});

// Signatures
export const signaturesSchema = z
  .object({
    sig_account_owner_signature: signatureFieldSchema(true),
    sig_account_owner_printed_name: textFieldSchema(120, true),
    sig_account_owner_date: dateFieldSchema(true, true),

    sig_joint_owner_signature: signatureFieldSchema(false),
    sig_joint_owner_printed_name: textFieldSchema(120, false),
    sig_joint_owner_date: dateFieldSchema(true, false),

    sig_financial_professional_signature: signatureFieldSchema(true),
    sig_financial_professional_printed_name: textFieldSchema(120, true),
    sig_financial_professional_date: dateFieldSchema(true, true),

    sig_registered_principal_signature: signatureFieldSchema(true),
    sig_registered_principal_printed_name: textFieldSchema(120, true),
    sig_registered_principal_date: dateFieldSchema(true, true),

    has_joint_owner: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate signature sets (signature + name + date must be complete)
    const signatureSets = [
      {
        signature: data.sig_account_owner_signature,
        name: data.sig_account_owner_printed_name,
        date: data.sig_account_owner_date,
        required: true,
        prefix: "sig_account_owner",
      },
      {
        signature: data.sig_joint_owner_signature,
        name: data.sig_joint_owner_printed_name,
        date: data.sig_joint_owner_date,
        required: data.has_joint_owner === true,
        prefix: "sig_joint_owner",
      },
      {
        signature: data.sig_financial_professional_signature,
        name: data.sig_financial_professional_printed_name,
        date: data.sig_financial_professional_date,
        required: true,
        prefix: "sig_financial_professional",
      },
      {
        signature: data.sig_registered_principal_signature,
        name: data.sig_registered_principal_printed_name,
        date: data.sig_registered_principal_date,
        required: true,
        prefix: "sig_registered_principal",
      },
    ];

    for (const set of signatureSets) {
      const validation = validateSignatureSet(
        set.signature,
        set.name,
        set.date,
        set.required
      );

      if (!validation.isValid) {
        // Add issue to the first missing field
        if (!set.signature || set.signature === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: validation.error || "Signature, printed name, and date must all be completed",
            path: [`${set.prefix}_signature`],
          });
        } else if (!set.name || set.name.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: validation.error || "Signature, printed name, and date must all be completed",
            path: [`${set.prefix}_printed_name`],
          });
        } else if (!set.date || set.date === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: validation.error || "Signature, printed name, and date must all be completed",
            path: [`${set.prefix}_date`],
          });
        }
      }
    }
  });

/**
 * Step/page validators
 * Using explicit object definition to avoid ZodEffects merge issues
 */
export const step1Schema: z.ZodTypeAny = z.object({
  // Account Registration
  rr_name: textFieldSchema(120, false),
  rr_no: textFieldSchema(50, false),
  customer_names: textFieldSchema(500, true),
  account_type: z.enum(["Individual", "Joint"]).optional(),
  has_joint_owner: z.boolean().optional(),
  // Liquid Non-Qualified Assets
  lnqa_cash: currencyFieldSchema(0, 999999999999.99, false),
  lnqa_brokerage_nonmanaged: currencyFieldSchema(0, 999999999999.99, false),
  lnqa_managed_accounts: currencyFieldSchema(0, 999999999999.99, false),
  lnqa_mutual_funds_direct: currencyFieldSchema(0, 999999999999.99, false),
  lnqa_annuities_less_surrender: currencyFieldSchema(0, 999999999999.99, false),
  lnqa_cash_value_life: currencyFieldSchema(0, 999999999999.99, false),
  lnqa_other_business_collectibles: currencyFieldSchema(0, 999999999999.99, false),
  lnqa_total_liquid_assets: currencyFieldSchema(0, 999999999999.99, false),
  // Liabilities
  liab_mortgage_primary_residence: currencyFieldSchema(0, 999999999999.99, false),
  liab_mortgages_secondary_investment: currencyFieldSchema(0, 999999999999.99, false),
  liab_home_equity_loans: currencyFieldSchema(0, 999999999999.99, false),
  liab_credit_cards: currencyFieldSchema(0, 999999999999.99, false),
  liab_other: currencyFieldSchema(0, 999999999999.99, false),
  liab_total: currencyFieldSchema(0, 999999999999.99, false),
  // Illiquid Non-Qualified Assets
  inqa_primary_residence_value_equity: currencyFieldSchema(0, 999999999999.99, false),
  inqa_investment_real_estate_value_equity: currencyFieldSchema(0, 999999999999.99, false),
  inqa_private_business_value_equity: currencyFieldSchema(0, 999999999999.99, false),
  inqa_total_illiquid_assets_equity: currencyFieldSchema(0, 999999999999.99, false),
  // Liquid Qualified Assets
  lqa_cash: currencyFieldSchema(0, 999999999999.99, false),
  lqa_retirement_plans: currencyFieldSchema(0, 999999999999.99, false),
  lqa_brokerage_nonmanaged: currencyFieldSchema(0, 999999999999.99, false),
  lqa_managed_accounts: currencyFieldSchema(0, 999999999999.99, false),
  lqa_mutual_funds_direct: currencyFieldSchema(0, 999999999999.99, false),
  lqa_annuities: currencyFieldSchema(0, 999999999999.99, false),
  lqa_total: currencyFieldSchema(0, 999999999999.99, false),
  // Income Summary
  inc_salary_commissions: currencyFieldSchema(0, 999999999999.99, false),
  inc_investment_income: currencyFieldSchema(0, 999999999999.99, false),
  inc_pension: currencyFieldSchema(0, 999999999999.99, false),
  inc_social_security: currencyFieldSchema(0, 999999999999.99, false),
  inc_net_rental_income: currencyFieldSchema(0, 999999999999.99, false),
  inc_other: currencyFieldSchema(0, 999999999999.99, false),
  inc_total_annual_income: currencyFieldSchema(0, 999999999999.99, false),
  // Illiquid Qualified Assets
  iqa_rows: z.array(illiquidQualifiedAssetsRowSchema).optional(),
  iqa_total: currencyFieldSchema(0, 999999999999.99, false),
  // Net Worth
  nw_total_assets_less_primary_residence: currencyFieldSchema(0, 999999999999.99, false),
  nw_total_liabilities: currencyFieldSchema(0, 999999999999.99, false),
  nw_total_net_worth_assets_less_pr_minus_liab: currencyFieldSchema(0, 999999999999.99, false),
  nw_total_illiquid_securities: currencyFieldSchema(0, 999999999999.99, false),
  nw_total_net_worth_final: currencyFieldSchema(0, 999999999999.99, false),
  nw_total_potential_liquidity: currencyFieldSchema(0, 999999999999.99, false),
  // Notes
  notes: textFieldSchema(4000, false),
}).superRefine((data, ctx) => {
  // Validate totals match sums
  const totalMismatches = validateTotalMismatches(data as any);
  Object.entries(totalMismatches.errors).forEach(([field, message]) => {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message,
      path: [field],
    });
  });
});

export const step2Schema: z.ZodTypeAny = z.object({
  additional_notes: textFieldSchema(8000, false),
  sig_account_owner_signature: signatureFieldSchema(true),
  sig_account_owner_printed_name: textFieldSchema(120, true),
  sig_account_owner_date: dateFieldSchema(true, true),
  sig_joint_owner_signature: signatureFieldSchema(false),
  sig_joint_owner_printed_name: textFieldSchema(120, false),
  sig_joint_owner_date: dateFieldSchema(true, false),
  sig_financial_professional_signature: signatureFieldSchema(true),
  sig_financial_professional_printed_name: textFieldSchema(120, true),
  sig_financial_professional_date: dateFieldSchema(true, true),
  sig_registered_principal_signature: signatureFieldSchema(true),
  sig_registered_principal_printed_name: textFieldSchema(120, true),
  sig_registered_principal_date: dateFieldSchema(true, true),
  has_joint_owner: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // Validate signature completeness
  const signatureValidation = validateSignatureCompleteness(data as any, data.has_joint_owner === true);
  Object.entries(signatureValidation.errors).forEach(([field, message]) => {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message,
      path: [field],
    });
  });
});

/**
 * Cross-field validation helpers
 */
export function validateSignatureCompleteness(
  formData: Record<string, any>,
  hasJointOwner: boolean
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Account Owner (required)
  const accountOwnerValidation = validateSignatureSet(
    formData.sig_account_owner_signature,
    formData.sig_account_owner_printed_name,
    formData.sig_account_owner_date,
    true
  );
  if (!accountOwnerValidation.isValid) {
    errors.sig_account_owner_signature = accountOwnerValidation.error || "Complete signature set required";
  }

  // Joint Owner (required if has_joint_owner is true)
  if (hasJointOwner) {
    const jointOwnerValidation = validateSignatureSet(
      formData.sig_joint_owner_signature,
      formData.sig_joint_owner_printed_name,
      formData.sig_joint_owner_date,
      true
    );
    if (!jointOwnerValidation.isValid) {
      errors.sig_joint_owner_signature = jointOwnerValidation.error || "Complete signature set required";
    }
  }

  // Financial Professional (required)
  const financialProfessionalValidation = validateSignatureSet(
    formData.sig_financial_professional_signature,
    formData.sig_financial_professional_printed_name,
    formData.sig_financial_professional_date,
    true
  );
  if (!financialProfessionalValidation.isValid) {
    errors.sig_financial_professional_signature = financialProfessionalValidation.error || "Complete signature set required";
  }

  // Registered Principal (required)
  const registeredPrincipalValidation = validateSignatureSet(
    formData.sig_registered_principal_signature,
    formData.sig_registered_principal_printed_name,
    formData.sig_registered_principal_date,
    true
  );
  if (!registeredPrincipalValidation.isValid) {
    errors.sig_registered_principal_signature = registeredPrincipalValidation.error || "Complete signature set required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateTotalMismatches(formData: Record<string, any>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Validate all table totals
  const tables = [
    {
      fieldIds: [
        "lnqa_cash",
        "lnqa_brokerage_nonmanaged",
        "lnqa_managed_accounts",
        "lnqa_mutual_funds_direct",
        "lnqa_annuities_less_surrender",
        "lnqa_cash_value_life",
        "lnqa_other_business_collectibles",
      ],
      totalField: "lnqa_total_liquid_assets",
    },
    {
      fieldIds: [
        "liab_mortgage_primary_residence",
        "liab_mortgages_secondary_investment",
        "liab_home_equity_loans",
        "liab_credit_cards",
        "liab_other",
      ],
      totalField: "liab_total",
    },
    {
      fieldIds: [
        "inqa_primary_residence_value_equity",
        "inqa_investment_real_estate_value_equity",
        "inqa_private_business_value_equity",
      ],
      totalField: "inqa_total_illiquid_assets_equity",
    },
    {
      fieldIds: [
        "lqa_cash",
        "lqa_retirement_plans",
        "lqa_brokerage_nonmanaged",
        "lqa_managed_accounts",
        "lqa_mutual_funds_direct",
        "lqa_annuities",
      ],
      totalField: "lqa_total",
    },
    {
      fieldIds: [
        "inc_salary_commissions",
        "inc_investment_income",
        "inc_pension",
        "inc_social_security",
        "inc_net_rental_income",
        "inc_other",
      ],
      totalField: "inc_total_annual_income",
    },
    {
      // Illiquid Qualified Assets - calculate from iqa_rows
      fieldIds: [], // Will be calculated from rows
      totalField: "iqa_total",
      isRowBased: true,
    },
  ];

  for (const table of tables) {
    let calculated: number;
    
    if ((table as any).isRowBased) {
      // Calculate from rows for Illiquid Qualified Assets
      const rows = formData.iqa_rows || [];
      calculated = 0;
      for (const row of rows) {
        const value = (row as any).iqa_purchase_amount_value;
        if (value !== null && value !== undefined && value !== "") {
          const normalized = normalizeCurrency(String(value));
          if (normalized !== "") {
            const num = parseFloat(normalized);
            if (!isNaN(num)) {
              calculated += num;
            }
          }
        }
      }
    } else {
      calculated = calculateTotal(table.fieldIds, formData, table.totalField);
    }
    
    const entered = formData[table.totalField];
    const validation = validateTotalMatches(calculated, entered, 0.01);
    if (!validation.isValid && calculated > 0) {
      errors[table.totalField] = validation.error || "The total does not equal the sum of the line items.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

