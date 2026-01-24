import type { AccreditationProfile } from "../api";
import type { AccreditationFormData } from "../types/accreditationForm";

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(dateString: string | undefined): string | undefined {
  if (!dateString) return undefined;
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch {
    return undefined;
  }
}

export function transformBackendToAccreditationForm(backendData: AccreditationProfile): AccreditationFormData {
  return {
    rr_name: backendData.rrName ?? undefined,
    rr_no: backendData.rrNo ?? undefined,
    customer_names: backendData.customerNames ?? undefined,
    has_joint_owner: backendData.hasJointOwner ?? false,
    account_owner_signature: backendData.accountOwnerSignature ?? undefined,
    account_owner_printed_name: backendData.accountOwnerPrintedName ?? undefined,
    account_owner_date: formatDate(backendData.accountOwnerDate),
    joint_account_owner_signature: backendData.jointAccountOwnerSignature ?? undefined,
    joint_account_owner_printed_name: backendData.jointAccountOwnerPrintedName ?? undefined,
    joint_account_owner_date: formatDate(backendData.jointAccountOwnerDate),
    financial_professional_signature: backendData.financialProfessionalSignature ?? undefined,
    financial_professional_printed_name: backendData.financialProfessionalPrintedName ?? undefined,
    financial_professional_date: formatDate(backendData.financialProfessionalDate),
    registered_principal_signature: backendData.registeredPrincipalSignature ?? undefined,
    registered_principal_printed_name: backendData.registeredPrincipalPrintedName ?? undefined,
    registered_principal_date: formatDate(backendData.registeredPrincipalDate),
  };
}

