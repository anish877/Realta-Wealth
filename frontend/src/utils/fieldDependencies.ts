import type { FieldValue } from '../types/form';

export type ConditionOperator = 
  | 'equals' 
  | 'includes' 
  | 'notEquals' 
  | 'notIncludes' 
  | 'checked' 
  | 'notChecked'
  | 'anyChecked'
  | 'noneChecked';

export interface FieldCondition {
  field: string;
  operator: ConditionOperator;
  value: string | string[] | boolean;
}

export interface FieldVisibilityRule {
  fieldId: string;
  showWhen?: FieldCondition[];
  hideWhen?: FieldCondition[];
  requireAll?: boolean; // If true, all conditions must match (AND). If false, any condition matches (OR)
}

/**
 * Check if a single condition is met
 */
function checkCondition(
  condition: FieldCondition,
  formData: Record<string, FieldValue>
): boolean {
  const fieldValue = formData[condition.field];
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    
    case 'notEquals':
      return fieldValue !== condition.value;
    
    case 'includes':
      if (Array.isArray(fieldValue)) {
        if (Array.isArray(condition.value)) {
          return condition.value.some(v => fieldValue.includes(v));
        }
        return fieldValue.includes(condition.value as string);
      }
      return false;
    
    case 'notIncludes':
      if (Array.isArray(fieldValue)) {
        if (Array.isArray(condition.value)) {
          return !condition.value.some(v => fieldValue.includes(v));
        }
        return !fieldValue.includes(condition.value as string);
      }
      return true;
    
    case 'checked':
      return fieldValue === true || fieldValue === 'Yes';
    
    case 'notChecked':
      return fieldValue === false || fieldValue === 'No' || !fieldValue;
    
    case 'anyChecked':
      if (Array.isArray(fieldValue)) {
        if (Array.isArray(condition.value)) {
          return condition.value.some(v => fieldValue.includes(v));
        }
        return fieldValue.length > 0;
      }
      return false;
    
    case 'noneChecked':
      if (Array.isArray(fieldValue)) {
        return fieldValue.length === 0;
      }
      return !fieldValue;
    
    default:
      return false;
  }
}

/**
 * Check if all conditions in an array are met
 */
function checkConditions(
  conditions: FieldCondition[],
  formData: Record<string, FieldValue>,
  requireAll: boolean = true
): boolean {
  if (conditions.length === 0) return true;
  
  if (requireAll) {
    // AND logic: all conditions must be true
    return conditions.every(condition => checkCondition(condition, formData));
  } else {
    // OR logic: at least one condition must be true
    return conditions.some(condition => checkCondition(condition, formData));
  }
}

/**
 * Determine if a field should be visible based on its rules
 */
export function shouldShowField(
  fieldId: string,
  formData: Record<string, FieldValue>,
  rules: FieldVisibilityRule[]
): boolean {
  const rule = rules.find(r => r.fieldId === fieldId);
  if (!rule) return true; // Show by default if no rule exists
  
  // Check hideWhen conditions first (they take precedence)
  if (rule.hideWhen && rule.hideWhen.length > 0) {
    const shouldHide = checkConditions(rule.hideWhen, formData, rule.requireAll);
    if (shouldHide) return false;
  }
  
  // Check showWhen conditions
  if (rule.showWhen && rule.showWhen.length > 0) {
    const shouldShow = checkConditions(rule.showWhen, formData, rule.requireAll);
    if (!shouldShow) return false;
  }
  
  return true;
}

/**
 * All field visibility rules for the investor profile form
 */
