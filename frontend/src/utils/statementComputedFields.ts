/**
 * Computed fields logic for Statement of Financial Condition form
 */

import { calculateTotal, normalizeCurrency } from "./statementValidation";
import type { FieldValue } from "../types/statementForm";

/**
 * Calculate total for Liquid Non-Qualified Assets
 */
export function computeLiquidNonQualifiedTotal(formData: Record<string, FieldValue>): number {
  const fieldIds = [
    "lnqa_cash",
    "lnqa_brokerage_nonmanaged",
    "lnqa_managed_accounts",
    "lnqa_mutual_funds_direct",
    "lnqa_annuities_less_surrender",
    "lnqa_cash_value_life",
    "lnqa_other_business_collectibles",
  ];
  return calculateTotal(fieldIds, formData, "lnqa_total_liquid_assets");
}

/**
 * Calculate total for Liabilities
 */
export function computeLiabilitiesTotal(formData: Record<string, FieldValue>): number {
  const fieldIds = [
    "liab_mortgage_primary_residence",
    "liab_mortgages_secondary_investment",
    "liab_home_equity_loans",
    "liab_credit_cards",
    "liab_other",
  ];
  return calculateTotal(fieldIds, formData, "liab_total");
}

/**
 * Calculate total for Illiquid Non-Qualified Assets
 */
export function computeIlliquidNonQualifiedTotal(formData: Record<string, FieldValue>): number {
  const fieldIds = [
    "inqa_primary_residence_value_equity",
    "inqa_investment_real_estate_value_equity",
    "inqa_private_business_value_equity",
  ];
  return calculateTotal(fieldIds, formData, "inqa_total_illiquid_assets_equity");
}

/**
 * Calculate total for Liquid Qualified Assets
 */
export function computeLiquidQualifiedTotal(formData: Record<string, FieldValue>): number {
  const fieldIds = [
    "lqa_cash",
    "lqa_retirement_plans",
    "lqa_brokerage_nonmanaged",
    "lqa_managed_accounts",
    "lqa_mutual_funds_direct",
    "lqa_annuities",
  ];
  return calculateTotal(fieldIds, formData, "lqa_total");
}

/**
 * Calculate total for Income Summary
 */
export function computeIncomeTotal(formData: Record<string, FieldValue>): number {
  const fieldIds = [
    "inc_salary_commissions",
    "inc_investment_income",
    "inc_pension",
    "inc_social_security",
    "inc_net_rental_income",
    "inc_other",
  ];
  return calculateTotal(fieldIds, formData, "inc_total_annual_income");
}

/**
 * Calculate total for Illiquid Qualified Assets
 * 
 * Handles both:
 * 1. Static rows from JSON schema: `illiquid_qualified_assets_illiquid_qualified_1`, `illiquid_qualified_2`, etc.
 * 2. Dynamic rows from FinancialTableField: `illiquid_qualified_assets_rows` array
 */
export function computeIlliquidQualifiedTotal(formData: Record<string, FieldValue>): number {
  let total = 0;
  
  // First, check for static rows from JSON schema (illiquid_qualified_assets_illiquid_qualified_1, 2, 3, 4)
  for (let i = 1; i <= 10; i++) {
    const fieldId = `illiquid_qualified_assets_illiquid_qualified_${i}`;
    const value = formData[fieldId];
    if (value !== null && value !== undefined && value !== "") {
      const normalized = normalizeCurrency(String(value));
      if (normalized !== "") {
        const num = parseFloat(normalized);
        if (!isNaN(num)) {
          total += num;
        }
      }
    }
  }
  
  // Second, check for dynamic rows from FinancialTableField
  const dynamicRows = (formData.illiquid_qualified_assets_rows as Array<{ id: string; value?: string }>) || [];
  for (const row of dynamicRows) {
    if (row.value !== null && row.value !== undefined && row.value !== "") {
      const normalized = normalizeCurrency(String(row.value));
      if (normalized !== "") {
        const num = parseFloat(normalized);
        if (!isNaN(num)) {
          total += num;
        }
      }
    }
  }
  
  // Also check for validator field IDs (iqa_rows with iqa_purchase_amount_value)
  const validatorRows = (formData.iqa_rows as Array<{ iqa_purchase_amount_value?: string }>) || [];
  for (const row of validatorRows) {
    const value = row.iqa_purchase_amount_value;
    if (value !== null && value !== undefined && value !== "") {
      const normalized = normalizeCurrency(String(value));
      if (normalized !== "") {
        const num = parseFloat(normalized);
        if (!isNaN(num)) {
          total += num;
        }
      }
    }
  }
  
  return total;
}

