import type { AccreditationFormData } from "../types/accreditationForm";

export function updateHasJointOwner(formData: AccreditationFormData): AccreditationFormData {
  const customerNames = (formData.customer_names || "").toLowerCase();
  const hasJointOwner =
    customerNames.includes(" and ") ||
    customerNames.includes(" & ") ||
    customerNames.endsWith(" and") ||
    customerNames.endsWith(" &");

  return {
    ...formData,
    has_joint_owner: hasJointOwner,
  };
}

export function shouldShowAccreditationField(fieldId: string, formData: AccreditationFormData): boolean {
  if (
    fieldId === "joint_account_owner_signature" ||
    fieldId === "joint_account_owner_printed_name" ||
    fieldId === "joint_account_owner_date"
  ) {
    return formData.has_joint_owner === true;
  }
  return true;
}

