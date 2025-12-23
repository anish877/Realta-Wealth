/**
 * Transform frontend form data format to backend API format
 */

type FormData = Record<string, any>;

/**
 * Helper function to convert empty/falsy values to undefined (for Zod optional fields)
 * Zod's .optional() accepts undefined but not null
 */
function toOptional<T>(value: T | null | undefined | ""): T | undefined {
  if (value === null || value === "") {
    return undefined;
  }
  return value;
}

/**
 * Recursively remove null and undefined values from an object
 * This ensures Zod validators don't receive null for optional fields
 * Uses JSON serialization to properly handle nested structures
 */
function removeNulls<T>(obj: T): any {
  // Handle null/undefined at top level
  if (obj === null || obj === undefined) {
    return undefined;
  }
  
  // Handle arrays - filter out nulls and clean each element
  if (Array.isArray(obj)) {
    const cleaned = obj
      .filter(item => item !== null && item !== undefined)
      .map(item => removeNulls(item));
    return cleaned.length > 0 ? cleaned : undefined;
  }
  
  // Handle objects - recursively clean and skip null/undefined values
  if (typeof obj === "object" && obj.constructor === Object) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip null and undefined values entirely
      if (value === null || value === undefined) {
        continue;
      }
      // Recursively clean nested structures
      const cleanedValue = removeNulls(value);
      // Only include if cleaned value is not undefined
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    // Return undefined for empty objects (so they're omitted)
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
  
  // Return primitives as-is
  return obj;
}

/**
 * Transform Step 1 data
 */
export function transformStep1(formData: FormData) {
  const result = {
    rrName: toOptional(formData.rr_name),
    rrNo: toOptional(formData.rr_no),
    customerNames: toOptional(formData.customer_names),
    accountNo: toOptional(formData.account_no),
    retirementAccount: formData.retirement_checkbox === true,
    retailAccount: formData.retail_checkbox === true,
    accountTypes: formData.type_of_account || [],
    additionalDesignations: formData.additional_designation_left || [],
    otherAccountTypeText: toOptional(formData.other_account_type_text),
    trustInformation: formData.trust_checkbox
      ? {
          establishmentDate: formData.trust_establishment_date
            ? new Date(formData.trust_establishment_date).toISOString()
            : undefined,
          trustTypes: formData.trust_type || [],
        }
      : undefined,
    jointAccountInformation:
      formData.type_of_account?.includes("joint_tenant") ||
      formData.type_of_account?.includes("transfer_on_death_joint")
        ? {
            areAccountHoldersMarried: toOptional(formData.are_account_holders_married),
            tenancyState: toOptional(formData.tenancy_state),
            numberOfTenants: formData.number_of_tenants ? Number(formData.number_of_tenants) : undefined,
            tenancyClauses: formData.tenancy_clause || [],
          }
        : undefined,
    custodialAccountInformation: formData.type_of_account?.includes("custodial")
      ? {
          stateGiftGiven1: toOptional(formData.state_in_which_gift_was_given_1),
          dateGiftGiven1: formData.date_gift_was_given_1
            ? new Date(formData.date_gift_was_given_1).toISOString()
            : undefined,
          stateGiftGiven2: toOptional(formData.state_in_which_gift_was_given_2),
          dateGiftGiven2: formData.date_gift_was_given_2
            ? new Date(formData.date_gift_was_given_2).toISOString()
            : undefined,
        }
      : undefined,
    transferOnDeathInformation:
      formData.type_of_account?.includes("transfer_on_death_individual") ||
      formData.type_of_account?.includes("transfer_on_death_joint")
        ? {
            individualAgreementDate: formData.transfer_on_death_individual_agreement_date
              ? new Date(formData.transfer_on_death_individual_agreement_date).toISOString()
              : undefined,
            jointAgreementDate: formData.transfer_on_death_joint_agreement_date
              ? new Date(formData.transfer_on_death_joint_agreement_date).toISOString()
              : undefined,
          }
        : undefined,
  };
  // Clean nulls recursively, then use JSON serialization to ensure all nulls are removed
  const cleaned = removeNulls(result);
  // Use JSON.stringify with replacer to remove nulls, then parse back
  const jsonString = JSON.stringify(cleaned, (key, value) => {
    // Remove null values entirely
    if (value === null) {
      return undefined;
    }
    // Also remove empty strings for optional fields
    if (value === "") {
      return undefined;
    }
    return value;
  });
  const final = JSON.parse(jsonString);
  // Final safety check - remove any remaining nulls
  return removeNulls(final);
}

