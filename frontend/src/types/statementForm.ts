export type FieldValue = string | number | boolean | string[] | Record<string, any> | null | undefined;

export interface StatementFormData {
  // Account Registration
  rr_name?: string;
  rr_no?: string;
  customer_names?: string;

  // Liquid Non-Qualified Assets
  liquid_non_qualified_cash_money_markets?: string;
  liquid_non_qualified_brokerage_non_managed?: string;
  liquid_non_qualified_managed_accounts?: string;
  liquid_non_qualified_mutual_funds_direct?: string;
  liquid_non_qualified_annuities_less_surrender?: string;
  liquid_non_qualified_cash_value_life_insurance?: string;
  liquid_non_qualified_other_business_assets?: string;
  liquid_non_qualified_total_liquid_assets?: string;

  // Liabilities
  liabilities_mortgage_primary_residence?: string;
  liabilities_mortgages_secondary_investment?: string;
  liabilities_home_equity_loans?: string;
  liabilities_credit_cards?: string;
  liabilities_other_liabilities?: string;
  liabilities_total_liabilities?: string;

  // Net Worth
  net_worth_total_assets_less_primary_residence?: string;
  net_worth_total_liabilities_net_worth?: string;
  net_worth_total_net_worth_assets_less_pr?: string;
  net_worth_total_illiquid_securities?: string;
  net_worth_total_net_worth?: string;
  net_worth_total_potential_liquidity?: string;

  // Illiquid Non-Qualified Assets
  illiquid_non_qualified_primary_residence?: string;
  illiquid_non_qualified_investment_real_estate?: string;
  illiquid_non_qualified_private_business?: string;
  illiquid_non_qualified_total_illiquid_assets_equity?: string;

  // Liquid Qualified Assets
  liquid_qualified_cash_money_markets?: string;
  liquid_qualified_retirement_plans?: string;
  liquid_qualified_brokerage_non_managed?: string;
  liquid_qualified_managed_accounts?: string;
  liquid_qualified_mutual_funds_direct?: string;
  liquid_qualified_annuities?: string;
  liquid_qualified_total_liquid_qualified_assets?: string;

  // Income Summary
  income_summary_salary_commissions?: string;
  income_summary_investment_income?: string;
  income_summary_pension?: string;
  income_summary_social_security?: string;
  income_summary_net_rental_income?: string;
  income_summary_other_income?: string;
  income_summary_total_annual_income?: string;

  // Illiquid Qualified Assets (dynamic rows)
  illiquid_qualified_assets?: Array<{
    id: string;
    label?: string;
    value?: string;
  }>;

  // Notes
  notes_page1?: string;
  additional_notes?: string;

  // Signatures
  account_owner_signature?: string;
  account_owner_printed_name?: string;
  account_owner_date?: string;
  joint_account_owner_signature?: string;
  joint_account_owner_printed_name?: string;
  joint_account_owner_date?: string;
  financial_professional_signature?: string;
  financial_professional_printed_name?: string;
  financial_professional_date?: string;
  registered_principal_signature?: string;
  registered_principal_printed_name?: string;
  registered_principal_date?: string;
}

export interface FinancialTableRow {
  id: string;
  label: string;
  field_type: "currency" | "text";
  is_total?: boolean;
  allow_custom_label?: boolean;
}

export interface FinancialTableField {
  id: string;
  label: string;
  type: "financial_table";
  page: number;
  columns: string[];
  rows: FinancialTableRow[];
  allow_add_rows?: boolean;
}

export interface StatementField {
  id: string;
  label: string;
  type: string;
  page?: number;
  options?: string[];
  fields?: StatementField[];
  columns?: string[];
  rows?: FinancialTableRow[];
  allow_add_rows?: boolean;
  bullets?: string[];
  signature_lines?: Array<{
    role: string;
    fields: Array<{
      id: string;
      label: string;
      type: string;
    }>;
  }>;
}

export interface StatementSection {
  sectionId: string;
  title: string;
  page: number;
  fields: StatementField[];
}

