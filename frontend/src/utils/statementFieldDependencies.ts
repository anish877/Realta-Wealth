/**
 * Conditional field dependencies for Statement of Financial Condition form
 */

import type { FieldValue as StatementFieldValue } from "../types/statementForm";
import type { FieldValue as FormFieldValue } from "../types/form";
import type { FieldVisibilityRule } from "./fieldDependencies";
import { shouldShowField as baseShouldShowField, fieldVisibilityRules as baseRules } from "./fieldDependencies";

/**
 * Field visibility rules for Statement form
 */
export const statementFieldVisibilityRules: FieldVisibilityRule[] = [
  // Joint Owner signature fields - show when has_joint_owner is true
  {
    fieldId: "sig_joint_owner_signature",
    showWhen: [{ field: "has_joint_owner", operator: "equals", value: true }],
  },
  {
    fieldId: "sig_joint_owner_printed_name",
    showWhen: [{ field: "has_joint_owner", operator: "equals", value: true }],
  },
  {
    fieldId: "sig_joint_owner_date",
    showWhen: [{ field: "has_joint_owner", operator: "equals", value: true }],
  },
];

/**
 * Check if a field should be visible based on Statement form rules
 */
export function shouldShowStatementField(
  fieldId: string,
  formData: Record<string, StatementFieldValue>
): boolean {
  // Combine base rules with statement-specific rules
  const allRules = [...baseRules, ...statementFieldVisibilityRules];
  // Convert StatementFieldValue to FormFieldValue for compatibility
  const convertedFormData = formData as Record<string, FormFieldValue>;
  return baseShouldShowField(fieldId, convertedFormData, allRules);
}

/**
 * Derive has_joint_owner from form data
 * This is called to update the derived field when account_type or customer_names changes
 */
export function updateHasJointOwner(
  formData: Record<string, StatementFieldValue>
): Record<string, StatementFieldValue> {
  const updated = { ...formData };
  
  // Check explicit account_type selector
  if (formData.account_type === "Joint") {
    updated.has_joint_owner = true;
  } else if (formData.account_type === "Individual") {
    updated.has_joint_owner = false;
  } else {
    // Try to infer from customer_names
    const customerNames = String(formData.customer_names || "").trim();
    if (customerNames) {
      const hasAnd = /\band\b/i.test(customerNames);
      const hasComma = customerNames.includes(",");
      updated.has_joint_owner = hasAnd || hasComma;
    } else {
      // Default to false if no indication
      updated.has_joint_owner = false;
    }
  }
  
  return updated;
}

/**
 * Get conditional requirements for a field
 */
export function getFieldRequirements(
  fieldId: string,
  formData: Record<string, StatementFieldValue>
): { required: boolean; reason?: string } {
  const hasJointOwner = formData.has_joint_owner === true;
  
  // Joint owner signature fields are required if has_joint_owner is true
  if (fieldId.startsWith("sig_joint_owner_") && hasJointOwner) {
    return { required: true, reason: "Joint owner signature is required for joint accounts" };
  }
  
  // Account owner, financial professional, and registered principal signatures are always required
  if (
    fieldId.startsWith("sig_account_owner_") ||
    fieldId.startsWith("sig_financial_professional_") ||
    fieldId.startsWith("sig_registered_principal_")
  ) {
    if (fieldId.endsWith("_signature") || fieldId.endsWith("_printed_name") || fieldId.endsWith("_date")) {
      return { required: true };
    }
  }
  
  // Customer names is required
  if (fieldId === "customer_names") {
    return { required: true };
  }
  
  return { required: false };
}

