/**
 * Field ID mapping utility for Statement of Financial Condition form
 * Maps between JSON schema field IDs and validator field IDs
 */

/**
 * Map JSON schema field ID to validator field ID
 */
export function mapToValidatorId(jsonFieldId: string): string {
  // Direct mappings (no change needed)
  const directMappings: Record<string, string> = {
    rr_name: "rr_name",
    rr_no: "rr_no",
    customer_names: "customer_names",
    notes: "notes",
    additional_notes: "additional_notes",
    account_type: "account_type",
    has_joint_owner: "has_joint_owner",
  };

  if (directMappings[jsonFieldId]) {
    return directMappings[jsonFieldId];
  }

  // Signature field mappings
  if (jsonFieldId.startsWith("account_owner_")) {
    return jsonFieldId.replace("account_owner_", "sig_account_owner_");
  }
  if (jsonFieldId.startsWith("joint_account_owner_")) {
    return jsonFieldId.replace("joint_account_owner_", "sig_joint_owner_");
  }
  if (jsonFieldId.startsWith("financial_professional_")) {
    return jsonFieldId.replace("financial_professional_", "sig_financial_professional_");
  }
  if (jsonFieldId.startsWith("registered_principal_")) {
    return jsonFieldId.replace("registered_principal_", "sig_registered_principal_");
  }

  // Liquid Non-Qualified Assets table mappings
  if (jsonFieldId.startsWith("liquid_non_qualified_assets_")) {
    const suffix = jsonFieldId.replace("liquid_non_qualified_assets_", "");
    const mapping: Record<string, string> = {
      cash_money_markets: "lnqa_cash",
      brokerage_non_managed: "lnqa_brokerage_nonmanaged",
      managed_accounts: "lnqa_managed_accounts",
      mutual_funds_direct: "lnqa_mutual_funds_direct",
      annuities_less_surrender: "lnqa_annuities_less_surrender",
      cash_value_life_insurance: "lnqa_cash_value_life",
      other_business_assets: "lnqa_other_business_collectibles",
      total_liquid_assets: "lnqa_total_liquid_assets",
    };
    return mapping[suffix] || jsonFieldId;
  }

  // Liabilities table mappings
  if (jsonFieldId.startsWith("liabilities_")) {
    const suffix = jsonFieldId.replace("liabilities_", "");
    const mapping: Record<string, string> = {
      mortgage_primary_residence: "liab_mortgage_primary_residence",
      mortgages_secondary_investment: "liab_mortgages_secondary_investment",
      home_equity_loans: "liab_home_equity_loans",
      credit_cards: "liab_credit_cards",
      other_liabilities: "liab_other",
      total_liabilities: "liab_total",
    };
    return mapping[suffix] || jsonFieldId;
  }

  // Illiquid Non-Qualified Assets table mappings
  if (jsonFieldId.startsWith("illiquid_non_qualified_assets_")) {
    const suffix = jsonFieldId.replace("illiquid_non_qualified_assets_", "");
    const mapping: Record<string, string> = {
      primary_residence: "inqa_primary_residence_value_equity",
      investment_real_estate: "inqa_investment_real_estate_value_equity",
      private_business: "inqa_private_business_value_equity",
      total_illiquid_assets_equity: "inqa_total_illiquid_assets_equity",
    };
    return mapping[suffix] || jsonFieldId;
  }

  // Liquid Qualified Assets table mappings
  if (jsonFieldId.startsWith("liquid_qualified_assets_")) {
    const suffix = jsonFieldId.replace("liquid_qualified_assets_", "");
    const mapping: Record<string, string> = {
      qualified_cash_money_markets: "lqa_cash",
      retirement_plans: "lqa_retirement_plans",
      qualified_brokerage_non_managed: "lqa_brokerage_nonmanaged",
      qualified_managed_accounts: "lqa_managed_accounts",
      qualified_mutual_funds_direct: "lqa_mutual_funds_direct",
      qualified_annuities: "lqa_annuities",
      total_liquid_qualified_assets: "lqa_total",
    };
    return mapping[suffix] || jsonFieldId;
  }

  // Income Summary table mappings
  if (jsonFieldId.startsWith("income_summary_")) {
    const suffix = jsonFieldId.replace("income_summary_", "");
    const mapping: Record<string, string> = {
      salary_commissions: "inc_salary_commissions",
      investment_income: "inc_investment_income",
      pension: "inc_pension",
      social_security: "inc_social_security",
      net_rental_income: "inc_net_rental_income",
      other_income: "inc_other",
      total_annual_income: "inc_total_annual_income",
    };
    return mapping[suffix] || jsonFieldId;
  }

  // Net Worth table mappings
  if (jsonFieldId.startsWith("net_worth_")) {
    const suffix = jsonFieldId.replace("net_worth_", "");
    const mapping: Record<string, string> = {
      total_assets_less_primary_residence: "nw_total_assets_less_primary_residence",
      total_liabilities_net_worth: "nw_total_liabilities",
      total_net_worth_assets_less_pr: "nw_total_net_worth_assets_less_pr_minus_liab",
      total_illiquid_securities: "nw_total_illiquid_securities",
      total_net_worth: "nw_total_net_worth_final",
      total_potential_liquidity: "nw_total_potential_liquidity",
    };
    return mapping[suffix] || jsonFieldId;
  }

  // Illiquid Qualified Assets (repeatable rows)
  if (jsonFieldId.startsWith("illiquid_qualified_assets_")) {
    const suffix = jsonFieldId.replace("illiquid_qualified_assets_", "");
    if (suffix.startsWith("illiquid_qualified_")) {
      // Handle numbered rows like "illiquid_qualified_1"
      const rowNum = suffix.replace("illiquid_qualified_", "");
      return `iqa_row_${rowNum}`;
    }
    if (suffix === "total_illiquid_qualified_assets") {
      return "iqa_total";
    }
    return jsonFieldId;
  }

  // Return original if no mapping found
  return jsonFieldId;
}

