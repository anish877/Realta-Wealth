import type { AltOrderFormData } from "../types/altOrderForm";

export function shouldShowAltOrderField(
  fieldId: string,
  formData: AltOrderFormData
): boolean {
  const data = formData;

  // Qualified account certification text - show if Qualified Account = "Yes"
  if (fieldId === "qualified_account_certification_text") {
    return data.qualified_account === "Yes";
  }

  // Joint Account Owner signature - show if has_joint_owner is true
  if (
    fieldId === "joint_account_owner_signature" ||
    fieldId === "joint_account_owner_printed_name" ||
    fieldId === "joint_account_owner_date"
  ) {
    return data.has_joint_owner === true;
  }

  // All other fields are visible by default
  return true;
}

export function updateHasJointOwner(formData: AltOrderFormData): AltOrderFormData {
  const data = formData;
  // Check if customer_names contains "and" or "&" indicating joint account
  const customerNames = (data.customer_names || "").toLowerCase();
  const hasJointOwner = customerNames.includes(" and ") || customerNames.includes(" & ") || customerNames.includes(" and");
  
  return {
    ...formData,
    has_joint_owner: hasJointOwner,
  };
}