/**
 * Calculate Total Assets (less primary residence)
 * Formula: lnqa_total + lqa_total + (inqa_investment_real_estate + inqa_private_business) + iqa_total
 * 
 * IMPORTANT: This calculates from SOURCE fields, NOT from nw_total_assets_less_primary_residence
 * to avoid circular dependencies.
 */
export function computeTotalAssetsLessPrimaryResidence(formData: Record<string, FieldValue>): number {
  // Get totals from source tables (these are calculated by FinancialTableField)
  const lnqaTotal = parseFloat(normalizeCurrency(String(formData.lnqa_total_liquid_assets || ""))) || 0;
  const lqaTotal = parseFloat(normalizeCurrency(String(formData.lqa_total || ""))) || 0;
  
  // Get individual illiquid non-qualified asset values (excluding primary residence)
  const inqaInvestmentRealEstate = parseFloat(normalizeCurrency(String(formData.inqa_investment_real_estate_value_equity || ""))) || 0;
  const inqaPrivateBusiness = parseFloat(normalizeCurrency(String(formData.inqa_private_business_value_equity || ""))) || 0;
  
  // Get illiquid qualified assets total
  const iqaTotal = computeIlliquidQualifiedTotal(formData);
  
  // Calculate total: liquid assets + illiquid investment real estate + illiquid private business + illiquid qualified
  return lnqaTotal + lqaTotal + inqaInvestmentRealEstate + inqaPrivateBusiness + iqaTotal;
}

/**
 * Calculate Total Net Worth (Assets less PR - Liabilities)
 * Formula: total_assets_less_primary_residence - liab_total
 * 
 * IMPORTANT: Uses computed totalAssets (from computeTotalAssetsLessPrimaryResidence)
 * and liab_total from Liabilities table (NOT nw_total_liabilities) to avoid circular dependencies.
 */
export function computeTotalNetWorthAssetsLessPRMinusLiab(formData: Record<string, FieldValue>): number {
  // Calculate total assets from source fields (non-circular)
  const totalAssets = computeTotalAssetsLessPrimaryResidence(formData);
  
  // Get liabilities total from Liabilities table (NOT from nw_total_liabilities)
  const totalLiabilities = parseFloat(normalizeCurrency(String(formData.liab_total || ""))) || 0;
  
  return totalAssets - totalLiabilities;
}

/**
 * Calculate Total Net Worth Final
 * Formula: total_net_worth_assets_less_pr_minus_liab + nw_total_illiquid_securities
 * 
 * IMPORTANT: Uses computed netWorthAssetsLessPR (from computeTotalNetWorthAssetsLessPRMinusLiab)
 * to avoid circular dependencies.
 */
export function computeTotalNetWorthFinal(formData: Record<string, FieldValue>): number {
  // Calculate net worth from source fields (non-circular)
  const netWorthAssetsLessPR = computeTotalNetWorthAssetsLessPRMinusLiab(formData);
  
  // Get illiquid securities (user input)
  const illiquidSecurities = parseFloat(normalizeCurrency(String(formData.nw_total_illiquid_securities || ""))) || 0;
  
  return netWorthAssetsLessPR + illiquidSecurities;
}

/**
 * Calculate Total Potential Liquidity
 * Formula: lnqa_total_liquid_assets + lqa_total
 */
