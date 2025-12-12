/**
 * Transform backend API format to frontend form data format
 */

type BackendProfile = any;

/**
 * Transform backend profile to frontend form data
 */
export function transformProfileToFormData(profile: BackendProfile): Record<string, any> {
  const formData: Record<string, any> = {};

  // Step 1: Account Registration
  if (profile) {
    formData.rr_name = profile.rrName || "";
    formData.rr_no = profile.rrNo || "";
    formData.customer_names = profile.customerNames || "";
    formData.account_no = profile.accountNo || "";
    formData.retirement_checkbox = profile.retirementAccount || false;
    formData.retail_checkbox = profile.retailAccount || false;
    formData.other_account_type_text = profile.otherAccountTypeText || "";

    // Account types - always set, even if empty array
    formData.type_of_account = profile.accountTypes && profile.accountTypes.length > 0
      ? profile.accountTypes.map((at: any) => at.accountType)
      : [];

    // Additional designations - always set, even if empty array
    formData.additional_designation_left = profile.additionalDesignations && profile.additionalDesignations.length > 0
      ? profile.additionalDesignations.map((ad: any) => ad.designationType)
      : [];

    // Trust information
    if (profile.trustInformation) {
      formData.trust_checkbox = true;
      formData.trust_establishment_date = profile.trustInformation.establishmentDate || "";
      formData.trust_type = profile.trustInformation.trustTypes || [];
    }

    // Joint account information
    if (profile.jointAccountInformation) {
      formData.are_account_holders_married = profile.jointAccountInformation.areAccountHoldersMarried;
      formData.tenancy_state = profile.jointAccountInformation.tenancyState || "";
      formData.number_of_tenants = profile.jointAccountInformation.numberOfTenants || "";
      formData.tenancy_clause = profile.jointAccountInformation.tenancyClauses || [];
    }

    // Custodial account information
    if (profile.custodialAccountInformation) {
      formData.state_in_which_gift_was_given_1 =
        profile.custodialAccountInformation.stateGiftGiven1 || "";
      formData.date_gift_was_given_1 = profile.custodialAccountInformation.dateGiftGiven1 || "";
      formData.state_in_which_gift_was_given_2 =
        profile.custodialAccountInformation.stateGiftGiven2 || "";
      formData.date_gift_was_given_2 = profile.custodialAccountInformation.dateGiftGiven2 || "";
    }

    // Transfer on death information
    if (profile.transferOnDeathInformation) {
      formData.transfer_on_death_individual_agreement_date =
        profile.transferOnDeathInformation.individualAgreementDate || "";
      formData.transfer_on_death_joint_agreement_date =
        profile.transferOnDeathInformation.jointAgreementDate || "";
    }
  }

  // Step 2: Patriot Act Information
  if (profile?.patriotActInformation) {
    formData.initial_source_of_funds = profile.patriotActInformation.initialSourceOfFunds || [];
    formData.initial_source_of_funds_other_text =
      profile.patriotActInformation.otherSourceOfFundsText || "";
  }

  // Step 3 & 4: Account Holders
  if (profile?.accountHolders) {
    const primaryHolder = profile.accountHolders.find((h: any) => h.holderType === "primary");
    const secondaryHolder = profile.accountHolders.find((h: any) => h.holderType === "secondary");

    if (primaryHolder) {
      transformAccountHolderToFormData(primaryHolder, "primary", formData);
    }

    if (secondaryHolder) {
      transformAccountHolderToFormData(secondaryHolder, "secondary", formData);
    }
  }

  // Step 5: Investment Objectives
  if (profile?.investmentObjectives) {
    formData.risk_exposure = profile.investmentObjectives.riskExposure || [];
    formData.account_investment_objectives =
      profile.investmentObjectives.accountInvestmentObjectives || [];
    formData.other_investments_see_attached =
      profile.investmentObjectives.seeAttachedStatement || false;
    formData.investment_time_horizon_from =
      profile.investmentObjectives.timeHorizonFrom || "";
    formData.investment_time_horizon_to = profile.investmentObjectives.timeHorizonTo || "";
    formData.liquidity_needs = profile.investmentObjectives.liquidityNeeds || [];
  }

  // Investment values
  if (profile?.investmentValues && profile.investmentValues.length > 0) {
    profile.investmentValues.forEach((iv: any) => {
      const fieldName = mapInvestmentValueToField(iv.investmentType);
      if (fieldName) {
        formData[fieldName] = iv.value;
      }
    });
  }

  // Step 6: Trusted Contact
  if (profile?.trustedContact) {
    formData.trusted_contact_decline_to_provide =
      profile.trustedContact.declineToProvide || false;
    formData.trusted_contact_name = profile.trustedContact.name || "";
    formData.trusted_contact_email = profile.trustedContact.email || "";
    formData.trusted_contact_home_phone = profile.trustedContact.homePhone || "";
    formData.trusted_contact_business_phone = profile.trustedContact.businessPhone || "";
    formData.trusted_contact_mobile_phone = profile.trustedContact.mobilePhone || "";
    formData.trusted_contact_mailing_address = profile.trustedContact.mailingAddress || "";
    formData.trusted_contact_city = profile.trustedContact.city || "";
    formData.trusted_contact_state_province = profile.trustedContact.stateProvince || "";
    formData.trusted_contact_zip_postal_code = profile.trustedContact.zipPostalCode || "";
    formData.trusted_contact_country = profile.trustedContact.country || "";
  }

  // Step 7: Signatures
  if (profile?.signatures && profile.signatures.length > 0) {
    profile.signatures.forEach((sig: any) => {
      const prefix = mapSignatureTypeToPrefix(sig.signatureType);
      if (prefix) {
        formData[`${prefix}_signature`] = sig.signatureData || "";
        formData[`${prefix}_printed_name`] = sig.printedName || "";
        formData[`${prefix}_date`] = sig.signatureDate || "";
      }
    });
  }

  return formData;
}

