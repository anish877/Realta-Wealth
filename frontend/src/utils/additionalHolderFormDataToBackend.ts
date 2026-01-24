/**
 * Transform Additional Holder frontend form data format to backend API format
 */

import type { AdditionalHolderFormData, RangeCurrencyValue } from "../types/additionalHolderForm";

// Map frontend investment labels to backend enum values
const investmentLabelToEnum: Record<string, string> = {
  "Commodities, Futures": "commodities_futures",
  "Equities": "equities",
  "Exchange Traded Funds": "etf",
  "Fixed Annuities": "fixed_annuities",
  "Fixed Insurance": "fixed_insurance",
  "Mutual Funds": "mutual_funds",
  "Options": "options",
  "Precious Metals": "precious_metals",
  "Real Estate": "real_estate",
  "Unit Investment Trusts": "unit_investment_trusts",
  "Variable Annuities": "variable_annuities",
  "Leveraged/Inverse ETF's": "leveraged_inverse_etfs",
  "Complex Products": "complex_products",
  "Alternative Investments": "alternative_investments",
  "Other": "other",
};

const normalizeInvestmentType = (label: string | undefined, fallbackOtherLabel?: string): string => {
  if (!label) return "other";
  const mapped = investmentLabelToEnum[label] || investmentLabelToEnum[fallbackOtherLabel || ""] || investmentLabelToEnum["Other"];
  return mapped || "other";
};

const taxBracketLabelToEnum: Record<string, string> = {
  "≤15%": "zero_to_15",
  "15% - 32%": "fifteen_1_to_32",
  "33% - 50%": "thirtytwo_1_to_50",
  "> 50% +": "fifty_1_plus",
};

type FormData = AdditionalHolderFormData;

/**
 * Helper function to convert empty/falsy values to undefined
 */
function toOptional<T>(value: T | null | undefined | ""): T | undefined {
  if (value === null || value === "") {
    return undefined;
  }
  return value;
}

/**
 * Transform Additional Holder form data to backend format
 */
