type FieldValue = string | number | boolean | string[] | Record<string, any>[];

export interface ValidationError {
  fieldId: string;
  message: string;
}

export interface ValidationRule {
  fieldId: string;
  required?: boolean;
  requiredWhen?: {
    field: string;
    operator: 'equals' | 'includes' | 'checked';
    value: string | string[] | boolean;
  };
  format?: 'ssn' | 'ein' | 'email' | 'phone' | 'date' | 'currency';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  custom?: (value: FieldValue, formData: Record<string, FieldValue>) => string | null;
}

/**
 * Format validators
 */
function validateSSN(value: string): string | null {
  // SSN format: XXX-XX-XXXX
  const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
  if (!ssnRegex.test(value)) {
    return 'SSN must be in format XXX-XX-XXXX';
  }
  return null;
}

function validateEIN(value: string): string | null {
  // EIN format: XX-XXXXXXX
  const einRegex = /^\d{2}-\d{7}$/;
  if (!einRegex.test(value)) {
    return 'EIN must be in format XX-XXXXXXX';
  }
  return null;
}

function validateEmail(value: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address';
  }
  return null;
}

function validatePhone(value: string): string | null {
  // Allow various phone formats: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXXXXXXXXX
  const phoneRegex = /^[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
    return 'Please enter a valid phone number';
  }
  return null;
}

function validateDate(value: string): string | null {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return 'Please enter a valid date';
  }
  return null;
}

function validateCurrency(value: string): string | null {
  // Currency should be a valid number
  const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  if (isNaN(numValue) || numValue < 0) {
    return 'Please enter a valid currency amount';
  }
  return null;
}

/**
 * Check if a condition is met for conditional required fields
 */
function checkCondition(
  condition: { field: string; operator: 'equals' | 'includes' | 'checked'; value: string | string[] | boolean },
  formData: Record<string, FieldValue>
): boolean {
  const fieldValue = formData[condition.field];
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    case 'includes':
      if (Array.isArray(fieldValue)) {
        if (Array.isArray(condition.value)) {
          return condition.value.some(v => fieldValue.includes(v));
        }
        return fieldValue.includes(condition.value as string);
      }
      return false;
    case 'checked':
      return fieldValue === true || fieldValue === 'Yes';
    default:
      return false;
  }
}

/**
 * Validate a single field against its rules
 */
function validateField(
  fieldId: string,
  value: FieldValue,
  rule: ValidationRule,
  formData: Record<string, FieldValue>
): string | null {
  // Check required
  if (rule.required) {
    if (value === '' || value === null || value === undefined) {
      return 'This field is required';
    }
    if (Array.isArray(value) && value.length === 0) {
      return 'At least one option must be selected';
    }
  }
  
  // Check conditional required
  if (rule.requiredWhen) {
    const conditionMet = checkCondition(rule.requiredWhen, formData);
    if (conditionMet) {
      if (value === '' || value === null || value === undefined) {
        return 'This field is required';
      }
      if (Array.isArray(value) && value.length === 0) {
        return 'At least one option must be selected';
      }
    }
  }
  
  // Format validation (only for string values)
  if (rule.format && typeof value === 'string' && value !== '') {
    switch (rule.format) {
      case 'ssn':
        return validateSSN(value);
      case 'ein':
        return validateEIN(value);
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'date':
        return validateDate(value);
      case 'currency':
        return validateCurrency(value);
    }
  }
  
  // Length validation
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return `Must be at least ${rule.minLength} characters`;
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return `Must be no more than ${rule.maxLength} characters`;
    }
  }
  
  // Numeric validation
  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return `Must be at least ${rule.min}`;
    }
    if (rule.max !== undefined && value > rule.max) {
      return `Must be no more than ${rule.max}`;
    }
  }
  
  // Custom validation
  if (rule.custom) {
    return rule.custom(value, formData);
  }
  
  return null;
}

/**
 * All validation rules for the investor profile form
 */