export function computeTotalPotentialLiquidity(formData: Record<string, FieldValue>): number {
  const lnqaTotal = parseFloat(normalizeCurrency(String(formData.lnqa_total_liquid_assets || ""))) || 0;
  const lqaTotal = parseFloat(normalizeCurrency(String(formData.lqa_total || ""))) || 0;
  
  return lnqaTotal + lqaTotal;
}

/**
 * Compute Accredited Investor Flag
 * Checks if net worth > $1,000,000
 */
export function computeAccreditedInvestorFlag(formData: Record<string, FieldValue>): boolean {
  // Try to use nw_total_net_worth_final first, fallback to nw_total_net_worth_assets_less_pr_minus_liab
  let netWorth = parseFloat(normalizeCurrency(String(formData.nw_total_net_worth_final || "")));
  
  if (isNaN(netWorth) || netWorth === 0) {
    netWorth = parseFloat(normalizeCurrency(String(formData.nw_total_net_worth_assets_less_pr_minus_liab || "")));
  }
  
  return netWorth > 1000000;
}

/**
 * Derive has_joint_owner from form data
 * Can be set explicitly via account_type selector, or inferred from customer_names
 */
export function deriveHasJointOwner(formData: Record<string, FieldValue>): boolean {
  // Check explicit account_type selector
  if (formData.account_type === "Joint") {
    return true;
  }
  if (formData.account_type === "Individual") {
    return false;
  }
  
  // Check explicit has_joint_owner boolean
  if (typeof formData.has_joint_owner === "boolean") {
    return formData.has_joint_owner;
  }
  
  // Try to infer from customer_names (simple heuristic: check for "and" or comma)
  const customerNames = String(formData.customer_names || "").trim();
  if (customerNames) {
    const hasAnd = /\band\b/i.test(customerNames);
    const hasComma = customerNames.includes(",");
    // If has "and" or comma, likely joint account
    return hasAnd || hasComma;
  }
  
  return false;
}

/**
 * Check for manual override warnings
 * Compares manual values to computed values, shows warnings if difference > $1.00
 */
export function checkManualOverrideWarnings(formData: Record<string, FieldValue>): Record<string, string> {
  const warnings: Record<string, string> = {};
  const tolerance = 1.0;
  
  // Check nw_total_assets_less_primary_residence
  const computedAssets = computeTotalAssetsLessPrimaryResidence(formData);
  const manualAssets = parseFloat(normalizeCurrency(String(formData.nw_total_assets_less_primary_residence || "")));
  if (!isNaN(manualAssets) && manualAssets > 0) {
    const difference = Math.abs(manualAssets - computedAssets);
    if (difference > tolerance) {
      warnings.nw_total_assets_less_primary_residence = 
        `This value differs from the calculated amount by ${formatCurrency(difference)}. Please confirm it is correct.`;
    }
  }
  
  // Check nw_total_net_worth_final
  const computedNetWorth = computeTotalNetWorthFinal(formData);
  const manualNetWorth = parseFloat(normalizeCurrency(String(formData.nw_total_net_worth_final || "")));
  if (!isNaN(manualNetWorth) && manualNetWorth > 0) {
    const difference = Math.abs(manualNetWorth - computedNetWorth);
    if (difference > tolerance) {
      warnings.nw_total_net_worth_final = 
        `This value differs from the calculated amount by ${formatCurrency(difference)}. Please confirm it is correct.`;
    }
  }
  
  // Check nw_total_potential_liquidity
  const computedLiquidity = computeTotalPotentialLiquidity(formData);
  const manualLiquidity = parseFloat(normalizeCurrency(String(formData.nw_total_potential_liquidity || "")));
  if (!isNaN(manualLiquidity) && manualLiquidity > 0) {
    const difference = Math.abs(manualLiquidity - computedLiquidity);
    if (difference > tolerance) {
      warnings.nw_total_potential_liquidity = 
        `This value differs from the calculated amount by ${formatCurrency(difference)}. Please confirm it is correct.`;
    }
  }
  
  return warnings;
}

/**
 * Helper to format currency for display
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