export function transformAdditionalHolderToBackend(formData: FormData) {
  // Transform investment knowledge
  const investmentKnowledge: Array<{
    investmentType: string;
    knowledgeLevel?: string;
    sinceYear?: number;
  }> = [];

  // Page 1 investments
  const page1Investments = [
    { knowledge: formData.commodities_futures_knowledge, since: formData.commodities_futures_since_year, type: "Commodities, Futures" },
    { knowledge: formData.equities_knowledge, since: formData.equities_since_year, type: "Equities" },
    { knowledge: formData.exchange_traded_funds_knowledge, since: formData.exchange_traded_funds_since_year, type: "Exchange Traded Funds" },
    { knowledge: formData.fixed_annuities_knowledge, since: formData.fixed_annuities_since_year, type: "Fixed Annuities" },
    { knowledge: formData.fixed_insurance_knowledge, since: formData.fixed_insurance_since_year, type: "Fixed Insurance" },
    { knowledge: formData.mutual_funds_knowledge, since: formData.mutual_funds_since_year, type: "Mutual Funds" },
  ];

  // Page 2 investments
  const page2Investments = [
    { knowledge: formData.options_knowledge, since: formData.options_since_year, type: "Options" },
    { knowledge: formData.precious_metals_knowledge, since: formData.precious_metals_since_year, type: "Precious Metals" },
    { knowledge: formData.real_estate_knowledge, since: formData.real_estate_since_year, type: "Real Estate" },
    { knowledge: formData.unit_investment_trusts_knowledge, since: formData.unit_investment_trusts_since_year, type: "Unit Investment Trusts" },
    { knowledge: formData.variable_annuities_knowledge, since: formData.variable_annuities_since_year, type: "Variable Annuities" },
    { knowledge: formData.leveraged_inverse_etfs_knowledge, since: formData.leveraged_inverse_etfs_since_year, type: "Leveraged/Inverse ETF's" },
    { knowledge: formData.complex_products_knowledge, since: formData.complex_products_since_year, type: "Complex Products" },
    { knowledge: formData.alternative_investments_knowledge, since: formData.alternative_investments_since_year, type: "Alternative Investments" },
    { knowledge: formData.other_investments_knowledge, since: formData.other_investments_since_year, type: formData.other_investments_label || "Other" },
  ];

  [...page1Investments, ...page2Investments].forEach((inv) => {
    if (Array.isArray(inv.knowledge) && inv.knowledge.length > 0) {
      investmentKnowledge.push({
        investmentType: normalizeInvestmentType(inv.type, formData.other_investments_label),
        knowledgeLevel: inv.knowledge[0], // Take first selection
        sinceYear: inv.since ? Number(inv.since) : undefined,
      });
    }
  });

  // Transform government IDs
  const governmentIds = [];

  if (formData.gov_id_1_type || formData.gov_id_1_number) {
    governmentIds.push({
      type: toOptional(formData.gov_id_1_type),
      idNumber: toOptional(formData.gov_id_1_number),
      countryOfIssue: toOptional(formData.gov_id_1_country_of_issue),
      dateOfIssue: formData.gov_id_1_date_of_issue ? new Date(formData.gov_id_1_date_of_issue).toISOString() : undefined,
      dateOfExpiration: formData.gov_id_1_date_of_expiration ? new Date(formData.gov_id_1_date_of_expiration).toISOString() : undefined,
    });
  }

  if (formData.gov_id_2_type || formData.gov_id_2_number) {
    governmentIds.push({
      type: toOptional(formData.gov_id_2_type),
      idNumber: toOptional(formData.gov_id_2_number),
      countryOfIssue: toOptional(formData.gov_id_2_country_of_issue),
      dateOfIssue: formData.gov_id_2_date_of_issue ? new Date(formData.gov_id_2_date_of_issue).toISOString() : undefined,
      dateOfExpiration: formData.gov_id_2_date_of_expiration ? new Date(formData.gov_id_2_date_of_expiration).toISOString() : undefined,
    });
  }

  // Transform range currency values
  const transformRangeCurrency = (value: RangeCurrencyValue | undefined) => {
    if (!value) return undefined;
    return {
      from: value.from ? (typeof value.from === "string" ? parseFloat(value.from.replace(/[$,\s]/g, "")) : value.from) : undefined,
      to: value.to ? (typeof value.to === "string" ? parseFloat(value.to.replace(/[$,\s]/g, "")) : value.to) : undefined,
    };
  };

  return {
    // Basic Information
    accountRegistration: toOptional(formData.account_registration),
    rrName: toOptional(formData.rr_name),
    rrNo: toOptional(formData.rr_no as string | undefined),
    name: toOptional(formData.name),
    personEntity: Array.isArray(formData.person_entity) && formData.person_entity.length > 0 ? formData.person_entity[0] : undefined,
    ssn: toOptional(formData.ssn),
    ein: toOptional(formData.ein),
    holderParticipantRole: toOptional(formData.holder_participant_role),
    email: toOptional(formData.email),
    dateOfBirth: formData.dob ? new Date(formData.dob).toISOString() : undefined,
    positionHeld: toOptional(formData.position_held),
    homePhone: toOptional(formData.home_phone),
    businessPhone: toOptional(formData.business_phone),
    mobilePhone: toOptional(formData.mobile_phone),

    // Legal Address
    legalAddress: {
      addressLine: toOptional(formData.legal_address_line),
      city: toOptional(formData.legal_city),
      stateProvince: toOptional(formData.legal_state_province),
      zipPostalCode: toOptional(formData.legal_zip_postal_code),
      country: toOptional(formData.legal_country),
    },

    // Mailing Address
    mailingAddress: formData.mailing_same_as_legal !== false ? undefined : {
      addressLine: toOptional(formData.mailing_address_line),
      city: toOptional(formData.mailing_city),
      stateProvince: toOptional(formData.mailing_state_province),
      zipPostalCode: toOptional(formData.mailing_zip_postal_code),
      country: toOptional(formData.mailing_country),
    },

    // Personal Information
    primaryCitizenship: toOptional(formData.primary_citizenship),
    additionalCitizenship: toOptional(formData.additional_citizenship),
    gender: Array.isArray(formData.gender) && formData.gender.length > 0 ? formData.gender[0] : undefined,
    maritalStatus: formData.marital_status || [],

    // Employment
    employmentStatus: formData.employment_status || [],
    occupation: toOptional(formData.occupation),
    yearsEmployed: formData.years_employed && !isNaN(Number(formData.years_employed)) ? Number(formData.years_employed) : undefined,
    typeOfBusiness: toOptional(formData.type_of_business),
    employerName: toOptional(formData.employer_name),
    employerAddress: {
      addressLine: toOptional(formData.employer_address_line),
      city: toOptional(formData.employer_city),
      stateProvince: toOptional(formData.employer_state_province),
      zipPostalCode: toOptional(formData.employer_zip_postal_code),
      country: toOptional(formData.employer_country),
    },

    // Investment Knowledge
    overallInvestmentKnowledge: Array.isArray(formData.overall_level) && formData.overall_level.length > 0 ? formData.overall_level[0] : undefined,
    investmentKnowledge,

    // Financial Information
    annualIncome: transformRangeCurrency(formData.annual_income),
    netWorth: transformRangeCurrency(formData.net_worth),
    liquidNetWorth: transformRangeCurrency(formData.liquid_net_worth),
    taxBracket:
      Array.isArray(formData.tax_bracket) && formData.tax_bracket.length > 0
        ? taxBracketLabelToEnum[formData.tax_bracket[0]] || taxBracketLabelToEnum["≤15%"]
        : undefined,

    // Government IDs
    governmentIds,

    // Employment/Affiliation Questions
    employeeOfThisBrokerDealer: toOptional(formData.employee_of_this_broker_dealer),
    relatedToEmployeeAtThisBrokerDealer: toOptional(formData.related_to_employee_at_this_broker_dealer),
    employeeName: toOptional(formData.employee_name),
    relationship: toOptional(formData.relationship),
    employeeOfAnotherBrokerDealer: toOptional(formData.employee_of_another_broker_dealer),
    brokerDealerName: toOptional(formData.broker_dealer_name),
    relatedToEmployeeAtAnotherBrokerDealer: toOptional(formData.related_to_employee_at_another_broker_dealer),
    brokerDealerName2: toOptional(formData.broker_dealer_name_2),
    employeeName2: toOptional(formData.employee_name_2),
    relationship2: toOptional(formData.relationship_2),
    maintainingOtherBrokerageAccounts: toOptional(formData.maintaining_other_brokerage_accounts),
    withWhatFirms: toOptional(formData.with_what_firms),
    yearsOfInvestmentExperience: formData.years_of_investment_experience && !isNaN(Number(formData.years_of_investment_experience)) ? Number(formData.years_of_investment_experience) : undefined,
    affiliatedWithExchangeOrFinra: toOptional(formData.affiliated_with_exchange_or_finra),
    whatIsTheAffiliation: toOptional(formData.what_is_the_affiliation),
    seniorOfficerDirectorShareholder: toOptional(formData.senior_officer_director_shareholder),
    companyNames: toOptional(formData.company_names),

    // Signature
    signature: toOptional(formData.signature),
    printedName: toOptional(formData.printed_name),
    date: formData.date ? new Date(formData.date).toISOString() : undefined,
  };
}

