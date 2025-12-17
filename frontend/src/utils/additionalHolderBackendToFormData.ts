/**
 * Transform backend Additional Holder data format to frontend form data format
 */

import type { AdditionalHolderProfile } from "../api";
import type { AdditionalHolderFormData } from "../types/additionalHolderForm";

export function transformBackendToAdditionalHolderForm(
  backendData: AdditionalHolderProfile
): AdditionalHolderFormData {
  const formData: AdditionalHolderFormData = {};

  // Basic Information
  formData.account_registration = backendData.accountRegistration;
  formData.rr_name = backendData.rrName;
  formData.rr_no = backendData.rrNo;
  formData.name = backendData.name;
  formData.person_entity = backendData.personEntity ? [backendData.personEntity] : undefined;
  formData.ssn = backendData.ssn;
  formData.ein = backendData.ein;
  formData.holder_participant_role = backendData.holderParticipantRole;
  formData.email = backendData.email;
  formData.dob = backendData.dateOfBirth ? new Date(backendData.dateOfBirth).toISOString().split("T")[0] : undefined;
  formData.position_held = backendData.positionHeld;
  formData.primary_citizenship = backendData.primaryCitizenship;
  formData.additional_citizenship = backendData.additionalCitizenship;
  formData.gender = backendData.gender ? [backendData.gender] : undefined;
  formData.marital_status = backendData.maritalStatus;

  // Employment
  formData.employment_status = backendData.employmentStatus;
  formData.occupation = backendData.occupation;
  formData.years_employed = backendData.yearsEmployed?.toString();
  formData.type_of_business = backendData.typeOfBusiness;
  formData.employer_name = backendData.employerName;

  // Investment Knowledge - Overall
  formData.overall_level = backendData.overallInvestmentKnowledge ? [backendData.overallInvestmentKnowledge] : undefined;

  // Addresses
  if (backendData.addresses) {
    const legalAddress = backendData.addresses.find((a) => a.addressType === "legal");
    if (legalAddress) {
      formData.legal_address_line = legalAddress.addressLine;
      formData.legal_city = legalAddress.city;
      formData.legal_state_province = legalAddress.stateProvince;
      formData.legal_zip_postal_code = legalAddress.zipPostalCode;
      formData.legal_country = legalAddress.country;
    }

    const mailingAddress = backendData.addresses.find((a) => a.addressType === "mailing");
    if (mailingAddress) {
      formData.mailing_address_line = mailingAddress.addressLine;
      formData.mailing_city = mailingAddress.city;
      formData.mailing_state_province = mailingAddress.stateProvince;
      formData.mailing_zip_postal_code = mailingAddress.zipPostalCode;
      formData.mailing_country = mailingAddress.country;
      formData.mailing_same_as_legal = false;
    } else {
      formData.mailing_same_as_legal = true;
    }

    const employerAddress = backendData.addresses.find((a) => a.addressType === "employer");
    if (employerAddress) {
      formData.employer_address_line = employerAddress.addressLine;
      formData.employer_city = employerAddress.city;
      formData.employer_state_province = employerAddress.stateProvince;
      formData.employer_zip_postal_code = employerAddress.zipPostalCode;
      formData.employer_country = employerAddress.country;
    }
  }

  // Phones
  if (backendData.phones) {
    const homePhone = backendData.phones.find((p) => p.phoneType === "home");
    if (homePhone) formData.home_phone = homePhone.phoneNumber;

    const businessPhone = backendData.phones.find((p) => p.phoneType === "business");
    if (businessPhone) formData.business_phone = businessPhone.phoneNumber;

    const mobilePhone = backendData.phones.find((p) => p.phoneType === "mobile");
    if (mobilePhone) formData.mobile_phone = mobilePhone.phoneNumber;
  }

  // Investment Knowledge
  if (backendData.investmentKnowledge) {
    backendData.investmentKnowledge.forEach((inv) => {
      const fieldMap: Record<string, { knowledge: string; since: string }> = {
        "commodities_futures": { knowledge: "commodities_futures_knowledge", since: "commodities_futures_since_year" },
        "equities": { knowledge: "equities_knowledge", since: "equities_since_year" },
        "etf": { knowledge: "exchange_traded_funds_knowledge", since: "exchange_traded_funds_since_year" },
        "fixed_annuities": { knowledge: "fixed_annuities_knowledge", since: "fixed_annuities_since_year" },
        "fixed_insurance": { knowledge: "fixed_insurance_knowledge", since: "fixed_insurance_since_year" },
        "mutual_funds": { knowledge: "mutual_funds_knowledge", since: "mutual_funds_since_year" },
        "options": { knowledge: "options_knowledge", since: "options_since_year" },
        "precious_metals": { knowledge: "precious_metals_knowledge", since: "precious_metals_since_year" },
        "real_estate": { knowledge: "real_estate_knowledge", since: "real_estate_since_year" },
        "unit_investment_trusts": { knowledge: "unit_investment_trusts_knowledge", since: "unit_investment_trusts_since_year" },
        "variable_annuities": { knowledge: "variable_annuities_knowledge", since: "variable_annuities_since_year" },
        "leveraged_inverse_etfs": { knowledge: "leveraged_inverse_etfs_knowledge", since: "leveraged_inverse_etfs_since_year" },
        "complex_products": { knowledge: "complex_products_knowledge", since: "complex_products_since_year" },
        "alternative_investments": { knowledge: "alternative_investments_knowledge", since: "alternative_investments_since_year" },
        "other": { knowledge: "other_investments_knowledge", since: "other_investments_since_year" },
      };

      const fieldNames = fieldMap[inv.investmentType];
      if (fieldNames) {
        if (inv.knowledgeLevel) {
          (formData[fieldNames.knowledge as keyof AdditionalHolderFormData] as string[]) = [inv.knowledgeLevel];
        }
        if (inv.sinceYear) {
          formData[fieldNames.since as keyof AdditionalHolderFormData] = inv.sinceYear.toString();
        }
      }
    });
  }

  // Financial Information
  if (backendData.annualIncomeFrom !== undefined || backendData.annualIncomeTo !== undefined) {
    formData.annual_income = {
      from: backendData.annualIncomeFrom,
      to: backendData.annualIncomeTo,
    };
  }

  if (backendData.netWorthFrom !== undefined || backendData.netWorthTo !== undefined) {
    formData.net_worth = {
      from: backendData.netWorthFrom,
      to: backendData.netWorthTo,
    };
  }

  if (backendData.liquidNetWorthFrom !== undefined || backendData.liquidNetWorthTo !== undefined) {
    formData.liquid_net_worth = {
      from: backendData.liquidNetWorthFrom,
      to: backendData.liquidNetWorthTo,
    };
  }

  formData.tax_bracket = backendData.taxBracket ? [backendData.taxBracket] : undefined;

  // Government IDs
  if (backendData.governmentIds && backendData.governmentIds.length > 0) {
    const govId1 = backendData.governmentIds[0];
    if (govId1) {
      formData.gov_id_1_type = govId1.type;
      formData.gov_id_1_number = govId1.idNumber;
      formData.gov_id_1_country_of_issue = govId1.countryOfIssue;
      formData.gov_id_1_date_of_issue = govId1.dateOfIssue ? new Date(govId1.dateOfIssue).toISOString().split("T")[0] : undefined;
      formData.gov_id_1_date_of_expiration = govId1.dateOfExpiration ? new Date(govId1.dateOfExpiration).toISOString().split("T")[0] : undefined;
    }

    const govId2 = backendData.governmentIds[1];
    if (govId2) {
      formData.gov_id_2_type = govId2.type;
      formData.gov_id_2_number = govId2.idNumber;
      formData.gov_id_2_country_of_issue = govId2.countryOfIssue;
      formData.gov_id_2_date_of_issue = govId2.dateOfIssue ? new Date(govId2.dateOfIssue).toISOString().split("T")[0] : undefined;
      formData.gov_id_2_date_of_expiration = govId2.dateOfExpiration ? new Date(govId2.dateOfExpiration).toISOString().split("T")[0] : undefined;
    }
  }

  // Employment/Affiliation Questions
  formData.employee_of_this_broker_dealer = backendData.employeeOfThisBrokerDealer;
  formData.related_to_employee_at_this_broker_dealer = backendData.relatedToEmployeeAtThisBrokerDealer;
  formData.employee_name = backendData.employeeName;
  formData.relationship = backendData.relationship;
  formData.employee_of_another_broker_dealer = backendData.employeeOfAnotherBrokerDealer;
  formData.broker_dealer_name = backendData.brokerDealerName;
  formData.related_to_employee_at_another_broker_dealer = backendData.relatedToEmployeeAtAnotherBrokerDealer;
  formData.broker_dealer_name_2 = backendData.brokerDealerName2;
  formData.employee_name_2 = backendData.employeeName2;
  formData.relationship_2 = backendData.relationship2;
  formData.maintaining_other_brokerage_accounts = backendData.maintainingOtherBrokerageAccounts;
  formData.with_what_firms = backendData.withWhatFirms;
  formData.years_of_investment_experience = backendData.yearsOfInvestmentExperience?.toString();
  formData.affiliated_with_exchange_or_finra = backendData.affiliatedWithExchangeOrFinra;
  formData.what_is_the_affiliation = backendData.whatIsTheAffiliation;
  formData.senior_officer_director_shareholder = backendData.seniorOfficerDirectorShareholder;
  formData.company_names = backendData.companyNames;

  // Signature
  formData.signature = backendData.signature;
  formData.printed_name = backendData.printedName;
  formData.date = backendData.signatureDate ? new Date(backendData.signatureDate).toISOString().split("T")[0] : undefined;

  return formData;
}
