import { z } from "zod";
import {
  rrNameFieldSchema,
  customerNameFieldSchema,
  currencyFieldSchema,
  dateFieldSchema,
  signatureFieldSchema,
  generalTextFieldSchema,
  requiredTextFieldSchema,
} from "./formFieldValidators";

/**
 * Frontend form validation schemas for Alternative Investment Order form
 */

// Enums
export const yesNoSchema = z.enum(["Yes", "No"]);
export const custodianSchema = z.enum([
  "First Clearing",
  "Direct",
  "MainStar",
  "CNB",
  "Kingdom Trust",
  "Other",
]);

// Customer/Account Information Schema
export const customerAccountInfoSchema = z
  .object({
    rr_name: rrNameFieldSchema.optional(),
    rr_no: generalTextFieldSchema.max(50).optional(),
    customer_names: customerNameFieldSchema.optional(),
    proposed_principal_amount: currencyFieldSchema().optional(),
    qualified_account: yesNoSchema.optional(),
    qualified_account_certification_text: generalTextFieldSchema.max(500).optional(),
    solicited_trade: yesNoSchema.optional(),
    tax_advantage_purchase: yesNoSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // Required fields
    if (!data.rr_name || data.rr_name === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "RR Name is required",
        path: ["rr_name"],
      });
    }
    if (!data.rr_no || data.rr_no === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "RR No. is required",
        path: ["rr_no"],
      });
    }
    if (!data.customer_names || data.customer_names === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Customer Names(s) is required",
        path: ["customer_names"],
      });
    }
    if (!data.proposed_principal_amount || data.proposed_principal_amount === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Proposed Principal Amount is required",
        path: ["proposed_principal_amount"],
      });
    }

    // Conditional: Qualified account certification text required if Qualified Account = "Yes"
    if (data.qualified_account === "Yes") {
      if (!data.qualified_account_certification_text || data.qualified_account_certification_text === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Qualified account certification text is required",
          path: ["qualified_account_certification_text"],
        });
      }
    }
  });

// Customer Order Information Schema
export const customerOrderInfoSchema = z
  .object({
    custodian: custodianSchema.optional(),
    name_of_product: generalTextFieldSchema.max(200).optional(),
    sponsor_issuer: generalTextFieldSchema.max(200).optional(),
    date_of_ppm: dateFieldSchema({ notFuture: true }).optional(),
    date_ppm_sent: dateFieldSchema({ notFuture: true }).optional(),
    existing_illiquid_alt_positions: currencyFieldSchema().optional(),
    existing_illiquid_alt_concentration: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val === "") return true;
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0 && num <= 100;
        },
        { message: "Concentration must be between 0% and 100%" }
      ),
    existing_semi_liquid_alt_positions: currencyFieldSchema().optional(),
    existing_semi_liquid_alt_concentration: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val === "") return true;
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0 && num <= 100;
        },
        { message: "Concentration must be between 0% and 100%" }
      ),
    existing_tax_advantage_alt_positions: currencyFieldSchema().optional(),
    existing_tax_advantage_alt_concentration: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val === "") return true;
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0 && num <= 100;
        },
        { message: "Concentration must be between 0% and 100%" }
      ),
    total_net_worth: currencyFieldSchema().optional(),
    liquid_net_worth: currencyFieldSchema().optional(),
    total_concentration: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val === "") return true;
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0 && num <= 100;
        },
        { message: "Concentration must be between 0% and 100%" }
      ),
  })
  .superRefine((data, ctx) => {
    // Required fields
    if (!data.custodian) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custodian is required",
        path: ["custodian"],
      });
    }
    if (!data.name_of_product || data.name_of_product === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name of Product is required",
        path: ["name_of_product"],
      });
    }
    if (!data.sponsor_issuer || data.sponsor_issuer === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sponsor/Issuer is required",
        path: ["sponsor_issuer"],
      });
    }
    if (!data.date_of_ppm || data.date_of_ppm === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date of PPM is required",
        path: ["date_of_ppm"],
      });
    }
    if (!data.date_ppm_sent || data.date_ppm_sent === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date PPM Sent is required",
        path: ["date_ppm_sent"],
      });
    }
  });

