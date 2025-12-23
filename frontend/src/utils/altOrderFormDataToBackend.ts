/**
 * Transform Alt Order frontend form data format to backend API format
 */

import type { AltOrderFormData } from "../types/altOrderForm";

type FormData = AltOrderFormData;

/**
 * Helper function to convert empty/falsy values to undefined
 */
function toOptional<T>(value: T | null | undefined | ""): T | undefined {
  if (value === null || value === "") {
    return undefined;
  }
  return value;
}

/**
 * Recursively remove null and undefined values from an object
 * This ensures Zod validators don't receive null for optional fields
 * Uses JSON serialization to properly handle nested structures
 */
function removeNulls<T>(obj: T): any {
  // Handle null/undefined at top level
  if (obj === null || obj === undefined) {
    return undefined;
  }
  
  // Handle arrays - filter out nulls and clean each element
  if (Array.isArray(obj)) {
    const cleaned = obj
      .filter(item => item !== null && item !== undefined)
      .map(item => removeNulls(item));
    return cleaned.length > 0 ? cleaned : undefined;
  }
  
  // Handle objects - recursively clean and skip null/undefined values
  if (typeof obj === "object" && obj.constructor === Object) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip null and undefined values entirely
      if (value === null || value === undefined) {
        continue;
      }
      // Recursively clean nested structures
      const cleanedValue = removeNulls(value);
      // Only include if cleaned value is not undefined
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    // Return undefined for empty objects (so they're omitted)
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
  
  // Return primitives as-is
  return obj;
}

/**
 * Convert currency string to number
 */
function parseCurrency(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[$,\s]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

/**
 * Convert percentage string to number
 */
function parsePercentage(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[%\s]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

/**
 * Transform Alt Order form data to backend format
 */
export function transformAltOrderToBackend(formData: FormData) {
  const result = {
    // Customer/Account Information
    rrName: toOptional(formData.rr_name),
    rrNo: toOptional(formData.rr_no),
    customerNames: toOptional(formData.customer_names),
    proposedPrincipalAmount: parseCurrency(formData.proposed_principal_amount),
    qualifiedAccount: toOptional(formData.qualified_account),
    qualifiedAccountCertificationText: toOptional(formData.qualified_account_certification_text),
    solicitedTrade: toOptional(formData.solicited_trade),
    taxAdvantagePurchase: toOptional(formData.tax_advantage_purchase),

    // Customer Order Information
    custodian: toOptional(formData.custodian),
    nameOfProduct: toOptional(formData.name_of_product),
    sponsorIssuer: toOptional(formData.sponsor_issuer),
    dateOfPpm: formData.date_of_ppm && formData.date_of_ppm !== null ? new Date(formData.date_of_ppm).toISOString() : undefined,
    datePpmSent: formData.date_ppm_sent && formData.date_ppm_sent !== null ? new Date(formData.date_ppm_sent).toISOString() : undefined,
    existingIlliquidAltPositions: parseCurrency(formData.existing_illiquid_alt_positions),
    existingIlliquidAltConcentration: parsePercentage(formData.existing_illiquid_alt_concentration),
    existingSemiLiquidAltPositions: parseCurrency(formData.existing_semi_liquid_alt_positions),
    existingSemiLiquidAltConcentration: parsePercentage(formData.existing_semi_liquid_alt_concentration),
    existingTaxAdvantageAltPositions: parseCurrency(formData.existing_tax_advantage_alt_positions),
    existingTaxAdvantageAltConcentration: parsePercentage(formData.existing_tax_advantage_alt_concentration),
    totalNetWorth: parseCurrency(formData.total_net_worth),
    liquidNetWorth: parseCurrency(formData.liquid_net_worth),
    totalConcentration: parsePercentage(formData.total_concentration),

    // Signatures
    accountOwnerSignature: toOptional(formData.account_owner_signature),
    accountOwnerPrintedName: toOptional(formData.account_owner_printed_name),
    accountOwnerDate: formData.account_owner_date && formData.account_owner_date !== null ? new Date(formData.account_owner_date).toISOString() : undefined,
    jointAccountOwnerSignature: toOptional(formData.joint_account_owner_signature),
    jointAccountOwnerPrintedName: toOptional(formData.joint_account_owner_printed_name),
    jointAccountOwnerDate: formData.joint_account_owner_date && formData.joint_account_owner_date !== null ? new Date(formData.joint_account_owner_date).toISOString() : undefined,
    financialProfessionalSignature: toOptional(formData.financial_professional_signature),
    financialProfessionalPrintedName: toOptional(formData.financial_professional_printed_name),
    financialProfessionalDate: formData.financial_professional_date && formData.financial_professional_date !== null ? new Date(formData.financial_professional_date).toISOString() : undefined,
    registeredPrincipalSignature: toOptional(formData.registered_principal_signature),
    registeredPrincipalPrintedName: toOptional(formData.registered_principal_printed_name),
    registeredPrincipalDate: formData.registered_principal_date && formData.registered_principal_date !== null ? new Date(formData.registered_principal_date).toISOString() : undefined,

    // Internal Use Only
    notes: toOptional(formData.notes),
    regBiDelivery: formData.reg_bi_delivery ?? false,
    stateRegistration: formData.state_registration ?? false,
    aiInsight: formData.ai_insight ?? false,
    statementOfFinancialCondition: formData.statement_of_financial_condition ?? false,
    suitabilityReceived: formData.suitability_received ?? false,
  };

  // Clean nulls recursively, then use JSON serialization to ensure all nulls are removed
  const cleaned = removeNulls(result);
  // Use JSON.stringify with replacer to remove nulls, then parse back
  // This double-pass ensures absolutely no null values remain
  const jsonString = JSON.stringify(cleaned, (key, value) => {
    // Remove null values entirely - should never happen after removeNulls, but be defensive
    if (value === null) {
      return undefined;
    }
    // Also remove empty strings for optional fields
    if (value === "") {
      return undefined;
    }
    return value;
  });
  
  // Parse the cleaned JSON string
  const parsed = jsonString ? JSON.parse(jsonString) : {};
  
  // Final pass: explicitly remove any remaining null values (defensive)
  const finalCleaned: any = {};
  for (const [key, value] of Object.entries(parsed)) {
    // Skip null and undefined values
    if (value !== null && value !== undefined) {
      finalCleaned[key] = value;
    }
  }
  
  return finalCleaned;
}