/**
 * Transform account holder data to form data format
 */
function transformAccountHolderToFormData(
  holder: any,
  prefix: "primary" | "secondary",
  formData: Record<string, any>
) {
  const fieldPrefix = prefix === "primary" ? "primary" : "secondary";

  // Basic info
  formData[`${fieldPrefix}_name`] = holder.name || "";
  formData[`${fieldPrefix}_email`] = holder.email || "";
  formData[`${fieldPrefix}_person_entity`] = holder.personEntity || "";
  formData[`${fieldPrefix}_ssn`] = holder.ssn || "";
  formData[`${fieldPrefix}_ein`] = holder.ein || "";
  formData[`${fieldPrefix}_yes_no_box`] = holder.yesNoBox || "";
  formData[`${fieldPrefix}_dob`] = holder.dateOfBirth || "";
  formData[`${fieldPrefix}_specified_adult`] = holder.specifiedAdult || "";
  formData[`${fieldPrefix}_citizenship_primary`] = holder.primaryCitizenship || "";
  if (prefix === "primary") {
    formData[`${fieldPrefix}_citizenship_additional`] = holder.additionalCitizenship || "";
  }
  formData[`${fieldPrefix}_gender`] = holder.gender || "";
  formData[`${fieldPrefix}_general_investment_knowledge`] = holder.generalInvestmentKnowledge || "";

  // Addresses
  if (holder.addresses && holder.addresses.length > 0) {
    holder.addresses.forEach((addr: any) => {
      if (addr.addressType === "legal") {
        formData[`${fieldPrefix}_legal_address`] = addr.address || "";
        formData[`${fieldPrefix}_city`] = addr.city || "";
        formData[`${fieldPrefix}_state_province`] = addr.stateProvince || "";
        formData[`${fieldPrefix}_zip_postal_code`] = addr.zipPostalCode || "";
        formData[`${fieldPrefix}_country`] = addr.country || "";
      } else if (addr.addressType === "mailing") {
        formData[`${fieldPrefix}_mailing_address`] = addr.address || "";
        formData[`${fieldPrefix}_mailing_city`] = addr.city || "";
        formData[`${fieldPrefix}_mailing_state_province`] = addr.stateProvince || "";
        formData[`${fieldPrefix}_mailing_zip_postal_code`] = addr.zipPostalCode || "";
        formData[`${fieldPrefix}_mailing_country`] = addr.country || "";
        formData[`${fieldPrefix}_mailing_same_as_legal`] = addr.mailingSameAsLegal || false;
      } else if (addr.addressType === "employer") {
        formData[`${fieldPrefix}_employer_address`] = addr.address || "";
        formData[`${fieldPrefix}_employer_city`] = addr.city || "";
        formData[`${fieldPrefix}_employer_state_province`] = addr.stateProvince || "";
        formData[`${fieldPrefix}_employer_zip_postal_code`] = addr.zipPostalCode || "";
        formData[`${fieldPrefix}_employer_country`] = addr.country || "";
      }
    });
  }

  // Phones
  if (holder.phones && holder.phones.length > 0) {
    holder.phones.forEach((phone: any) => {
      if (phone.phoneType === "home") {
        formData[`${fieldPrefix}_home_phone`] = phone.phoneNumber || "";
      } else if (phone.phoneType === "business") {
        formData[`${fieldPrefix}_business_phone`] = phone.phoneNumber || "";
      } else if (phone.phoneType === "mobile") {
        formData[`${fieldPrefix}_mobile_phone`] = phone.phoneNumber || "";
      }
    });
  }

  // Marital status
  if (holder.maritalStatuses && holder.maritalStatuses.length > 0) {
    formData[`${fieldPrefix}_marital_status`] = holder.maritalStatuses.map(
      (ms: any) => ms.maritalStatus
    );
  }

  // Employment affiliations
  if (holder.employmentAffiliations && holder.employmentAffiliations.length > 0) {
    formData[`${fieldPrefix}_employment_affiliations`] = holder.employmentAffiliations.map(
      (ea: any) => ea.affiliation
    );
  }

  // Employment
  if (holder.employment) {
    formData[`${fieldPrefix}_occupation`] = holder.employment.occupation || "";
    formData[`${fieldPrefix}_years_employed`] = holder.employment.yearsEmployed || "";
    formData[`${fieldPrefix}_type_of_business`] = holder.employment.typeOfBusiness || "";
    formData[`${fieldPrefix}_employer_name`] = holder.employment.employerName || "";
  }

  // Investment knowledge
  if (holder.investmentKnowledge && holder.investmentKnowledge.length > 0) {
    holder.investmentKnowledge.forEach((ik: any) => {
      const fieldName = mapInvestmentKnowledgeToField(ik.investmentType, prefix);
      if (fieldName) {
        formData[fieldName] = ik.knowledgeLevel || "";
        const sinceField = fieldName.replace("_knowledge", "_since_year");
        formData[sinceField] = ik.sinceYear || "";
      }
    });
  }

  // Financial information
  if (holder.financialInformation) {
    const fi = holder.financialInformation;
    const suffix = prefix === "primary" ? "" : "_2";
    formData[`annual_income_from${suffix}`] = fi.annualIncomeFrom || "";
    formData[`annual_income_to${suffix}`] = fi.annualIncomeTo || "";
    formData[`net_worth_from${suffix}`] = fi.netWorthFrom || "";
    formData[`net_worth_to${suffix}`] = fi.netWorthTo || "";
    formData[`liquid_net_worth_from${suffix}`] = fi.liquidNetWorthFrom || "";
    formData[`liquid_net_worth_to${suffix}`] = fi.liquidNetWorthTo || "";
    formData[`tax_bracket${suffix}`] = fi.taxBracket || "";
  }

  // Government identifications
  if (holder.governmentIdentifications && holder.governmentIdentifications.length > 0) {
    holder.governmentIdentifications.forEach((govId: any, index: number) => {
      const idNum = index + 1;
      const prefix2 = idNum === 1 ? "gov" : "gov2";
      formData[`${prefix2}_type`] = govId.idType || "";
      formData[`${prefix2}_id_number`] = govId.idNumberValue || "";
      formData[`${prefix2}_country_of_issue`] = govId.countryOfIssue || "";
      formData[`${prefix2}_date_of_issue`] = govId.dateOfIssue || "";
      formData[`${prefix2}_date_of_expiration`] = govId.dateOfExpiration || "";
    });
  }

  // Advisory firm information
  if (holder.advisoryFirmInformation) {
    formData[`${fieldPrefix}_employee_of_advisory_firm`] =
      holder.advisoryFirmInformation.employeeOfAdvisoryFirm || "";
    formData[`${fieldPrefix}_related_to_employee_advisory`] =
      holder.advisoryFirmInformation.relatedToEmployeeAdvisory || "";
    formData[`${fieldPrefix}_employee_name_and_relationship`] =
      holder.advisoryFirmInformation.employeeNameAndRelationship || "";
  }

  // Broker dealer information
  if (holder.brokerDealerInformation) {
    formData[`${fieldPrefix}_employee_of_broker_dealer`] =
      holder.brokerDealerInformation.employeeOfBrokerDealer || "";
    formData[`${fieldPrefix}_broker_dealer_name`] =
      holder.brokerDealerInformation.brokerDealerName || "";
    formData[`${fieldPrefix}_related_to_employee_broker_dealer`] =
      holder.brokerDealerInformation.relatedToEmployeeBrokerDealer || "";
    formData[`${fieldPrefix}_broker_dealer_employee_name`] =
      holder.brokerDealerInformation.brokerDealerEmployeeName || "";
    formData[`${fieldPrefix}_broker_dealer_employee_relationship`] =
      holder.brokerDealerInformation.brokerDealerEmployeeRelationship || "";
  }

  // Other brokerage accounts
  if (holder.otherBrokerageAccounts) {
    formData[`${fieldPrefix}_maintaining_other_brokerage_accounts`] =
      holder.otherBrokerageAccounts.maintainingOtherAccounts || "";
    formData[`${fieldPrefix}_with_what_firms`] = holder.otherBrokerageAccounts.withWhatFirms || "";
    formData[`${fieldPrefix}_years_of_investment_experience`] =
      holder.otherBrokerageAccounts.yearsOfInvestmentExperience || "";
  }

  // Exchange/FINRA affiliation
  if (holder.exchangeFinraAffiliation) {
    formData[`${fieldPrefix}_affiliated_with_exchange_or_finra`] =
      holder.exchangeFinraAffiliation.affiliatedWithExchangeOrFinra || "";
    formData[`${fieldPrefix}_affiliation_employer_authorization_required`] =
      holder.exchangeFinraAffiliation.affiliationDetails || "";
  }

  // Public company information
  if (holder.publicCompanyInformation) {
    formData[`${fieldPrefix}_senior_officer_or_10pct_shareholder`] =
      holder.publicCompanyInformation.seniorOfficerOr10PctShareholder || "";
    formData[`${fieldPrefix}_company_names`] =
      holder.publicCompanyInformation.companyNames || "";
  }
}