/**
 * Transform Step 2 data
 */
export function transformStep2(formData: FormData) {
  const sources = formData.initial_source_of_funds || [];
  const result = {
    initialSourceOfFunds: sources,
    otherSourceOfFundsText: sources.includes("Other")
      ? toOptional(formData.initial_source_of_funds_other_text)
      : undefined,
  };
  return removeNulls(result);
}

/**
 * Transform Step 3 (Primary Account Holder) data
 */
export function transformStep3(formData: FormData) {
  const addresses = [];
  
  // Legal address
  if (formData.primary_legal_address || formData.primary_city) {
    addresses.push({
      addressType: "legal",
      address: formData.primary_legal_address || null,
      city: formData.primary_city || null,
      stateProvince: formData.primary_state_province || null,
      zipPostalCode: formData.primary_zip_postal_code || null,
      country: formData.primary_country || null,
      mailingSameAsLegal: false,
    });
  }

  // Mailing address
  if (!formData.primary_mailing_same_as_legal && (formData.primary_mailing_address || formData.primary_mailing_city)) {
    addresses.push({
      addressType: "mailing",
      address: formData.primary_mailing_address || null,
      city: formData.primary_mailing_city || null,
      stateProvince: formData.primary_mailing_state_province || null,
      zipPostalCode: formData.primary_mailing_zip_postal_code || null,
      country: formData.primary_mailing_country || null,
      mailingSameAsLegal: formData.primary_mailing_same_as_legal === true,
    });
  } else if (formData.primary_mailing_same_as_legal) {
    // If same as legal, we still need to mark it
    const legalAddr = addresses.find((a) => a.addressType === "legal");
    if (legalAddr) {
      legalAddr.mailingSameAsLegal = true;
    }
  }

  const phones = [];
  if (formData.primary_home_phone && formData.primary_home_phone.trim()) {
    phones.push({ phoneType: "home", phoneNumber: formData.primary_home_phone.trim() });
  }
  if (formData.primary_business_phone && formData.primary_business_phone.trim()) {
    phones.push({ phoneType: "business", phoneNumber: formData.primary_business_phone.trim() });
  }
  if (formData.primary_mobile_phone && formData.primary_mobile_phone.trim()) {
    phones.push({ phoneType: "mobile", phoneNumber: formData.primary_mobile_phone.trim() });
  }

  // Investment knowledge
  const investmentKnowledge = [];
  const knowledgeFields = [
    "commodities_futures_knowledge",
    "equities_knowledge",
    "etf_knowledge",
    "fixed_annuities_knowledge",
    "fixed_insurance_knowledge",
    "mutual_funds_knowledge",
    "options_knowledge",
    "precious_metals_knowledge",
    "real_estate_knowledge",
    "unit_investment_trusts_knowledge",
    "variable_annuities_knowledge",
    "leveraged_inverse_etfs_knowledge",
    "complex_products_knowledge",
    "alternative_investments_knowledge",
  ];

  knowledgeFields.forEach((field) => {
    const knowledge = formData[field];
    const sinceYear = formData[field.replace("_knowledge", "_since_year")];
    if (knowledge) {
      const investmentType = field.replace("_knowledge", "").replace(/_/g, "_");
      investmentKnowledge.push({
        investmentType: mapInvestmentType(field),
        knowledgeLevel: knowledge,
        sinceYear: sinceYear || null,
        otherInvestmentLabel: null,
      });
    }
  });

  // Other investment knowledge
  if (formData.other_investment_knowledge_value) {
    investmentKnowledge.push({
      investmentType: "other",
      knowledgeLevel: formData.other_investment_knowledge_value,
      sinceYear: formData.other_investment_since_year || null,
      otherInvestmentLabel: formData.other_investment_knowledge_label || null,
    });
  }

  // Government IDs
  const governmentIdentifications = [];
  if (formData.gov_id_type || formData.gov_id_number) {
    governmentIdentifications.push({
      idNumber: 1,
      idType: formData.gov_id_type || null,
      idNumberValue: formData.gov_id_number || null,
      countryOfIssue: formData.gov_id_country_of_issue || null,
      dateOfIssue: formData.gov_id_date_of_issue
        ? new Date(formData.gov_id_date_of_issue).toISOString()
        : null,
      dateOfExpiration: formData.gov_id_date_of_expiration
        ? new Date(formData.gov_id_date_of_expiration).toISOString()
        : null,
    });
  }
  if (formData.gov2_type || formData.gov2_id_number) {
    governmentIdentifications.push({
      idNumber: 2,
      idType: formData.gov2_type || null,
      idNumberValue: formData.gov2_id_number || null,
      countryOfIssue: formData.gov2_country_of_issue || null,
      dateOfIssue: formData.gov2_date_of_issue
        ? new Date(formData.gov2_date_of_issue).toISOString()
        : null,
      dateOfExpiration: formData.gov2_date_of_expiration
        ? new Date(formData.gov2_date_of_expiration).toISOString()
        : null,
    });
  }

  // Employment
  let employment = undefined;
  if (
    formData.primary_employment_affiliations?.includes("Employed") ||
    formData.primary_employment_affiliations?.includes("SelfEmployed") ||
    formData.primary_employment_affiliations?.includes("Self-Employed")
  ) {
    const employerAddress = formData.primary_employer_address
      ? {
          addressType: "employer" as const,
          address: formData.primary_employer_address || null,
          city: formData.primary_employer_city || null,
          stateProvince: formData.primary_employer_state_province || null,
          zipPostalCode: formData.primary_employer_zip_postal_code || null,
          country: formData.primary_employer_country || null,
        }
      : undefined;

    employment = {
      occupation: formData.primary_occupation || null,
      yearsEmployed: formData.primary_years_employed || null,
      typeOfBusiness: formData.primary_type_of_business || null,
      employerName: formData.primary_employer_name || null,
      employerAddress,
    };
  }

  return {
    name: formData.primary_name || null,
    email: formData.primary_email || null,
    personEntity: formData.primary_person_entity || null,
    ssn: formData.primary_ssn || null,
    ein: formData.primary_ein || null,
    yesNoBox: formData.primary_yes_no_box || null,
    dateOfBirth: formData.primary_dob
      ? new Date(formData.primary_dob).toISOString()
      : null,
    specifiedAdult: formData.primary_specified_adult || null,
    primaryCitizenship: formData.primary_citizenship_primary || null,
    additionalCitizenship: formData.primary_citizenship_additional || null,
    gender: formData.primary_gender || null,
    generalInvestmentKnowledge: formData.primary_general_investment_knowledge || null,
    addresses: addresses.length > 0 ? addresses : undefined,
    phones: phones, // Always send phones array (empty array means clear all phones)
    maritalStatuses: formData.primary_marital_status || [],
    employmentAffiliations: formData.primary_employment_affiliations || [],
    employment,
    investmentKnowledge: investmentKnowledge.length > 0 ? investmentKnowledge : undefined,
    financialInformation: formData.annual_income_from || formData.net_worth_from
      ? {
          annualIncomeFrom: formData.annual_income_from || null,
          annualIncomeTo: formData.annual_income_to || null,
          netWorthFrom: formData.net_worth_from || null,
          netWorthTo: formData.net_worth_to || null,
          liquidNetWorthFrom: formData.liquid_net_worth_from || null,
          liquidNetWorthTo: formData.liquid_net_worth_to || null,
          taxBracket: formData.tax_bracket || null,
        }
      : undefined,
    governmentIdentifications:
      governmentIdentifications.length > 0 ? governmentIdentifications : undefined,
    advisoryFirmInformation:
      formData.primary_employee_of_advisory_firm || formData.primary_related_to_employee_advisory
        ? {
            employeeOfAdvisoryFirm: formData.primary_employee_of_advisory_firm || null,
            relatedToEmployeeAdvisory: formData.primary_related_to_employee_advisory || null,
            employeeNameAndRelationship: formData.primary_employee_name_and_relationship || null,
          }
        : undefined,
    brokerDealerInformation:
      formData.primary_employee_of_broker_dealer ||
      formData.primary_related_to_employee_broker_dealer
        ? {
            employeeOfBrokerDealer: formData.primary_employee_of_broker_dealer || null,
            brokerDealerName: formData.primary_broker_dealer_name || null,
            relatedToEmployeeBrokerDealer: formData.primary_related_to_employee_broker_dealer || null,
            brokerDealerEmployeeName: formData.primary_broker_dealer_employee_name || null,
            brokerDealerEmployeeRelationship:
              formData.primary_broker_dealer_employee_relationship || null,
          }
        : undefined,
    otherBrokerageAccounts: formData.primary_maintaining_other_brokerage_accounts
      ? {
          maintainingOtherAccounts: formData.primary_maintaining_other_brokerage_accounts || null,
          withWhatFirms: formData.primary_with_what_firms || null,
          yearsOfInvestmentExperience: formData.primary_years_of_investment_experience || null,
        }
      : undefined,
    exchangeFinraAffiliation: formData.primary_affiliated_with_exchange_or_finra
      ? {
          affiliatedWithExchangeOrFinra: formData.primary_affiliated_with_exchange_or_finra || null,
          affiliationDetails: formData.primary_affiliation_employer_authorization_required || null,
        }
      : undefined,
    publicCompanyInformation: formData.primary_senior_officer_or_10pct_shareholder
      ? {
          seniorOfficerOr10PctShareholder: formData.primary_senior_officer_or_10pct_shareholder || null,
          companyNames: formData.primary_company_names || null,
        }
      : undefined,
  };
}