// Signatures Schema
export const signaturesSchema = z
  .object({
    account_owner_signature: signatureFieldSchema.optional(),
    account_owner_printed_name: requiredTextFieldSchema.min(1).max(120).optional(),
    account_owner_date: dateFieldSchema({ notFuture: true }).optional(),
    joint_account_owner_signature: signatureFieldSchema.optional(),
    joint_account_owner_printed_name: requiredTextFieldSchema.min(1).max(120).optional(),
    joint_account_owner_date: dateFieldSchema({ notFuture: true }).optional(),
    financial_professional_signature: signatureFieldSchema.optional(),
    financial_professional_printed_name: requiredTextFieldSchema.min(1).max(120).optional(),
    financial_professional_date: dateFieldSchema({ notFuture: true }).optional(),
    has_joint_owner: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Account Owner signature set - all required together
    const accountOwnerFields = [
      data.account_owner_signature,
      data.account_owner_printed_name,
      data.account_owner_date,
    ];
    const hasAnyAccountOwner = accountOwnerFields.some(
      (field) => field !== null && field !== undefined && field !== ""
    );
    if (hasAnyAccountOwner) {
      accountOwnerFields.forEach((field, index) => {
        if (!field || field === "") {
          const fieldNames = [
            "account_owner_signature",
            "account_owner_printed_name",
            "account_owner_date",
          ];
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "All Account Owner signature fields must be completed together",
            path: [fieldNames[index]],
          });
        }
      });
    }

    // Joint Account Owner signature set - required if has_joint_owner is true
    if (data.has_joint_owner === true) {
      const jointAccountOwnerFields = [
        data.joint_account_owner_signature,
        data.joint_account_owner_printed_name,
        data.joint_account_owner_date,
      ];
      jointAccountOwnerFields.forEach((field, index) => {
        if (!field || field === "") {
          const fieldNames = [
            "joint_account_owner_signature",
            "joint_account_owner_printed_name",
            "joint_account_owner_date",
          ];
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "All Joint Account Owner signature fields must be completed",
            path: [fieldNames[index]],
          });
        }
      });
    }

    // Financial Professional signature set - all required together
    const financialProfessionalFields = [
      data.financial_professional_signature,
      data.financial_professional_printed_name,
      data.financial_professional_date,
    ];
    const hasAnyFinancialProfessional = financialProfessionalFields.some(
      (field) => field !== null && field !== undefined && field !== ""
    );
    if (hasAnyFinancialProfessional) {
      financialProfessionalFields.forEach((field, index) => {
        if (!field || field === "") {
          const fieldNames = [
            "financial_professional_signature",
            "financial_professional_printed_name",
            "financial_professional_date",
          ];
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "All Financial Professional signature fields must be completed together",
            path: [fieldNames[index]],
          });
        }
      });
    }
  });

// Internal Use Only Schema
export const internalUseSchema = z.object({
  registered_principal_signature: signatureFieldSchema.optional(),
  registered_principal_printed_name: requiredTextFieldSchema.min(1).max(120).optional(),
  registered_principal_date: dateFieldSchema({ notFuture: true }).optional(),
  notes: generalTextFieldSchema.max(1000).optional(),
  reg_bi_delivery: z.boolean().optional(),
  state_registration: z.boolean().optional(),
  ai_insight: z.boolean().optional(),
  statement_of_financial_condition: z.boolean().optional(),
  suitability_received: z.boolean().optional(),
});

/**
 * Normalize form data by converting null values to undefined
 * Zod's .optional() allows undefined but not null
 */
function normalizeFormData(formData: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  for (const [key, value] of Object.entries(formData)) {
    // Convert null to undefined for Zod validation
    if (value === null) {
      normalized[key] = undefined;
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Recursively normalize nested objects
      normalized[key] = normalizeFormData(value);
    } else {
      normalized[key] = value;
    }
  }
  return normalized;
}

/**
 * Validate the entire form by running each schema separately and aggregating errors
 */
export function validateAltOrderForm(
  formData: Record<string, any>
): { isValid: boolean; errors: Record<string, string> } {
  // Normalize null values to undefined before validation
  const normalizedData = normalizeFormData(formData);
  
  const schemas = [
    customerAccountInfoSchema,
    customerOrderInfoSchema,
    signaturesSchema,
    internalUseSchema,
  ];

  const errors: Record<string, string> = {};

  schemas.forEach((schema) => {
    const result = schema.safeParse(normalizedData);
    if (!result.success) {
      result.error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
    }
  });

  return { isValid: Object.keys(errors).length === 0, errors };
}