/**
 * Transform Step 1 form data to backend format
 */
export function transformAdditionalHolderStep1(formData: FormData) {
  const fullData = transformAdditionalHolderToBackend(formData);
  return {
    accountRegistration: fullData.accountRegistration,
    rrName: fullData.rrName,
    rrNo: fullData.rrNo,
    name: fullData.name,
    personEntity: fullData.personEntity,
    ssn: fullData.ssn,
    ein: fullData.ein,
    holderParticipantRole: fullData.holderParticipantRole,
    email: fullData.email,
    dateOfBirth: fullData.dateOfBirth,
    positionHeld: fullData.positionHeld,
    primaryCitizenship: fullData.primaryCitizenship,
    additionalCitizenship: fullData.additionalCitizenship,
    gender: fullData.gender,
    maritalStatus: fullData.maritalStatus,
    employmentStatus: fullData.employmentStatus,
    occupation: fullData.occupation,
    yearsEmployed: fullData.yearsEmployed,
    typeOfBusiness: fullData.typeOfBusiness,
    employerName: fullData.employerName,
    legalAddress: fullData.legalAddress,
    mailingAddress: fullData.mailingAddress,
    employerAddress: fullData.employerAddress,
    homePhone: formData.home_phone,
    businessPhone: formData.business_phone,
    mobilePhone: formData.mobile_phone,
    overallInvestmentKnowledge: fullData.overallInvestmentKnowledge,
    investmentKnowledge: fullData.investmentKnowledge,
  };
}

/**
 * Transform Step 2 form data to backend format
 */
export function transformAdditionalHolderStep2(formData: FormData) {
  const fullData = transformAdditionalHolderToBackend(formData);
  return {
    investmentKnowledge: fullData.investmentKnowledge,
    annualIncome: fullData.annualIncome,
    netWorth: fullData.netWorth,
    liquidNetWorth: fullData.liquidNetWorth,
    taxBracket: fullData.taxBracket,
    governmentIds: fullData.governmentIds,
    employeeOfThisBrokerDealer: fullData.employeeOfThisBrokerDealer,
    relatedToEmployeeAtThisBrokerDealer: fullData.relatedToEmployeeAtThisBrokerDealer,
    employeeName: fullData.employeeName,
    relationship: fullData.relationship,
    employeeOfAnotherBrokerDealer: fullData.employeeOfAnotherBrokerDealer,
    brokerDealerName: fullData.brokerDealerName,
    relatedToEmployeeAtAnotherBrokerDealer: fullData.relatedToEmployeeAtAnotherBrokerDealer,
    brokerDealerName2: fullData.brokerDealerName2,
    employeeName2: fullData.employeeName2,
    relationship2: fullData.relationship2,
    maintainingOtherBrokerageAccounts: fullData.maintainingOtherBrokerageAccounts,
    withWhatFirms: fullData.withWhatFirms,
    yearsOfInvestmentExperience: fullData.yearsOfInvestmentExperience,
    affiliatedWithExchangeOrFinra: fullData.affiliatedWithExchangeOrFinra,
    whatIsTheAffiliation: fullData.whatIsTheAffiliation,
    seniorOfficerDirectorShareholder: fullData.seniorOfficerDirectorShareholder,
    companyNames: fullData.companyNames,
    signature: fullData.signature,
    printedName: fullData.printedName,
    signatureDate: fullData.date,
  };
}

