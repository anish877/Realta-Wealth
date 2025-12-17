import { z } from "zod";
import {
  rrNameFieldSchema,
  requiredTextFieldSchema,
  dateFieldSchema,
  signatureFieldSchema,
  generalTextFieldSchema,
} from "./formFieldValidators";

export const yesNoSchema = z.enum(["Yes", "No"]);

// Client info
export const clientInfoSchema = z
  .object({
    rr_name: rrNameFieldSchema.optional(),
    rr_no: requiredTextFieldSchema.min(1).max(100).optional(),
    customer_names: requiredTextFieldSchema.min(1).max(200).optional(),
    has_joint_owner: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.rr_name || data.rr_name === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "RR Name is required", path: ["rr_name"] });
    }
    if (!data.rr_no || data.rr_no === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "RR No. is required", path: ["rr_no"] });
    }
    if (!data.customer_names || data.customer_names === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Customer Name(s) is required", path: ["customer_names"] });
    }
  });

// Signatures
export const signaturesSchema = z
  .object({
    has_joint_owner: z.boolean().optional(),

    account_owner_signature: signatureFieldSchema.optional(),
    account_owner_printed_name: generalTextFieldSchema.max(120).optional(),
    account_owner_date: dateFieldSchema({ notFuture: true }).optional(),

    joint_account_owner_signature: signatureFieldSchema.optional(),
    joint_account_owner_printed_name: generalTextFieldSchema.max(120).optional(),
    joint_account_owner_date: dateFieldSchema({ notFuture: true }).optional(),

    financial_professional_signature: signatureFieldSchema.optional(),
    financial_professional_printed_name: generalTextFieldSchema.max(120).optional(),
    financial_professional_date: dateFieldSchema({ notFuture: true }).optional(),

    registered_principal_signature: signatureFieldSchema.optional(),
    registered_principal_printed_name: generalTextFieldSchema.max(120).optional(),
    registered_principal_date: dateFieldSchema({ notFuture: true }).optional(),
  })
  .superRefine((data, ctx) => {
    const checkSet = (fields: Array<{ value: any; path: string[] }>, message: string) => {
      const anyFilled = fields.some((f) => f.value !== null && f.value !== undefined && f.value !== "");
      if (anyFilled) {
        fields.forEach((f) => {
          if (!f.value || f.value === "") {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: f.path });
          }
        });
      }
    };

    // Account Owner
    checkSet(
      [
        { value: data.account_owner_signature, path: ["account_owner_signature"] },
        { value: data.account_owner_printed_name, path: ["account_owner_printed_name"] },
        { value: data.account_owner_date, path: ["account_owner_date"] },
      ],
      "All Account Owner signature fields must be completed together"
    );

    // Joint Account Owner required if has_joint_owner
    if (data.has_joint_owner) {
      [
        { value: data.joint_account_owner_signature, path: ["joint_account_owner_signature"] },
        { value: data.joint_account_owner_printed_name, path: ["joint_account_owner_printed_name"] },
        { value: data.joint_account_owner_date, path: ["joint_account_owner_date"] },
      ].forEach((f) => {
        if (!f.value || f.value === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "All Joint Account Owner signature fields must be completed",
            path: f.path,
          });
        }
      });
    }

    // Financial Professional
    checkSet(
      [
        { value: data.financial_professional_signature, path: ["financial_professional_signature"] },
        { value: data.financial_professional_printed_name, path: ["financial_professional_printed_name"] },
        { value: data.financial_professional_date, path: ["financial_professional_date"] },
      ],
      "All Financial Professional signature fields must be completed together"
    );

    // Registered Principal
    checkSet(
      [
        { value: data.registered_principal_signature, path: ["registered_principal_signature"] },
        { value: data.registered_principal_printed_name, path: ["registered_principal_printed_name"] },
        { value: data.registered_principal_date, path: ["registered_principal_date"] },
      ],
      "All Registered Principal signature fields must be completed together"
    );
  });

export function validateAccreditationForm(
  formData: Record<string, any>
): { isValid: boolean; errors: Record<string, string> } {
  const schemas = [clientInfoSchema, signaturesSchema];
  const errors: Record<string, string> = {};

  schemas.forEach((schema) => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      result.error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
    }
  });

  return { isValid: Object.keys(errors).length === 0, errors };
}