export const validationRules: ValidationRule[] = [
  // Step 1: Account Registration
  {
    fieldId: 'rr_name',
    required: true,
  },
  {
    fieldId: 'customer_names',
    required: true,
  },
  
  // Step 3: Primary Account Holder
  {
    fieldId: 'primary_name',
    required: true,
  },
  {
    fieldId: 'primary_person_entity',
    required: true,
  },
  {
    fieldId: 'primary_ssn',
    requiredWhen: { field: 'primary_person_entity', operator: 'equals', value: 'Person' },
    format: 'ssn',
  },
  {
    fieldId: 'primary_ein',
    requiredWhen: { field: 'primary_person_entity', operator: 'equals', value: 'Entity' },
    format: 'ein',
  },
  {
    fieldId: 'primary_email',
    format: 'email',
  },
  {
    fieldId: 'primary_dob',
    requiredWhen: { field: 'primary_person_entity', operator: 'equals', value: 'Person' },
    format: 'date',
    custom: (value, formData) => {
      if (typeof value === 'string' && value !== '') {
        const dob = new Date(value);
        const today = new Date();
        if (dob >= today) {
          return 'Date of birth must be in the past';
        }
      }
      return null;
    },
  },
  {
    fieldId: 'primary_legal_address',
    required: true,
  },
  {
    fieldId: 'primary_city',
    required: true,
  },
  {
    fieldId: 'primary_state_province',
    required: true,
  },
  {
    fieldId: 'primary_zip_postal_code',
    required: true,
  },
  {
    fieldId: 'primary_country',
    required: true,
  },
  {
    fieldId: 'primary_mailing_address',
    requiredWhen: { field: 'primary_mailing_same_as_legal', operator: 'checked', value: false },
  },
  {
    fieldId: 'primary_mailing_city',
    requiredWhen: { field: 'primary_mailing_same_as_legal', operator: 'checked', value: false },
  },
  {
    fieldId: 'primary_mailing_state_province',
    requiredWhen: { field: 'primary_mailing_same_as_legal', operator: 'checked', value: false },
  },
  {
    fieldId: 'primary_mailing_zip_postal_code',
    requiredWhen: { field: 'primary_mailing_same_as_legal', operator: 'checked', value: false },
  },
  {
    fieldId: 'primary_mailing_country',
    requiredWhen: { field: 'primary_mailing_same_as_legal', operator: 'checked', value: false },
  },
  {
    fieldId: 'primary_occupation',
    requiredWhen: {
      field: 'primary_employment_affiliations',
      operator: 'includes',
      value: ['Employed', 'Self-Employed'],
    },
  },
  {
    fieldId: 'primary_employer_name',
    requiredWhen: {
      field: 'primary_employment_affiliations',
      operator: 'includes',
      value: ['Employed', 'Self-Employed'],
    },
  },
  {
    fieldId: 'primary_employee_name_and_relationship',
    requiredWhen: { field: 'primary_related_to_employee_advisory', operator: 'equals', value: 'Yes' },
  },
  {
    fieldId: 'primary_broker_dealer_name',
    requiredWhen: { field: 'primary_employee_of_broker_dealer', operator: 'equals', value: 'Yes' },
  },
  {
    fieldId: 'primary_broker_dealer_employee_name',
    requiredWhen: { field: 'primary_related_to_employee_broker_dealer', operator: 'equals', value: 'Yes' },
  },
  {
    fieldId: 'primary_broker_dealer_employee_relationship',
    requiredWhen: { field: 'primary_related_to_employee_broker_dealer', operator: 'equals', value: 'Yes' },
  },
  {
    fieldId: 'primary_with_what_firms',
    requiredWhen: { field: 'primary_maintaining_other_brokerage_accounts', operator: 'equals', value: 'Yes' },
  },
  {
    fieldId: 'primary_years_of_investment_experience',
    requiredWhen: { field: 'primary_maintaining_other_brokerage_accounts', operator: 'equals', value: 'Yes' },
  },
  {
    fieldId: 'primary_affiliation_employer_authorization_required',
    requiredWhen: { field: 'primary_affiliated_with_exchange_or_finra', operator: 'equals', value: 'Yes' },
  },
  {
    fieldId: 'primary_company_names',
    requiredWhen: { field: 'primary_senior_officer_or_10pct_shareholder', operator: 'equals', value: 'Yes' },
  },
  
  // Step 4: Secondary Account Holder (same rules as primary)
  {
    fieldId: 'secondary_name',
    required: true,
  },
  {
    fieldId: 'secondary_person_entity',
    required: true,
  },
  {
    fieldId: 'secondary_ssn',
    requiredWhen: { field: 'secondary_person_entity', operator: 'equals', value: 'Person' },
    format: 'ssn',
  },
  {
    fieldId: 'secondary_ein',
    requiredWhen: { field: 'secondary_person_entity', operator: 'equals', value: 'Entity' },
    format: 'ein',
  },
  {
    fieldId: 'secondary_email',
    format: 'email',
  },
  {
    fieldId: 'secondary_date_of_birth',
    requiredWhen: { field: 'secondary_person_entity', operator: 'equals', value: 'Person' },
    format: 'date',
    custom: (value, formData) => {
      if (typeof value === 'string' && value !== '') {
        const dob = new Date(value);
        const today = new Date();
        if (dob >= today) {
          return 'Date of birth must be in the past';
        }
      }
      return null;
    },
  },
  {
    fieldId: 'secondary_legal_address',
    required: true,
  },
  {
    fieldId: 'secondary_city',
    required: true,
  },
  {
    fieldId: 'secondary_state_province',
    required: true,
  },
  {
    fieldId: 'secondary_zip_postal_code',
    required: true,
  },
  {
    fieldId: 'secondary_country',
    required: true,
  },
  {
    fieldId: 'secondary_mailing_address',
    requiredWhen: { field: 'secondary_mailing_same_as_legal', operator: 'checked', value: false },
  },
  {
    fieldId: 'secondary_mailing_city',
    requiredWhen: { field: 'secondary_mailing_same_as_legal', operator: 'checked', value: false },
  },
  {
    fieldId: 'secondary_mailing_state_province',
    requiredWhen: { field: 'secondary_mailing_same_as_legal', operator: 'checked', value: false },
  },
  {
    fieldId: 'secondary_mailing_zip_postal_code',
    requiredWhen: { field: 'secondary_mailing_same_as_legal', operator: 'checked', value: false },
  },
  {
    fieldId: 'secondary_mailing_country',
    requiredWhen: { field: 'secondary_mailing_same_as_legal', operator: 'checked', value: false },
  },
  {
    fieldId: 'secondary_occupation',
    requiredWhen: {
      field: 'secondary_employment_affiliations',
      operator: 'includes',
      value: ['Employed', 'Self-Employed'],
    },
  },
  {
    fieldId: 'secondary_employer_name',
    requiredWhen: {
      field: 'secondary_employment_affiliations',
      operator: 'includes',
      value: ['Employed', 'Self-Employed'],
    },
  },
  {
    fieldId: 'secondary_employee_name',
    requiredWhen: { field: 'secondary_related_to_employee_advisory', operator: 'equals', value: 'Yes' },
  },
  {
    fieldId: 'secondary_broker_dealer_name',
    requiredWhen: { field: 'secondary_employee_of_broker_dealer', operator: 'equals', value: 'Yes' },
  },
  {
    fieldId: 'secondary_broker_dealer_employee_name',
    requiredWhen: { field: 'secondary_related_to_employee_broker_dealer', operator: 'equals', value: 'Yes' },
  },
  {
    fieldId: 'secondary_broker_dealer_employee_relationship',
    requiredWhen: { field: 'secondary_related_to_employee_broker_dealer', operator: 'equals', value: 'Yes' },
  },
  {
    fieldId: 'secondary_with_what_firms',
    requiredWhen: { field: 'secondary_maintaining_other_brokerage_accounts', operator: 'equals', value: 'Yes' },
  },
  {
    fieldId: 'secondary_years_investment_experience',
    requiredWhen: { field: 'secondary_maintaining_other_brokerage_accounts', operator: 'equals', value: 'Yes' },
  },
  {
    fieldId: 'secondary_affiliation_details',
    requiredWhen: { field: 'secondary_affiliated_with_exchange_or_finra', operator: 'equals', value: 'Yes' },
  },
  {
    fieldId: 'secondary_company_names',
    requiredWhen: { field: 'secondary_senior_officer_or_10pct_shareholder', operator: 'equals', value: 'Yes' },
  },
  
  // Step 6: Trusted Contact
  {
    fieldId: 'trusted_contact_name',
    requiredWhen: { field: 'trusted_contact_decline_to_provide', operator: 'checked', value: false },
  },
  {
    fieldId: 'trusted_contact_email',
    requiredWhen: { field: 'trusted_contact_decline_to_provide', operator: 'checked', value: false },
    format: 'email',
  },
  
  // Step 7: Signatures
  {
    fieldId: 'account_owner_signature',
    required: true,
    custom: (value) => {
      if (typeof value === 'string' && value === '') {
        return 'Signature is required';
      }
      return null;
    },
  },
  {
    fieldId: 'account_owner_printed_name',
    required: true,
  },
  {
    fieldId: 'account_owner_date',
    required: true,
    format: 'date',
  },
  {
    fieldId: 'joint_account_owner_signature',
    requiredWhen: { field: 'type_of_account', operator: 'includes', value: 'joint_tenant' },
    custom: (value) => {
      if (typeof value === 'string' && value === '') {
        return 'Signature is required';
      }
      return null;
    },
  },
  {
    fieldId: 'joint_account_owner_printed_name',
    requiredWhen: { field: 'type_of_account', operator: 'includes', value: 'joint_tenant' },
  },
  {
    fieldId: 'joint_account_owner_date',
    requiredWhen: { field: 'type_of_account', operator: 'includes', value: 'joint_tenant' },
    format: 'date',
  },
  {
    fieldId: 'financial_professional_signature',
    required: true,
    custom: (value) => {
      if (typeof value === 'string' && value === '') {
        return 'Signature is required';
      }
      return null;
    },
  },
  {
    fieldId: 'financial_professional_printed_name',
    required: true,
  },
  {
    fieldId: 'financial_professional_date',
    required: true,
    format: 'date',
  },
];

/**
 * Validate the entire form
 */
export function validateForm(formData: Record<string, FieldValue>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const rule of validationRules) {
    const value = formData[rule.fieldId];
    const error = validateField(rule.fieldId, value, rule, formData);
    
    if (error) {
      errors.push({
        fieldId: rule.fieldId,
        message: error,
      });
    }
  }
  
  return errors;
}

/**
 * Validate a single field
 */
export function validateSingleField(
  fieldId: string,
  value: FieldValue,
  formData: Record<string, FieldValue>
): string | null {
  const rule = validationRules.find(r => r.fieldId === fieldId);
  if (!rule) return null;
  
  return validateField(fieldId, value, rule, formData);
}

