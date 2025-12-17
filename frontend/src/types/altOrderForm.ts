export type FieldValue = string | number | boolean | null | undefined;

export interface AltOrderField {
  id: string;
  label: string;
  type: string;
  page?: number;
  options?: string[];
  prefix?: string;
  suffix?: string;
  notes?: string;
  bullets?: string[];
  role?: string;
}

export interface AltOrderSection {
  sectionId: string;
  title: string;
  page: number;
  fields: AltOrderField[];
}

export interface AltOrderFormData {
  // Customer/Account Information
  rr_name?: string;
  rr_no?: string;
  customer_names?: string;
  proposed_principal_amount?: string;
  qualified_account?: "Yes" | "No";
  qualified_account_certification_text?: string;
  solicited_trade?: "Yes" | "No";
  tax_advantage_purchase?: "Yes" | "No";

  // Customer Order Information
  custodian?: string;
  name_of_product?: string;
  sponsor_issuer?: string;
  date_of_ppm?: string;
  date_ppm_sent?: string;
  existing_illiquid_alt_positions?: string;
  existing_illiquid_alt_concentration?: string;
  existing_semi_liquid_alt_positions?: string;
  existing_semi_liquid_alt_concentration?: string;
  existing_tax_advantage_alt_positions?: string;
  existing_tax_advantage_alt_concentration?: string;
  total_net_worth?: string;
  liquid_net_worth?: string;
  total_concentration?: string;

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

  // Internal Use Only
  registered_principal_signature?: string;
  registered_principal_printed_name?: string;
  registered_principal_date?: string;
  notes?: string;
  reg_bi_delivery?: boolean;
  state_registration?: boolean;
  ai_insight?: boolean;
  statement_of_financial_condition?: boolean;
  suitability_received?: boolean;

  // Derived fields
  has_joint_owner?: boolean;
}

