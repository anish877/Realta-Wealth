/**
 * TypeScript types for Additional Holder / Participant Information Supplement form
 */

export type FieldValue = string | number | boolean | null | undefined | string[] | RangeCurrencyValue | GovernmentIdBlock | InvestmentKnowledgeRow;

export interface RangeCurrencyValue {
  from: string | number | null | undefined;
  to: string | number | null | undefined;
}

export interface InvestmentKnowledgeRow {
  investment: string;
  knowledge: "Limited" | "Moderate" | "Extensive" | "None" | "";
  sinceYear: string;
}

export interface GovernmentIdBlock {
  type: string;
  idNumber: string;
  countryOfIssue: string;
  dateOfIssue: string;
  dateOfExpiration: string;
}

export interface YesNoQuestion {
  question: string;
  answer: "Yes" | "No" | "";
  followUpFields?: Record<string, FieldValue>;
}

export interface AdditionalHolderFormData {
  [key: string]: FieldValue | undefined;
  // Basic Information
  account_registration?: string;
  rr_name?: string;
  rr_no?: string;
  name?: string;
  person_entity?: string[];
  ssn?: string;
  ein?: string;
  holder_participant_role?: string;
  email?: string;
  dob?: string;
  position_held?: string;
  home_phone?: string;
  business_phone?: string;
  mobile_phone?: string;

  // Legal Address
  legal_address_line?: string;
  legal_city?: string;
  legal_state_province?: string;
  legal_zip_postal_code?: string;
  legal_country?: string;

  // Mailing Address
  mailing_address_line?: string;
  mailing_city?: string;
  mailing_state_province?: string;
  mailing_zip_postal_code?: string;
  mailing_country?: string;
  mailing_same_as_legal?: boolean;

  // Personal Information
  primary_citizenship?: string;
  additional_citizenship?: string;
  gender?: string[];
  marital_status?: string[];

  // Employment
  employment_status?: string[];
  occupation?: string;
  years_employed?: string;
  type_of_business?: string;
  employer_name?: string;
  employer_address_line?: string;
  employer_city?: string;
  employer_state_province?: string;
  employer_zip_postal_code?: string;
  employer_country?: string;

  // Investment Knowledge - Overall
  overall_level?: string[];

  // Investment Knowledge - Page 1 (6 types)
  commodities_futures_knowledge?: string[];
  commodities_futures_since_year?: string;
  equities_knowledge?: string[];
  equities_since_year?: string;
  exchange_traded_funds_knowledge?: string[];
  exchange_traded_funds_since_year?: string;
  fixed_annuities_knowledge?: string[];
  fixed_annuities_since_year?: string;
  fixed_insurance_knowledge?: string[];
  fixed_insurance_since_year?: string;
  mutual_funds_knowledge?: string[];
  mutual_funds_since_year?: string;

  // Investment Knowledge - Page 2 (9 types)
  options_knowledge?: string[];
  options_since_year?: string;
  precious_metals_knowledge?: string[];
  precious_metals_since_year?: string;
  real_estate_knowledge?: string[];
  real_estate_since_year?: string;
  unit_investment_trusts_knowledge?: string[];
  unit_investment_trusts_since_year?: string;
  variable_annuities_knowledge?: string[];
  variable_annuities_since_year?: string;
  leveraged_inverse_etfs_knowledge?: string[];
  leveraged_inverse_etfs_since_year?: string;
  complex_products_knowledge?: string[];
  complex_products_since_year?: string;
  alternative_investments_knowledge?: string[];
  alternative_investments_since_year?: string;
  other_investments_knowledge?: string[];
  other_investments_since_year?: string;
  other_investments_label?: string;

  // Financial Information
  annual_income?: RangeCurrencyValue;
  net_worth?: RangeCurrencyValue;
  liquid_net_worth?: RangeCurrencyValue;
  tax_bracket?: string[];

  // Government IDs
  gov_id_1_type?: string;
  gov_id_1_number?: string;
  gov_id_1_country_of_issue?: string;
  gov_id_1_date_of_issue?: string;
  gov_id_1_date_of_expiration?: string;

  gov_id_2_type?: string;
  gov_id_2_number?: string;
  gov_id_2_country_of_issue?: string;
  gov_id_2_date_of_issue?: string;
  gov_id_2_date_of_expiration?: string;

  // Employment/Affiliation Questions
  employee_of_this_broker_dealer?: "Yes" | "No" | "";
  related_to_employee_at_this_broker_dealer?: "Yes" | "No" | "";
  employee_name?: string;
  relationship?: string;
  employee_of_another_broker_dealer?: "Yes" | "No" | "";
  broker_dealer_name?: string;
  related_to_employee_at_another_broker_dealer?: "Yes" | "No" | "";
  broker_dealer_name_2?: string;
  employee_name_2?: string;
  relationship_2?: string;
  maintaining_other_brokerage_accounts?: "Yes" | "No" | "";
  with_what_firms?: string;
  years_of_investment_experience?: string;
  affiliated_with_exchange_or_finra?: "Yes" | "No" | "";
  what_is_the_affiliation?: string;
  senior_officer_director_shareholder?: "Yes" | "No" | "";
  company_names?: string;

  // Signature
  signature?: string;
  printed_name?: string;
  date?: string;
}

export interface AdditionalHolderField {
  id: string;
  label: string;
  type: string;
  page?: number;
  options?: string[] | { key: string; label: string }[];
  fields?: AdditionalHolderField[];
  follow_up_fields?: AdditionalHolderField[];
  range_labels?: string[];
  notes?: string;
}

export interface AdditionalHolderSection {
  sectionId: string;
  title: string;
  page: number;
  fields: AdditionalHolderField[];
}