/**
 * Map validator field ID back to JSON schema field ID
 */
export function mapToJsonId(validatorFieldId: string): string {
  // Direct mappings (no change needed)
  const directMappings: Record<string, string> = {
    rr_name: "rr_name",
    rr_no: "rr_no",
    customer_names: "customer_names",
    notes: "notes",
    additional_notes: "additional_notes",
    account_type: "account_type",
    has_joint_owner: "has_joint_owner",
  };

  if (directMappings[validatorFieldId]) {
    return directMappings[validatorFieldId];
  }

  // Signature field reverse mappings
  if (validatorFieldId.startsWith("sig_account_owner_")) {
    return validatorFieldId.replace("sig_account_owner_", "account_owner_");
  }
  if (validatorFieldId.startsWith("sig_joint_owner_")) {
    return validatorFieldId.replace("sig_joint_owner_", "joint_account_owner_");
  }
  if (validatorFieldId.startsWith("sig_financial_professional_")) {
    return validatorFieldId.replace("sig_financial_professional_", "financial_professional_");
  }
  if (validatorFieldId.startsWith("sig_registered_principal_")) {
    return validatorFieldId.replace("sig_registered_principal_", "registered_principal_");
  }

  // Liquid Non-Qualified Assets reverse mappings
  if (validatorFieldId.startsWith("lnqa_")) {
    const suffix = validatorFieldId.replace("lnqa_", "");
    const mapping: Record<string, string> = {
      cash: "liquid_non_qualified_assets_cash_money_markets",
      brokerage_nonmanaged: "liquid_non_qualified_assets_brokerage_non_managed",
      managed_accounts: "liquid_non_qualified_assets_managed_accounts",
      mutual_funds_direct: "liquid_non_qualified_assets_mutual_funds_direct",
      annuities_less_surrender: "liquid_non_qualified_assets_annuities_less_surrender",
      cash_value_life: "liquid_non_qualified_assets_cash_value_life_insurance",
      other_business_collectibles: "liquid_non_qualified_assets_other_business_assets",
      total_liquid_assets: "liquid_non_qualified_assets_total_liquid_assets",
    };
    return mapping[suffix] || validatorFieldId;
  }

  // Liabilities reverse mappings
  if (validatorFieldId.startsWith("liab_")) {
    const suffix = validatorFieldId.replace("liab_", "");
    const mapping: Record<string, string> = {
      mortgage_primary_residence: "liabilities_mortgage_primary_residence",
      mortgages_secondary_investment: "liabilities_mortgages_secondary_investment",
      home_equity_loans: "liabilities_home_equity_loans",
      credit_cards: "liabilities_credit_cards",
      other: "liabilities_other_liabilities",
      total: "liabilities_total_liabilities",
    };
    return mapping[suffix] || validatorFieldId;
  }

  // Illiquid Non-Qualified Assets reverse mappings
  if (validatorFieldId.startsWith("inqa_")) {
    const suffix = validatorFieldId.replace("inqa_", "").replace("_value_equity", "");
    const mapping: Record<string, string> = {
      primary_residence: "illiquid_non_qualified_assets_primary_residence",
      investment_real_estate: "illiquid_non_qualified_assets_investment_real_estate",
      private_business: "illiquid_non_qualified_assets_private_business",
      total_illiquid_assets_equity: "illiquid_non_qualified_assets_total_illiquid_assets_equity",
    };
    return mapping[suffix] || validatorFieldId;
  }

  // Liquid Qualified Assets reverse mappings
  if (validatorFieldId.startsWith("lqa_")) {
    const suffix = validatorFieldId.replace("lqa_", "");
    const mapping: Record<string, string> = {
      cash: "liquid_qualified_assets_qualified_cash_money_markets",
      retirement_plans: "liquid_qualified_assets_retirement_plans",
      brokerage_nonmanaged: "liquid_qualified_assets_qualified_brokerage_non_managed",
      managed_accounts: "liquid_qualified_assets_qualified_managed_accounts",
      mutual_funds_direct: "liquid_qualified_assets_qualified_mutual_funds_direct",
      annuities: "liquid_qualified_assets_qualified_annuities",
      total: "liquid_qualified_assets_total_liquid_qualified_assets",
    };
    return mapping[suffix] || validatorFieldId;
  }

  // Income Summary reverse mappings
  if (validatorFieldId.startsWith("inc_")) {
    const suffix = validatorFieldId.replace("inc_", "");
    const mapping: Record<string, string> = {
      salary_commissions: "income_summary_salary_commissions",
      investment_income: "income_summary_investment_income",
      pension: "income_summary_pension",
      social_security: "income_summary_social_security",
      net_rental_income: "income_summary_net_rental_income",
      other: "income_summary_other_income",
      total_annual_income: "income_summary_total_annual_income",
    };
    return mapping[suffix] || validatorFieldId;
  }

  // Net Worth reverse mappings
  if (validatorFieldId.startsWith("nw_")) {
    const suffix = validatorFieldId.replace("nw_", "");
    const mapping: Record<string, string> = {
      total_assets_less_primary_residence: "net_worth_total_assets_less_primary_residence",
      total_liabilities: "net_worth_total_liabilities_net_worth",
      total_net_worth_assets_less_pr_minus_liab: "net_worth_total_net_worth_assets_less_pr",
      total_illiquid_securities: "net_worth_total_illiquid_securities",
      total_net_worth_final: "net_worth_total_net_worth",
      total_potential_liquidity: "net_worth_total_potential_liquidity",
    };
    return mapping[suffix] || validatorFieldId;
  }

  // Illiquid Qualified Assets reverse mappings
  if (validatorFieldId.startsWith("iqa_")) {
    if (validatorFieldId.startsWith("iqa_row_")) {
      const rowNum = validatorFieldId.replace("iqa_row_", "");
      return `illiquid_qualified_assets_illiquid_qualified_${rowNum}`;
    }
    if (validatorFieldId === "iqa_total") {
      return "illiquid_qualified_assets_total_illiquid_qualified_assets";
    }
  }

  // Return original if no mapping found
  return validatorFieldId;
}

/**
 * Map financial table row ID to validator field ID
 * Handles the case where table ID is like "liquid_non_qualified_assets" and row ID is "cash_money_markets"
 */
export function mapTableRowToValidatorId(tableId: string, rowId: string): string {
  const fullJsonId = `${tableId}_${rowId}`;
  return mapToValidatorId(fullJsonId);
}

/**
 * Transform form data from JSON schema IDs to validator IDs
 */
export function transformToValidatorData(
  formData: Record<string, any>
): Record<string, any> {
  const transformed: Record<string, any> = {};

  for (const [jsonId, value] of Object.entries(formData)) {
    const validatorId = mapToValidatorId(jsonId);
    transformed[validatorId] = value;
  }

  return transformed;
}

/**
 * Transform validator errors back to JSON schema IDs
 */
export function transformValidatorErrors(
  validatorErrors: Record<string, string>
): Record<string, string> {
  const transformed: Record<string, string> = {};

  for (const [validatorId, error] of Object.entries(validatorErrors)) {
    const jsonId = mapToJsonId(validatorId);
    transformed[jsonId] = error;
  }

  return transformed;
}