export const fieldVisibilityRules: FieldVisibilityRule[] = [
  // Step 1: Account Registration
  {
    fieldId: 'joint_accounts_only',
    showWhen: [{ field: 'type_of_account', operator: 'includes', value: 'joint_tenant' }],
  },
  {
    fieldId: 'for_custodial_accounts_only',
    showWhen: [{ field: 'type_of_account', operator: 'includes', value: 'custodial' }],
  },
  {
    fieldId: 'other_account_type_text',
    showWhen: [{ field: 'type_of_account_right', operator: 'includes', value: 'other_account_type' }],
  },
  // Trust block fields - show when Trust checkbox is checked OR trust is in account types
  {
    fieldId: 'trust_block',
    showWhen: [
      { field: 'trust_checkbox', operator: 'checked', value: true },
      { field: 'type_of_account', operator: 'includes', value: 'trust' }
    ],
    requireAll: false, // OR logic - show if checkbox checked OR trust in account types
  },
  {
    fieldId: 'trust_establishment_date',
    showWhen: [
      { field: 'trust_checkbox', operator: 'checked', value: true },
      { field: 'type_of_account', operator: 'includes', value: 'trust' }
    ],
    requireAll: false,
  },
  {
    fieldId: 'trust_type',
    showWhen: [
      { field: 'trust_checkbox', operator: 'checked', value: true },
      { field: 'type_of_account', operator: 'includes', value: 'trust' }
    ],
    requireAll: false,
  },
  // Transfer on Death agreement dates
  {
    fieldId: 'transfer_on_death_individual_agreement_date',
    showWhen: [{ field: 'type_of_account', operator: 'includes', value: 'transfer_on_death_individual' }],
  },
  {
    fieldId: 'transfer_on_death_joint_agreement_date',
    showWhen: [{ field: 'type_of_account', operator: 'includes', value: 'transfer_on_death_joint' }],
  },
  
  // Step 2: Patriot Act
  {
    fieldId: 'initial_source_of_funds_other_text',
    showWhen: [{ field: 'initial_source_of_funds', operator: 'includes', value: 'Other' }],
  },
  
  // Step 3: Primary Account Holder - Person/Entity
  {
    fieldId: 'primary_ssn',
    showWhen: [{ field: 'primary_person_entity', operator: 'equals', value: 'Person' }],
  },
  {
    fieldId: 'primary_dob',
    showWhen: [{ field: 'primary_person_entity', operator: 'equals', value: 'Person' }],
  },
  {
    fieldId: 'primary_gender',
    showWhen: [{ field: 'primary_person_entity', operator: 'equals', value: 'Person' }],
  },
  {
    fieldId: 'primary_marital_status',
    showWhen: [{ field: 'primary_person_entity', operator: 'equals', value: 'Person' }],
  },
  {
    fieldId: 'primary_ein',
    showWhen: [{ field: 'primary_person_entity', operator: 'equals', value: 'Entity' }],
  },
  {
    fieldId: 'primary_yes_no_box',
    showWhen: [{ field: 'primary_person_entity', operator: 'equals', value: 'Entity' }],
  },
  {
    fieldId: 'primary_specified_adult',
    showWhen: [{ field: 'primary_person_entity', operator: 'equals', value: 'Person' }],
  },
  // Primary mailing address fields - show when checkbox indicates different address
  {
    fieldId: 'primary_mailing_address',
    hideWhen: [{ field: 'primary_mailing_same_as_legal', operator: 'checked', value: true }],
  },
  {
    fieldId: 'primary_mailing_city',
    hideWhen: [{ field: 'primary_mailing_same_as_legal', operator: 'checked', value: true }],
  },
  {
    fieldId: 'primary_mailing_state_province',
    hideWhen: [{ field: 'primary_mailing_same_as_legal', operator: 'checked', value: true }],
  },
  {
    fieldId: 'primary_mailing_zip_postal_code',
    hideWhen: [{ field: 'primary_mailing_same_as_legal', operator: 'checked', value: true }],
  },
  {
    fieldId: 'primary_mailing_country',
    hideWhen: [{ field: 'primary_mailing_same_as_legal', operator: 'checked', value: true }],
  },
  
  // Step 3: Primary Account Holder - Employment
  {
    fieldId: 'primary_occupation',
    showWhen: [
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false, // OR logic
  },
  {
    fieldId: 'primary_years_employed',
    showWhen: [
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'primary_type_of_business',
    showWhen: [
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'primary_employer_name',
    showWhen: [
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'primary_employer_address',
    showWhen: [
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'primary_employer_city',
    showWhen: [
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'primary_employer_state_province',
    showWhen: [
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'primary_employer_zip_postal_code',
    showWhen: [
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'primary_employer_country',
    showWhen: [
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'primary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  
  // Step 3: Primary Account Holder - Advisory Firm
  {
    fieldId: 'primary_related_to_employee_advisory',
    showWhen: [{ field: 'primary_employee_of_advisory_firm', operator: 'equals', value: 'Yes' }],
  },
  {
    fieldId: 'primary_employee_name_and_relationship',
    showWhen: [{ field: 'primary_related_to_employee_advisory', operator: 'equals', value: 'Yes' }],
  },
  
  // Step 3: Primary Account Holder - Broker-Dealer
  {
    fieldId: 'primary_broker_dealer_name',
    showWhen: [{ field: 'primary_employee_of_broker_dealer', operator: 'equals', value: 'Yes' }],
  },
  {
    fieldId: 'primary_broker_dealer_employee_name',
    showWhen: [{ field: 'primary_related_to_employee_broker_dealer', operator: 'equals', value: 'Yes' }],
  },
  {
    fieldId: 'primary_broker_dealer_employee_relationship',
    showWhen: [{ field: 'primary_related_to_employee_broker_dealer', operator: 'equals', value: 'Yes' }],
  },
  
  // Step 3: Primary Account Holder - Other Brokerage Accounts
  {
    fieldId: 'primary_with_what_firms',
    showWhen: [{ field: 'primary_maintaining_other_brokerage_accounts', operator: 'equals', value: 'Yes' }],
  },
  {
    fieldId: 'primary_years_of_investment_experience',
    showWhen: [{ field: 'primary_maintaining_other_brokerage_accounts', operator: 'equals', value: 'Yes' }],
  },
  
  // Step 3: Primary Account Holder - Exchange/FINRA
  {
    fieldId: 'primary_affiliation_employer_authorization_required',
    showWhen: [{ field: 'primary_affiliated_with_exchange_or_finra', operator: 'equals', value: 'Yes' }],
  },
  
  // Step 3: Primary Account Holder - Public Company
  {
    fieldId: 'primary_company_names',
    showWhen: [{ field: 'primary_senior_officer_or_10pct_shareholder', operator: 'equals', value: 'Yes' }],
  },
  
  // Step 4: Secondary Account Holder - Person/Entity (same logic as primary)
  {
    fieldId: 'secondary_ssn',
    showWhen: [{ field: 'secondary_person_entity', operator: 'equals', value: 'Person' }],
  },
  {
    fieldId: 'secondary_date_of_birth',
    showWhen: [{ field: 'secondary_person_entity', operator: 'equals', value: 'Person' }],
  },
  {
    fieldId: 'secondary_gender',
    showWhen: [{ field: 'secondary_person_entity', operator: 'equals', value: 'Person' }],
  },
  {
    fieldId: 'secondary_marital_status',
    showWhen: [{ field: 'secondary_person_entity', operator: 'equals', value: 'Person' }],
  },
  {
    fieldId: 'secondary_ein',
    showWhen: [{ field: 'secondary_person_entity', operator: 'equals', value: 'Entity' }],
  },
  {
    fieldId: 'secondary_yes_no_box',
    showWhen: [{ field: 'secondary_person_entity', operator: 'equals', value: 'Entity' }],
  },
  {
    fieldId: 'secondary_specified_adult',
    showWhen: [{ field: 'secondary_person_entity', operator: 'equals', value: 'Person' }],
  },
  // Secondary mailing address fields - show when checkbox indicates different address
  {
    fieldId: 'secondary_mailing_address',
    hideWhen: [{ field: 'secondary_mailing_same_as_legal', operator: 'checked', value: true }],
  },
  {
    fieldId: 'secondary_mailing_city',
    hideWhen: [{ field: 'secondary_mailing_same_as_legal', operator: 'checked', value: true }],
  },
  {
    fieldId: 'secondary_mailing_state_province',
    hideWhen: [{ field: 'secondary_mailing_same_as_legal', operator: 'checked', value: true }],
  },
  {
    fieldId: 'secondary_mailing_zip_postal_code',
    hideWhen: [{ field: 'secondary_mailing_same_as_legal', operator: 'checked', value: true }],
  },
  {
    fieldId: 'secondary_mailing_country',
    hideWhen: [{ field: 'secondary_mailing_same_as_legal', operator: 'checked', value: true }],
  },
  
  // Step 4: Secondary Account Holder - Employment (same logic as primary)
  {
    fieldId: 'secondary_occupation',
    showWhen: [
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'secondary_years_employed',
    showWhen: [
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'secondary_type_of_business',
    showWhen: [
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'secondary_employer_name',
    showWhen: [
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'secondary_employer_address',
    showWhen: [
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'secondary_employer_city',
    showWhen: [
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'secondary_employer_state_province',
    showWhen: [
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'secondary_employer_zip_postal_code',
    showWhen: [
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  {
    fieldId: 'secondary_employer_country',
    showWhen: [
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Employed' },
      { field: 'secondary_employment_affiliations', operator: 'includes', value: 'Self-Employed' },
    ],
    requireAll: false,
  },
  
  // Step 4: Secondary Account Holder - Advisory Firm
  {
    fieldId: 'secondary_related_to_employee_advisory',
    showWhen: [{ field: 'secondary_employee_of_advisory_firm', operator: 'equals', value: 'Yes' }],
  },
  {
    fieldId: 'secondary_employee_name',
    showWhen: [{ field: 'secondary_related_to_employee_advisory', operator: 'equals', value: 'Yes' }],
  },
  
  // Step 4: Secondary Account Holder - Broker-Dealer
  {
    fieldId: 'secondary_broker_dealer_name',
    showWhen: [{ field: 'secondary_employee_of_broker_dealer', operator: 'equals', value: 'Yes' }],
  },
  {
    fieldId: 'secondary_related_to_employee_broker_dealer',
    showWhen: [{ field: 'secondary_employee_of_broker_dealer', operator: 'equals', value: 'Yes' }],
  },
  {
    fieldId: 'secondary_broker_dealer_employee_name',
    showWhen: [{ field: 'secondary_related_to_employee_broker_dealer', operator: 'equals', value: 'Yes' }],
  },
  {
    fieldId: 'secondary_broker_dealer_employee_relationship',
    showWhen: [{ field: 'secondary_related_to_employee_broker_dealer', operator: 'equals', value: 'Yes' }],
  },
  
  // Step 4: Secondary Account Holder - Other Brokerage Accounts
  {
    fieldId: 'secondary_with_what_firms',
    showWhen: [{ field: 'secondary_maintaining_other_brokerage_accounts', operator: 'equals', value: 'Yes' }],
  },
  {
    fieldId: 'secondary_years_investment_experience',
    showWhen: [{ field: 'secondary_maintaining_other_brokerage_accounts', operator: 'equals', value: 'Yes' }],
  },
  
  // Step 4: Secondary Account Holder - Exchange/FINRA
  {
    fieldId: 'secondary_affiliation_details',
    showWhen: [{ field: 'secondary_affiliated_with_exchange_or_finra', operator: 'equals', value: 'Yes' }],
  },
  
  // Step 4: Secondary Account Holder - Public Company
  {
    fieldId: 'secondary_company_names',
    showWhen: [{ field: 'secondary_senior_officer_or_10pct_shareholder', operator: 'equals', value: 'Yes' }],
  },
  
  // Step 5: Objectives
  {
    fieldId: 'other_investments_table',
    hideWhen: [{ field: 'other_investments_see_attached', operator: 'checked', value: true }],
  },
  
  // Step 6: Trusted Contact
  {
    fieldId: 'trusted_contact_name',
    hideWhen: [{ field: 'trusted_contact_decline_to_provide', operator: 'checked', value: true }],
  },
  {
    fieldId: 'trusted_contact_email',
    hideWhen: [{ field: 'trusted_contact_decline_to_provide', operator: 'checked', value: true }],
  },
  {
    fieldId: 'trusted_contact_home_phone',
    hideWhen: [{ field: 'trusted_contact_decline_to_provide', operator: 'checked', value: true }],
  },
  {
    fieldId: 'trusted_contact_business_phone',
    hideWhen: [{ field: 'trusted_contact_decline_to_provide', operator: 'checked', value: true }],
  },
  {
    fieldId: 'trusted_contact_mobile_phone',
    hideWhen: [{ field: 'trusted_contact_decline_to_provide', operator: 'checked', value: true }],
  },
  {
    fieldId: 'trusted_contact_mailing_address',
    hideWhen: [{ field: 'trusted_contact_decline_to_provide', operator: 'checked', value: true }],
  },
  {
    fieldId: 'trusted_contact_city',
    hideWhen: [{ field: 'trusted_contact_decline_to_provide', operator: 'checked', value: true }],
  },
  {
    fieldId: 'trusted_contact_state_province',
    hideWhen: [{ field: 'trusted_contact_decline_to_provide', operator: 'checked', value: true }],
  },
  {
    fieldId: 'trusted_contact_zip_postal_code',
    hideWhen: [{ field: 'trusted_contact_decline_to_provide', operator: 'checked', value: true }],
  },
  {
    fieldId: 'trusted_contact_country',
    hideWhen: [{ field: 'trusted_contact_decline_to_provide', operator: 'checked', value: true }],
  },
  
  // Step 7: Signatures
  {
    fieldId: 'joint_account_owner_signature',
    showWhen: [{ field: 'type_of_account', operator: 'includes', value: 'joint_tenant' }],
  },
  {
    fieldId: 'joint_account_owner_printed_name',
    showWhen: [{ field: 'type_of_account', operator: 'includes', value: 'joint_tenant' }],
  },
  {
    fieldId: 'joint_account_owner_date',
    showWhen: [{ field: 'type_of_account', operator: 'includes', value: 'joint_tenant' }],
  },
];

