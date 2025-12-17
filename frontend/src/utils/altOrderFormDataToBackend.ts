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
  return {
    // Customer/Account Information
    rrName: toOptional(formData.rr_name),
    rrNo: toOptional(formData.rr_no),
    customerNames: toOptional(formData.customer_names),
    proposedPrincipalAmount: parseCurrency(formData.proposed_principal_amount),
    qualifiedAccount: formData.qualified_account,
    qualifiedAccountCertificationText: toOptional(formData.qualified_account_certification_text),
    solicitedTrade: formData.solicited_trade,
    taxAdvantagePurchase: formData.tax_advantage_purchase,

    // Customer Order Information
    custodian: toOptional(formData.custodian),
    nameOfProduct: toOptional(formData.name_of_product),
    sponsorIssuer: toOptional(formData.sponsor_issuer),
    dateOfPpm: formData.date_of_ppm ? new Date(formData.date_of_ppm).toISOString() : undefined,
    datePpmSent: formData.date_ppm_sent ? new Date(formData.date_ppm_sent).toISOString() : undefined,
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

    // Internal Use Only
    notes: toOptional(formData.notes),
    regBiDelivery: formData.reg_bi_delivery ?? false,
    stateRegistration: formData.state_registration ?? false,
    aiInsight: formData.ai_insight ?? false,
    statementOfFinancialCondition: formData.statement_of_financial_condition ?? false,
    suitabilityReceived: formData.suitability_received ?? false,
  };
}