/**
 * Transform Step 4 (Secondary Account Holder) data - similar to Step 3
 */
export function transformStep4(formData: FormData) {
  // Similar structure to Step 3 but with "secondary_" prefix
  const addresses = [];
  
  if (formData.secondary_legal_address || formData.secondary_city) {
    addresses.push({
      addressType: "legal",
      address: formData.secondary_legal_address || null,
      city: formData.secondary_city || null,
      stateProvince: formData.secondary_state_province || null,
      zipPostalCode: formData.secondary_zip_postal_code || null,
      country: formData.secondary_country || null,
      mailingSameAsLegal: false,
    });
  }

  if (!formData.secondary_mailing_same_as_legal && (formData.secondary_mailing_address || formData.secondary_mailing_city)) {
    addresses.push({
      addressType: "mailing",
      address: formData.secondary_mailing_address || null,
      city: formData.secondary_mailing_city || null,
      stateProvince: formData.secondary_mailing_state_province || null,
      zipPostalCode: formData.secondary_mailing_zip_postal_code || null,
      country: formData.secondary_mailing_country || null,
      mailingSameAsLegal: formData.secondary_mailing_same_as_legal === true,
    });
  }

  const phones = [];
  if (formData.secondary_home_phone && formData.secondary_home_phone.trim()) {
    phones.push({ phoneType: "home", phoneNumber: formData.secondary_home_phone.trim() });
  }
  if (formData.secondary_business_phone && formData.secondary_business_phone.trim()) {
    phones.push({ phoneType: "business", phoneNumber: formData.secondary_business_phone.trim() });
  }
  if (formData.secondary_mobile_phone && formData.secondary_mobile_phone.trim()) {
    phones.push({ phoneType: "mobile", phoneNumber: formData.secondary_mobile_phone.trim() });
  }

  // Investment knowledge for secondary
  const investmentKnowledge = [];
  const secondaryKnowledgeFields = [
    "secondary_commodities_futures",
    "secondary_equities",
    "secondary_etfs",
    "secondary_fixed_annuities",
    "secondary_fixed_insurance",
    "secondary_mutual_funds",
    "secondary_options",
    "secondary_precious_metals",
    "secondary_real_estate",
    "secondary_unit_investment_trusts",
    "secondary_variable_annuities",
    "secondary_leveraged_inverse_etfs",
    "secondary_complex_products",
  ];

  secondaryKnowledgeFields.forEach((field) => {
    const knowledge = formData[field];
    const sinceYear = formData[field + "_since"];
    if (knowledge) {
      investmentKnowledge.push({
        investmentType: mapSecondaryInvestmentType(field),
        knowledgeLevel: knowledge,
        sinceYear: sinceYear || null,
        otherInvestmentLabel: null,
      });
    }
  });

  if (formData.secondary_alternative_investments_knowledge) {
    investmentKnowledge.push({
      investmentType: "alternative_investments",
      knowledgeLevel: formData.secondary_alternative_investments_knowledge,
      sinceYear: formData.secondary_alternative_investments_since || null,
      otherInvestmentLabel: null,
    });
  }

  if (formData.secondary_other_investments_knowledge) {
    investmentKnowledge.push({
      investmentType: "other",
      knowledgeLevel: formData.secondary_other_investments_knowledge,
      sinceYear: formData.secondary_other_investments_since || null,
      otherInvestmentLabel: formData.secondary_other_investments_label || null,
    });
  }

  // Government IDs for secondary
  const governmentIdentifications = [];
  if (formData.gov2_type || formData.gov2_id_number) {
    governmentIdentifications.push({
      idNumber: 1,
      idType: formData.gov2_type || null,
      idNumberValue: formData.gov2_id_number || null,
      countryOfIssue: formData.gov2_country_of_issue || null,
      dateOfIssue: formData.gov2_date_of_issue
        ? new Date(formData.gov2_date_of_issue).toISOString()
        : null,
      dateOfExpiration: formData.gov2_date_of_expiration
        ? new Date(formData.gov2_date_of_expiration).toISOString()
        : null,
    });
  }

  // Employment for secondary
  let employment = undefined;
  if (
    formData.secondary_employment_affiliations?.includes("Employed") ||
    formData.secondary_employment_affiliations?.includes("SelfEmployed") ||
    formData.secondary_employment_affiliations?.includes("Self-Employed")
  ) {
    const employerAddress = formData.secondary_employer_address
      ? {
          addressType: "employer" as const,
          address: formData.secondary_employer_address || null,
          city: formData.secondary_employer_city || null,
          stateProvince: formData.secondary_employer_state_province || null,
          zipPostalCode: formData.secondary_employer_zip_postal_code || null,
          country: formData.secondary_employer_country || null,
        }
      : undefined;

    employment = {
      occupation: formData.secondary_occupation || null,
      yearsEmployed: formData.secondary_years_employed || null,
      typeOfBusiness: formData.secondary_type_of_business || null,
      employerName: formData.secondary_employer_name || null,
      employerAddress,
    };
  }

  return {
    name: formData.secondary_name || null,
    email: formData.secondary_email || null,
    personEntity: formData.secondary_person_entity || null,
    ssn: formData.secondary_ssn || null,
    ein: formData.secondary_ein || null,
    yesNoBox: formData.secondary_yes_no_box || null,
    dateOfBirth: formData.secondary_date_of_birth
      ? new Date(formData.secondary_date_of_birth).toISOString()
      : null,
    specifiedAdult: formData.secondary_specified_adult || null,
    primaryCitizenship: formData.secondary_primary_citizenship || null,
    additionalCitizenship: null,
    gender: formData.secondary_gender || null,
    generalInvestmentKnowledge: formData.secondary_general_investment_knowledge || null,
    addresses: addresses.length > 0 ? addresses : undefined,
    phones: phones, // Always send phones array (empty array means clear all phones)
    maritalStatuses: formData.secondary_marital_status || [],
    employmentAffiliations: formData.secondary_employment_affiliations || [],
    employment,
    investmentKnowledge: investmentKnowledge.length > 0 ? investmentKnowledge : undefined,
    financialInformation: formData.annual_income_from_2 || formData.net_worth_from_2
      ? {
          annualIncomeFrom: formData.annual_income_from_2 || null,
          annualIncomeTo: formData.annual_income_to_2 || null,
          netWorthFrom: formData.net_worth_from_2 || null,
          netWorthTo: formData.net_worth_to_2 || null,
          liquidNetWorthFrom: formData.liquid_net_worth_from_2 || null,
          liquidNetWorthTo: formData.liquid_net_worth_to_2 || null,
          taxBracket: formData.tax_bracket_2 || null,
        }
      : undefined,
    governmentIdentifications:
      governmentIdentifications.length > 0 ? governmentIdentifications : undefined,
    advisoryFirmInformation:
      formData.secondary_employee_of_advisory_firm || formData.secondary_related_to_employee_advisory
        ? {
            employeeOfAdvisoryFirm: formData.secondary_employee_of_advisory_firm || null,
            relatedToEmployeeAdvisory: formData.secondary_related_to_employee_advisory || null,
            employeeNameAndRelationship: formData.secondary_employee_name || null,
          }
        : undefined,
    brokerDealerInformation:
      formData.secondary_employee_of_broker_dealer ||
      formData.secondary_related_to_employee_broker_dealer
        ? {
            employeeOfBrokerDealer: formData.secondary_employee_of_broker_dealer || null,
            brokerDealerName: formData.secondary_broker_dealer_name || null,
            relatedToEmployeeBrokerDealer: formData.secondary_related_to_employee_broker_dealer || null,
            brokerDealerEmployeeName: formData.secondary_broker_dealer_employee_name || null,
            brokerDealerEmployeeRelationship: formData.secondary_broker_dealer_employee_relationship || null,
          }
        : undefined,
    otherBrokerageAccounts: formData.secondary_maintaining_other_brokerage_accounts
      ? {
          maintainingOtherAccounts: formData.secondary_maintaining_other_brokerage_accounts || null,
          withWhatFirms: formData.secondary_with_what_firms || null,
          yearsOfInvestmentExperience: formData.secondary_years_investment_experience || null,
        }
      : undefined,
    exchangeFinraAffiliation: formData.secondary_affiliated_with_exchange_or_finra
      ? {
          affiliatedWithExchangeOrFinra: formData.secondary_affiliated_with_exchange_or_finra || null,
          affiliationDetails: formData.secondary_affiliation_details || null,
        }
      : undefined,
    publicCompanyInformation: formData.secondary_senior_officer_or_10pct_shareholder
      ? {
          seniorOfficerOr10PctShareholder: formData.secondary_senior_officer_or_10pct_shareholder || null,
          companyNames: formData.secondary_company_names || null,
        }
      : undefined,
  };
}

