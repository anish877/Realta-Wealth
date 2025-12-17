export type FieldValue = string | boolean | null | undefined;

export interface AccreditationField {
  id: string;
  label: string;
  type: string;
  page?: number;
  bullets?: string[];
  content?: any;
  categories?: Array<{
    category: string;
    documentation: string[];
  }>;
  options?: Array<{
    option_name: string;
    description?: string;
    requirements?: string[];
    advisor_obligations?: string[];
    submission_rules?: string[];
    recordkeeping_note?: string;
  }>;
  text?: string;
  signature_lines?: Array<{
    role: string;
    fields: string[];
  }>;
}

export interface AccreditationSection {
  sectionId: string;
  title: string;
  page: number;
  fields: AccreditationField[];
}

export interface AccreditationFormData {
  rr_name?: string;
  rr_no?: string;
  customer_names?: string;

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

  // Derived
  has_joint_owner?: boolean;
}

