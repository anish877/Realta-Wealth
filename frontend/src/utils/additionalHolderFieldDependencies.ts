import type { FieldValue } from "../types/additionalHolderForm";

/**
 * Determine if a field should be shown based on form data
 */
export function shouldShowAdditionalHolderField(
  fieldId: string,
  formData: Record<string, FieldValue>
): boolean {
  // SSN/EIN based on Person/Entity
  if (fieldId === "ssn") {
    const personEntity = formData.person_entity;
    return Array.isArray(personEntity) && personEntity.includes("Person");
  }

  if (fieldId === "ein") {
    const personEntity = formData.person_entity;
    return Array.isArray(personEntity) && personEntity.includes("Entity");
  }

  // Mailing address - show if different from legal (or if mailing_same_as_legal is false)
  if (
    fieldId.startsWith("mailing_") &&
    fieldId !== "mailing_same_as_legal"
  ) {
    const mailingSameAsLegal = formData.mailing_same_as_legal;
    // If explicitly set to false, show mailing address
    // If not set or true, hide it (assume same as legal)
    return mailingSameAsLegal === false;
  }

  // Employment fields based on employment status
  if (
    fieldId === "occupation" ||
    fieldId === "employer_name" ||
    fieldId === "years_employed" ||
    fieldId === "type_of_business" ||
    fieldId.startsWith("employer_")
  ) {
    const employmentStatus = formData.employment_status;
    if (Array.isArray(employmentStatus)) {
      return (
        employmentStatus.includes("Employed") ||
        employmentStatus.includes("Self-Employed")
      );
    }
    return false;
  }

  // Yes/No follow-up fields - show when "Yes" is selected
  const yesNoFollowUps: Record<string, string> = {
    employee_name: "related_to_employee_at_this_broker_dealer",
    relationship: "related_to_employee_at_this_broker_dealer",
    broker_dealer_name: "employee_of_another_broker_dealer",
    broker_dealer_name_2: "related_to_employee_at_another_broker_dealer",
    employee_name_2: "related_to_employee_at_another_broker_dealer",
    relationship_2: "related_to_employee_at_another_broker_dealer",
    with_what_firms: "maintaining_other_brokerage_accounts",
    years_of_investment_experience: "maintaining_other_brokerage_accounts",
    what_is_the_affiliation: "affiliated_with_exchange_or_finra",
    company_names: "senior_officer_director_shareholder",
  };

  const parentField = yesNoFollowUps[fieldId];
  if (parentField) {
    const parentValue = formData[parentField];
    return parentValue === "Yes";
  }

  // Other investment label - show when other_investments_knowledge is selected
  if (fieldId === "other_investments_label") {
    const otherKnowledge = formData.other_investments_knowledge;
    if (Array.isArray(otherKnowledge)) {
      return otherKnowledge.length > 0;
    }
    return false;
  }

  // Default: show the field
  return true;
}

/**
 * Get field requirements based on form data
 */
export function getAdditionalHolderFieldRequirements(
  fieldId: string,
  formData: Record<string, FieldValue>
): { required: boolean; message?: string } {
  // SSN required if Person
  if (fieldId === "ssn") {
    const personEntity = formData.person_entity;
    if (Array.isArray(personEntity) && personEntity.includes("Person")) {
      return { required: true, message: "SSN is required for Person" };
    }
  }

  // EIN required if Entity
  if (fieldId === "ein") {
    const personEntity = formData.person_entity;
    if (Array.isArray(personEntity) && personEntity.includes("Entity")) {
      return { required: true, message: "EIN is required for Entity" };
    }
  }

  // Employment fields required if Employed or Self-Employed
  if (fieldId === "occupation" || fieldId === "employer_name") {
    const employmentStatus = formData.employment_status;
    if (Array.isArray(employmentStatus)) {
      if (
        employmentStatus.includes("Employed") ||
        employmentStatus.includes("Self-Employed")
      ) {
        return { required: true };
      }
    }
  }

  // Yes/No follow-up fields required when "Yes"
  const yesNoFollowUps: Record<string, string> = {
    employee_name: "related_to_employee_at_this_broker_dealer",
    relationship: "related_to_employee_at_this_broker_dealer",
    broker_dealer_name: "employee_of_another_broker_dealer",
    broker_dealer_name_2: "related_to_employee_at_another_broker_dealer",
    employee_name_2: "related_to_employee_at_another_broker_dealer",
    relationship_2: "related_to_employee_at_another_broker_dealer",
    with_what_firms: "maintaining_other_brokerage_accounts",
    years_of_investment_experience: "maintaining_other_brokerage_accounts",
    what_is_the_affiliation: "affiliated_with_exchange_or_finra",
    company_names: "senior_officer_director_shareholder",
  };

  const parentField = yesNoFollowUps[fieldId];
  if (parentField) {
    const parentValue = formData[parentField];
    if (parentValue === "Yes") {
      return { required: true };
    }
  }

  // Other investment label required when other_investments_knowledge is selected
  if (fieldId === "other_investments_label") {
    const otherKnowledge = formData.other_investments_knowledge;
    if (Array.isArray(otherKnowledge) && otherKnowledge.length > 0) {
      return { required: true };
    }
  }

  return { required: false };
}