/**
 * Transform Step 5 data
 */
export function transformStep5(formData: FormData) {
  const investmentValues: Array<{ investmentType: string; value: number }> = [];
  
  const valueFields = [
    { field: "investment_equities_value", type: "equities" },
    { field: "investment_fixed_annuities_value", type: "fixed_annuities" },
    { field: "investment_options_value", type: "options" },
    { field: "investment_precious_metals_value", type: "precious_metals" },
    { field: "investment_fixed_income_value", type: "fixed_income" },
    { field: "investment_commodities_futures_value", type: "commodities_futures" },
    { field: "investment_mutual_funds_value", type: "mutual_funds" },
    { field: "investment_other_1_value", type: "other" },
    { field: "investment_unit_investment_trusts_value", type: "unit_investment_trusts" },
    { field: "investment_other_2_value", type: "other" },
    { field: "investment_etfs_value", type: "etf" },
    { field: "investment_other_3_value", type: "other" },
    { field: "investment_real_estate_value", type: "real_estate" },
    { field: "investment_insurance_value", type: "fixed_insurance" },
    { field: "investment_variable_annuities_value", type: "variable_annuities" },
  ];

  valueFields.forEach(({ field, type }) => {
    const value = formData[field];
    if (value !== undefined && value !== null && value !== "") {
      investmentValues.push({
        investmentType: type,
        value: parseFloat(value) || 0,
      });
    }
  });

  return {
    riskExposure: formData.risk_exposure || [],
    accountInvestmentObjectives: formData.account_investment_objectives || [],
    seeAttachedStatement: formData.other_investments_see_attached === true,
    timeHorizonFrom: formData.investment_time_horizon_from || null,
    timeHorizonTo: formData.investment_time_horizon_to || null,
    liquidityNeeds: formData.liquidity_needs || [],
    investmentValues: investmentValues.length > 0 ? investmentValues : undefined,
  };
}

