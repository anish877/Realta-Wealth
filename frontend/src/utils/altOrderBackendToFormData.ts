/**
 * Transform backend Alt Order data format to frontend form data format
 */

import type { AltOrderProfile } from "../api";
import type { AltOrderFormData } from "../types/altOrderForm";

/**
 * Format number as currency string
 */
function formatCurrency(value: number | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format number as percentage string
 */
function formatPercentage(value: number | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;
  return value.toString();
}

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

export function transformBackendToAltOrderForm(
  backendData: AltOrderProfile
): AltOrderFormData {
  const formData: AltOrderFormData = {};

  // Customer/Account Information
  formData.rr_name = backendData.rrName;
  formData.rr_no = backendData.rrNo;
  formData.customer_names = backendData.customerNames;
  formData.proposed_principal_amount = formatCurrency(backendData.proposedPrincipalAmount);
  formData.qualified_account = backendData.qualifiedAccount;
  formData.qualified_account_certification_text = backendData.qualifiedAccountCertificationText;
  formData.solicited_trade = backendData.solicitedTrade;
  formData.tax_advantage_purchase = backendData.taxAdvantagePurchase;

  // Customer Order Information
  formData.custodian = backendData.custodian;
  formData.name_of_product = backendData.nameOfProduct;
  formData.sponsor_issuer = backendData.sponsorIssuer;
  formData.date_of_ppm = formatDate(backendData.dateOfPpm);
  formData.date_ppm_sent = formatDate(backendData.datePpmSent);
  formData.existing_illiquid_alt_positions = formatCurrency(backendData.existingIlliquidAltPositions);
  formData.existing_illiquid_alt_concentration = formatPercentage(backendData.existingIlliquidAltConcentration);
  formData.existing_semi_liquid_alt_positions = formatCurrency(backendData.existingSemiLiquidAltPositions);
  formData.existing_semi_liquid_alt_concentration = formatPercentage(backendData.existingSemiLiquidAltConcentration);
  formData.existing_tax_advantage_alt_positions = formatCurrency(backendData.existingTaxAdvantageAltPositions);
  formData.existing_tax_advantage_alt_concentration = formatPercentage(backendData.existingTaxAdvantageAltConcentration);
  formData.total_net_worth = formatCurrency(backendData.totalNetWorth);
  formData.liquid_net_worth = formatCurrency(backendData.liquidNetWorth);
  formData.total_concentration = formatPercentage(backendData.totalConcentration);

  // Signatures
  formData.account_owner_signature = backendData.accountOwnerSignature;
  formData.account_owner_printed_name = backendData.accountOwnerPrintedName;
  formData.account_owner_date = formatDate(backendData.accountOwnerDate);
  formData.joint_account_owner_signature = backendData.jointAccountOwnerSignature;
  formData.joint_account_owner_printed_name = backendData.jointAccountOwnerPrintedName;
  formData.joint_account_owner_date = formatDate(backendData.jointAccountOwnerDate);
  formData.financial_professional_signature = backendData.financialProfessionalSignature;
  formData.financial_professional_printed_name = backendData.financialProfessionalPrintedName;
  formData.financial_professional_date = formatDate(backendData.financialProfessionalDate);
  formData.registered_principal_signature = backendData.registeredPrincipalSignature;
  formData.registered_principal_printed_name = backendData.registeredPrincipalPrintedName;
  formData.registered_principal_date = formatDate(backendData.registeredPrincipalDate);

  // Internal Use Only
  formData.notes = backendData.notes;
  formData.reg_bi_delivery = backendData.regBiDelivery ?? false;
  formData.state_registration = backendData.stateRegistration ?? false;
  formData.ai_insight = backendData.aiInsight ?? false;
  formData.statement_of_financial_condition = backendData.statementOfFinancialCondition ?? false;
  formData.suitability_received = backendData.suitabilityReceived ?? false;

  return formData;
}