/**
 * Helper functions to map backend enum values to frontend field names
 */
function mapInvestmentValueToField(investmentType: string): string | null {
  const mapping: Record<string, string> = {
    equities: "investment_equities_value",
    fixed_annuities: "investment_fixed_annuities_value",
    options: "investment_options_value",
    precious_metals: "investment_precious_metals_value",
    fixed_income: "investment_fixed_income_value",
    commodities_futures: "investment_commodities_futures_value",
    mutual_funds: "investment_mutual_funds_value",
    unit_investment_trusts: "investment_unit_investment_trusts_value",
    etf: "investment_etfs_value",
    real_estate: "investment_real_estate_value",
    fixed_insurance: "investment_insurance_value",
    variable_annuities: "investment_variable_annuities_value",
  };
  return mapping[investmentType] || null;
}

function mapInvestmentKnowledgeToField(
  investmentType: string,
  prefix: "primary" | "secondary"
): string | null {
  const baseMapping: Record<string, string> = {
    commodities_futures: "commodities_futures_knowledge",
    equities: "equities_knowledge",
    etf: "etf_knowledge",
    fixed_annuities: "fixed_annuities_knowledge",
    fixed_insurance: "fixed_insurance_knowledge",
    mutual_funds: "mutual_funds_knowledge",
    options: "options_knowledge",
    precious_metals: "precious_metals_knowledge",
    real_estate: "real_estate_knowledge",
    unit_investment_trusts: "unit_investment_trusts_knowledge",
    variable_annuities: "variable_annuities_knowledge",
    leveraged_inverse_etfs: "leveraged_inverse_etfs_knowledge",
    complex_products: "complex_products_knowledge",
    alternative_investments: "alternative_investments_knowledge",
  };

  const fieldName = baseMapping[investmentType];
  if (!fieldName) return null;

  return prefix === "primary" ? fieldName : `secondary_${fieldName.replace("_knowledge", "")}`;
}

function mapSignatureTypeToPrefix(signatureType: string): string | null {
  const mapping: Record<string, string> = {
    account_owner: "account_owner",
    joint_account_owner: "joint_account_owner",
    financial_professional: "financial_professional",
    supervisor_principal: "supervisor_principal",
  };
  return mapping[signatureType] || null;
}