/**
 * Transform Step 6 data
 */
export function transformStep6(formData: FormData) {
  return {
    declineToProvide: formData.trusted_contact_decline_to_provide === true,
    name: formData.trusted_contact_name || null,
    email: formData.trusted_contact_email || null,
    homePhone: formData.trusted_contact_home_phone || null,
    businessPhone: formData.trusted_contact_business_phone || null,
    mobilePhone: formData.trusted_contact_mobile_phone || null,
    mailingAddress: formData.trusted_contact_mailing_address || null,
    city: formData.trusted_contact_city || null,
    stateProvince: formData.trusted_contact_state_province || null,
    zipPostalCode: formData.trusted_contact_zip_postal_code || null,
    country: formData.trusted_contact_country || null,
  };
}

/**
 * Transform Step 7 data
 */
export function transformStep7(formData: FormData) {
  const signatures = [];

  if (formData.account_owner_signature && formData.account_owner_printed_name) {
    signatures.push({
      signatureType: "account_owner",
      signatureData: formData.account_owner_signature,
      printedName: formData.account_owner_printed_name,
      signatureDate: formData.account_owner_date
        ? new Date(formData.account_owner_date).toISOString()
        : new Date().toISOString(),
    });
  }

  if (formData.joint_account_owner_signature && formData.joint_account_owner_printed_name) {
    signatures.push({
      signatureType: "joint_account_owner",
      signatureData: formData.joint_account_owner_signature,
      printedName: formData.joint_account_owner_printed_name,
      signatureDate: formData.joint_account_owner_date
        ? new Date(formData.joint_account_owner_date).toISOString()
        : new Date().toISOString(),
    });
  }

  if (formData.financial_professional_signature && formData.financial_professional_printed_name) {
    signatures.push({
      signatureType: "financial_professional",
      signatureData: formData.financial_professional_signature,
      printedName: formData.financial_professional_printed_name,
      signatureDate: formData.financial_professional_date
        ? new Date(formData.financial_professional_date).toISOString()
        : new Date().toISOString(),
    });
  }

  if (formData.supervisor_principal_signature && formData.supervisor_principal_printed_name) {
    signatures.push({
      signatureType: "supervisor_principal",
      signatureData: formData.supervisor_principal_signature,
      printedName: formData.supervisor_principal_printed_name,
      signatureDate: formData.supervisor_principal_date
        ? new Date(formData.supervisor_principal_date).toISOString()
        : new Date().toISOString(),
    });
  }

  return {
    signatures: signatures.length > 0 ? signatures : [],
  };
}

