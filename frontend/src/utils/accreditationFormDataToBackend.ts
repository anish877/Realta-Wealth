import type { AccreditationFormData } from "../types/accreditationForm";

/**
 * Helper function to convert empty/falsy values to undefined
 */
function toOptional<T>(value: T | null | undefined | ""): T | undefined {
  if (value === null || value === "") {
    return undefined;
  }
  return value;
}

export function transformAccreditationToBackend(formData: AccreditationFormData) {
  return {
    rrName: toOptional(formData.rr_name),
    rrNo: toOptional(formData.rr_no),
    customerNames: toOptional(formData.customer_names),
    hasJointOwner: formData.has_joint_owner ?? false,
    accountOwnerSignature: toOptional(formData.account_owner_signature),
    accountOwnerPrintedName: toOptional(formData.account_owner_printed_name),
    accountOwnerDate: formData.account_owner_date ? new Date(formData.account_owner_date).toISOString() : undefined,
    jointAccountOwnerSignature: toOptional(formData.joint_account_owner_signature),
    jointAccountOwnerPrintedName: toOptional(formData.joint_account_owner_printed_name),
    jointAccountOwnerDate: formData.joint_account_owner_date ? new Date(formData.joint_account_owner_date).toISOString() : undefined,
    financialProfessionalSignature: toOptional(formData.financial_professional_signature),
    financialProfessionalPrintedName: toOptional(formData.financial_professional_printed_name),
    financialProfessionalDate: formData.financial_professional_date ? new Date(formData.financial_professional_date).toISOString() : undefined,
    registeredPrincipalSignature: toOptional(formData.registered_principal_signature),
    registeredPrincipalPrintedName: toOptional(formData.registered_principal_printed_name),
    registeredPrincipalDate: formData.registered_principal_date ? new Date(formData.registered_principal_date).toISOString() : undefined,
  };
}