/**
 * Helper function to map investment type field names to backend enum values
 */
function mapInvestmentType(fieldName: string): string {
  const mapping: Record<string, string> = {
    commodities_futures_knowledge: "commodities_futures",
    equities_knowledge: "equities",
    etf_knowledge: "etf",
    fixed_annuities_knowledge: "fixed_annuities",
    fixed_insurance_knowledge: "fixed_insurance",
    mutual_funds_knowledge: "mutual_funds",
    options_knowledge: "options",
    precious_metals_knowledge: "precious_metals",
    real_estate_knowledge: "real_estate",
    unit_investment_trusts_knowledge: "unit_investment_trusts",
    variable_annuities_knowledge: "variable_annuities",
    leveraged_inverse_etfs_knowledge: "leveraged_inverse_etfs",
    complex_products_knowledge: "complex_products",
    alternative_investments_knowledge: "alternative_investments",
  };
  return mapping[fieldName] || fieldName.replace("_knowledge", "");
}

function mapSecondaryInvestmentType(fieldName: string): string {
  const mapping: Record<string, string> = {
    secondary_commodities_futures: "commodities_futures",
    secondary_equities: "equities",
    secondary_etfs: "etf",
    secondary_fixed_annuities: "fixed_annuities",
    secondary_fixed_insurance: "fixed_insurance",
    secondary_mutual_funds: "mutual_funds",
    secondary_options: "options",
    secondary_precious_metals: "precious_metals",
    secondary_real_estate: "real_estate",
    secondary_unit_investment_trusts: "unit_investment_trusts",
    secondary_variable_annuities: "variable_annuities",
    secondary_leveraged_inverse_etfs: "leveraged_inverse_etfs",
    secondary_complex_products: "complex_products",
  };
  return mapping[fieldName] || fieldName.replace("secondary_", "");
}

