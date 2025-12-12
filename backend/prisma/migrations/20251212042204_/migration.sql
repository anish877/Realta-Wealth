/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PersonEntity" AS ENUM ('Person', 'Entity');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "YesNo" AS ENUM ('Yes', 'No');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('individual', 'corporation', 'corporate_pension_profit_sharing', 'custodial', 'estate', 'joint_tenant', 'limited_liability_company', 'individual_single_member_llc', 'sole_proprietorship', 'transfer_on_death_individual', 'transfer_on_death_joint', 'nonprofit_organization', 'partnership', 'exempt_organization', 'trust', 'other');

-- CreateEnum
CREATE TYPE "AdditionalDesignationType" AS ENUM ('c_corp', 's_corp', 'ugma', 'utma', 'partnership');

-- CreateEnum
CREATE TYPE "TrustType" AS ENUM ('charitable', 'living', 'irrevocable_living', 'family', 'revocable', 'irrevocable', 'testamentary');

-- CreateEnum
CREATE TYPE "TenancyClause" AS ENUM ('community_property', 'tenants_by_entirety', 'community_property_with_rights', 'joint_tenants_with_rights_of_survivorship', 'tenants_in_common');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('Single', 'Married', 'Divorced', 'DomesticPartner', 'Widow', 'Widowed');

-- CreateEnum
CREATE TYPE "EmploymentAffiliation" AS ENUM ('Employed', 'SelfEmployed', 'Retired', 'Unemployed', 'Student', 'Homemaker');

-- CreateEnum
CREATE TYPE "InvestmentKnowledgeLevel" AS ENUM ('Limited', 'Moderate', 'Extensive', 'None');

-- CreateEnum
CREATE TYPE "InvestmentType" AS ENUM ('commodities_futures', 'equities', 'etf', 'fixed_annuities', 'fixed_insurance', 'mutual_funds', 'options', 'precious_metals', 'real_estate', 'unit_investment_trusts', 'variable_annuities', 'leveraged_inverse_etfs', 'complex_products', 'alternative_investments', 'other');

-- CreateEnum
CREATE TYPE "TaxBracket" AS ENUM ('zero_to_15', 'fifteen_1_to_32', 'thirtytwo_1_to_50', 'fifty_1_plus');

-- CreateEnum
CREATE TYPE "RiskExposure" AS ENUM ('Low', 'Moderate', 'Speculation', 'HighRisk');

-- CreateEnum
CREATE TYPE "AccountInvestmentObjective" AS ENUM ('Income', 'LongTermGrowth', 'ShortTermGrowth');

-- CreateEnum
CREATE TYPE "LiquidityNeed" AS ENUM ('High', 'Medium', 'Low');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('legal', 'mailing', 'employer');

-- CreateEnum
CREATE TYPE "PhoneType" AS ENUM ('home', 'business', 'mobile');

-- CreateEnum
CREATE TYPE "SignatureType" AS ENUM ('account_owner', 'joint_account_owner', 'financial_professional', 'supervisor_principal');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "AccountHolderType" AS ENUM ('primary', 'secondary');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'draft',
    "rr_name" TEXT,
    "rr_no" TEXT,
    "customer_names" TEXT,
    "account_no" TEXT,
    "retirement_account" BOOLEAN NOT NULL DEFAULT false,
    "retail_account" BOOLEAN NOT NULL DEFAULT false,
    "other_account_type_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),

    CONSTRAINT "investor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investor_profile_account_types" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "account_type" "AccountType" NOT NULL,

    CONSTRAINT "investor_profile_account_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investor_profile_additional_designations" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "designation_type" "AdditionalDesignationType" NOT NULL,

    CONSTRAINT "investor_profile_additional_designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_information" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "establishment_date" TIMESTAMP(3),
    "trust_types" "TrustType"[],

    CONSTRAINT "trust_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "joint_account_information" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "are_account_holders_married" "YesNo",
    "tenancy_state" TEXT,
    "number_of_tenants" INTEGER,
    "tenancy_clauses" "TenancyClause"[],

    CONSTRAINT "joint_account_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custodial_account_information" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "state_gift_given_1" TEXT,
    "date_gift_given_1" TIMESTAMP(3),
    "state_gift_given_2" TEXT,
    "date_gift_given_2" TIMESTAMP(3),

    CONSTRAINT "custodial_account_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_on_death_information" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "individual_agreement_date" TIMESTAMP(3),
    "joint_agreement_date" TIMESTAMP(3),

    CONSTRAINT "transfer_on_death_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patriot_act_information" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "initial_source_of_funds" TEXT[],
    "other_source_of_funds_text" TEXT,

    CONSTRAINT "patriot_act_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_holders" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "holder_type" "AccountHolderType" NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "person_entity" "PersonEntity",
    "ssn" TEXT,
    "ein" TEXT,
    "yes_no_box" "YesNo",
    "date_of_birth" TIMESTAMP(3),
    "specified_adult" "YesNo",
    "primary_citizenship" TEXT,
    "additional_citizenship" TEXT,
    "gender" "Gender",
    "general_investment_knowledge" "InvestmentKnowledgeLevel",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_holders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_holder_addresses" (
    "id" TEXT NOT NULL,
    "account_holder_id" TEXT NOT NULL,
    "address_type" "AddressType" NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state_province" TEXT,
    "zip_postal_code" TEXT,
    "country" TEXT,
    "mailing_same_as_legal" BOOLEAN DEFAULT false,

    CONSTRAINT "account_holder_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_holder_phones" (
    "id" TEXT NOT NULL,
    "account_holder_id" TEXT NOT NULL,
    "phone_type" "PhoneType" NOT NULL,
    "phoneNumber" TEXT,

    CONSTRAINT "account_holder_phones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_holder_marital_statuses" (
    "id" TEXT NOT NULL,
    "account_holder_id" TEXT NOT NULL,
    "marital_status" "MaritalStatus" NOT NULL,

    CONSTRAINT "account_holder_marital_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_holder_employment_affiliations" (
    "id" TEXT NOT NULL,
    "account_holder_id" TEXT NOT NULL,
    "affiliation" "EmploymentAffiliation" NOT NULL,

    CONSTRAINT "account_holder_employment_affiliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_holder_employment" (
    "id" TEXT NOT NULL,
    "account_holder_id" TEXT NOT NULL,
    "occupation" TEXT,
    "years_employed" INTEGER,
    "type_of_business" TEXT,
    "employer_name" TEXT,
    "employer_address_id" TEXT,

    CONSTRAINT "account_holder_employment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_holder_investment_knowledge" (
    "id" TEXT NOT NULL,
    "account_holder_id" TEXT NOT NULL,
    "investment_type" "InvestmentType" NOT NULL,
    "knowledge_level" "InvestmentKnowledgeLevel" NOT NULL,
    "sinceYear" TEXT,
    "other_investment_label" TEXT,

    CONSTRAINT "account_holder_investment_knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_holder_financial_information" (
    "id" TEXT NOT NULL,
    "account_holder_id" TEXT NOT NULL,
    "annual_income_from" DECIMAL(19,2),
    "annual_income_to" DECIMAL(19,2),
    "net_worth_from" DECIMAL(19,2),
    "net_worth_to" DECIMAL(19,2),
    "liquid_net_worth_from" DECIMAL(19,2),
    "liquid_net_worth_to" DECIMAL(19,2),
    "tax_bracket" "TaxBracket",

    CONSTRAINT "account_holder_financial_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "government_identifications" (
    "id" TEXT NOT NULL,
    "account_holder_id" TEXT NOT NULL,
    "id_number" INTEGER NOT NULL,
    "id_type" TEXT,
    "id_number_value" TEXT,
    "country_of_issue" TEXT,
    "date_of_issue" TIMESTAMP(3),
    "date_of_expiration" TIMESTAMP(3),

    CONSTRAINT "government_identifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advisory_firm_information" (
    "id" TEXT NOT NULL,
    "account_holder_id" TEXT NOT NULL,
    "employee_of_advisory_firm" "YesNo",
    "related_to_employee_advisory" "YesNo",
    "employee_name_and_relationship" TEXT,

    CONSTRAINT "advisory_firm_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_dealer_information" (
    "id" TEXT NOT NULL,
    "account_holder_id" TEXT NOT NULL,
    "employee_of_broker_dealer" "YesNo",
    "broker_dealer_name" TEXT,
    "related_to_employee_broker_dealer" "YesNo",
    "broker_dealer_employee_name" TEXT,
    "broker_dealer_employee_relationship" TEXT,

    CONSTRAINT "broker_dealer_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "other_brokerage_accounts" (
    "id" TEXT NOT NULL,
    "account_holder_id" TEXT NOT NULL,
    "maintaining_other_accounts" "YesNo",
    "with_what_firms" TEXT,
    "years_of_investment_experience" INTEGER,

    CONSTRAINT "other_brokerage_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_finra_affiliation" (
    "id" TEXT NOT NULL,
    "account_holder_id" TEXT NOT NULL,
    "affiliated_with_exchange_or_finra" "YesNo",
    "affiliation_details" TEXT,

    CONSTRAINT "exchange_finra_affiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_company_information" (
    "id" TEXT NOT NULL,
    "account_holder_id" TEXT NOT NULL,
    "senior_officer_or_10pct_shareholder" "YesNo",
    "company_names" TEXT,

    CONSTRAINT "public_company_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_objectives" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "risk_exposure" "RiskExposure"[],
    "account_investment_objectives" "AccountInvestmentObjective"[],
    "see_attached_statement" BOOLEAN NOT NULL DEFAULT false,
    "time_horizon_from" TEXT,
    "time_horizon_to" TEXT,
    "liquidity_needs" "LiquidityNeed"[],

    CONSTRAINT "investment_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_values" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "investment_type" "InvestmentType" NOT NULL,
    "value" DECIMAL(19,2) NOT NULL,

    CONSTRAINT "investment_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trusted_contacts" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "decline_to_provide" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "email" TEXT,
    "home_phone" TEXT,
    "business_phone" TEXT,
    "mobile_phone" TEXT,
    "mailing_address" TEXT,
    "city" TEXT,
    "state_province" TEXT,
    "zip_postal_code" TEXT,
    "country" TEXT,

    CONSTRAINT "trusted_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signatures" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "signature_type" "SignatureType" NOT NULL,
    "signature_data" TEXT NOT NULL,
    "printed_name" TEXT NOT NULL,
    "signature_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signatures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "investor_profiles_user_id_idx" ON "investor_profiles"("user_id");

-- CreateIndex
CREATE INDEX "investor_profiles_status_idx" ON "investor_profiles"("status");

-- CreateIndex
CREATE INDEX "investor_profiles_created_at_idx" ON "investor_profiles"("created_at");

-- CreateIndex
CREATE INDEX "investor_profile_account_types_profile_id_idx" ON "investor_profile_account_types"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "investor_profile_account_types_profile_id_account_type_key" ON "investor_profile_account_types"("profile_id", "account_type");

-- CreateIndex
CREATE INDEX "investor_profile_additional_designations_profile_id_idx" ON "investor_profile_additional_designations"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "investor_profile_additional_designations_profile_id_designa_key" ON "investor_profile_additional_designations"("profile_id", "designation_type");

-- CreateIndex
CREATE UNIQUE INDEX "trust_information_profile_id_key" ON "trust_information"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "joint_account_information_profile_id_key" ON "joint_account_information"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "custodial_account_information_profile_id_key" ON "custodial_account_information"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_on_death_information_profile_id_key" ON "transfer_on_death_information"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "patriot_act_information_profile_id_key" ON "patriot_act_information"("profile_id");

-- CreateIndex
CREATE INDEX "account_holders_profile_id_idx" ON "account_holders"("profile_id");

-- CreateIndex
CREATE INDEX "account_holders_holder_type_idx" ON "account_holders"("holder_type");

-- CreateIndex
CREATE INDEX "account_holder_addresses_account_holder_id_idx" ON "account_holder_addresses"("account_holder_id");

-- CreateIndex
CREATE INDEX "account_holder_addresses_address_type_idx" ON "account_holder_addresses"("address_type");

-- CreateIndex
CREATE INDEX "account_holder_phones_account_holder_id_idx" ON "account_holder_phones"("account_holder_id");

-- CreateIndex
CREATE INDEX "account_holder_marital_statuses_account_holder_id_idx" ON "account_holder_marital_statuses"("account_holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_holder_marital_statuses_account_holder_id_marital_s_key" ON "account_holder_marital_statuses"("account_holder_id", "marital_status");

-- CreateIndex
CREATE INDEX "account_holder_employment_affiliations_account_holder_id_idx" ON "account_holder_employment_affiliations"("account_holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_holder_employment_affiliations_account_holder_id_af_key" ON "account_holder_employment_affiliations"("account_holder_id", "affiliation");

-- CreateIndex
CREATE UNIQUE INDEX "account_holder_employment_account_holder_id_key" ON "account_holder_employment"("account_holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_holder_employment_employer_address_id_key" ON "account_holder_employment"("employer_address_id");

-- CreateIndex
CREATE INDEX "account_holder_investment_knowledge_account_holder_id_idx" ON "account_holder_investment_knowledge"("account_holder_id");

-- CreateIndex
CREATE INDEX "account_holder_investment_knowledge_investment_type_idx" ON "account_holder_investment_knowledge"("investment_type");

-- CreateIndex
CREATE UNIQUE INDEX "account_holder_investment_knowledge_account_holder_id_inves_key" ON "account_holder_investment_knowledge"("account_holder_id", "investment_type");

-- CreateIndex
CREATE UNIQUE INDEX "account_holder_financial_information_account_holder_id_key" ON "account_holder_financial_information"("account_holder_id");

-- CreateIndex
CREATE INDEX "government_identifications_account_holder_id_idx" ON "government_identifications"("account_holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "government_identifications_account_holder_id_id_number_key" ON "government_identifications"("account_holder_id", "id_number");

-- CreateIndex
CREATE UNIQUE INDEX "advisory_firm_information_account_holder_id_key" ON "advisory_firm_information"("account_holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "broker_dealer_information_account_holder_id_key" ON "broker_dealer_information"("account_holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "other_brokerage_accounts_account_holder_id_key" ON "other_brokerage_accounts"("account_holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_finra_affiliation_account_holder_id_key" ON "exchange_finra_affiliation"("account_holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "public_company_information_account_holder_id_key" ON "public_company_information"("account_holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "investment_objectives_profile_id_key" ON "investment_objectives"("profile_id");

-- CreateIndex
CREATE INDEX "investment_values_profile_id_idx" ON "investment_values"("profile_id");

-- CreateIndex
CREATE INDEX "investment_values_investment_type_idx" ON "investment_values"("investment_type");

-- CreateIndex
CREATE UNIQUE INDEX "investment_values_profile_id_investment_type_key" ON "investment_values"("profile_id", "investment_type");

-- CreateIndex
CREATE UNIQUE INDEX "trusted_contacts_profile_id_key" ON "trusted_contacts"("profile_id");

-- CreateIndex
CREATE INDEX "signatures_profile_id_idx" ON "signatures"("profile_id");

-- CreateIndex
CREATE INDEX "signatures_signature_type_idx" ON "signatures"("signature_type");

-- CreateIndex
CREATE UNIQUE INDEX "signatures_profile_id_signature_type_key" ON "signatures"("profile_id", "signature_type");

-- AddForeignKey
ALTER TABLE "investor_profiles" ADD CONSTRAINT "investor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investor_profile_account_types" ADD CONSTRAINT "investor_profile_account_types_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investor_profile_additional_designations" ADD CONSTRAINT "investor_profile_additional_designations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_information" ADD CONSTRAINT "trust_information_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "joint_account_information" ADD CONSTRAINT "joint_account_information_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custodial_account_information" ADD CONSTRAINT "custodial_account_information_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_on_death_information" ADD CONSTRAINT "transfer_on_death_information_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patriot_act_information" ADD CONSTRAINT "patriot_act_information_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_holders" ADD CONSTRAINT "account_holders_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_holder_addresses" ADD CONSTRAINT "account_holder_addresses_account_holder_id_fkey" FOREIGN KEY ("account_holder_id") REFERENCES "account_holders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_holder_phones" ADD CONSTRAINT "account_holder_phones_account_holder_id_fkey" FOREIGN KEY ("account_holder_id") REFERENCES "account_holders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_holder_marital_statuses" ADD CONSTRAINT "account_holder_marital_statuses_account_holder_id_fkey" FOREIGN KEY ("account_holder_id") REFERENCES "account_holders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_holder_employment_affiliations" ADD CONSTRAINT "account_holder_employment_affiliations_account_holder_id_fkey" FOREIGN KEY ("account_holder_id") REFERENCES "account_holders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_holder_employment" ADD CONSTRAINT "account_holder_employment_account_holder_id_fkey" FOREIGN KEY ("account_holder_id") REFERENCES "account_holders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_holder_employment" ADD CONSTRAINT "account_holder_employment_employer_address_id_fkey" FOREIGN KEY ("employer_address_id") REFERENCES "account_holder_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_holder_investment_knowledge" ADD CONSTRAINT "account_holder_investment_knowledge_account_holder_id_fkey" FOREIGN KEY ("account_holder_id") REFERENCES "account_holders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_holder_financial_information" ADD CONSTRAINT "account_holder_financial_information_account_holder_id_fkey" FOREIGN KEY ("account_holder_id") REFERENCES "account_holders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "government_identifications" ADD CONSTRAINT "government_identifications_account_holder_id_fkey" FOREIGN KEY ("account_holder_id") REFERENCES "account_holders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advisory_firm_information" ADD CONSTRAINT "advisory_firm_information_account_holder_id_fkey" FOREIGN KEY ("account_holder_id") REFERENCES "account_holders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_dealer_information" ADD CONSTRAINT "broker_dealer_information_account_holder_id_fkey" FOREIGN KEY ("account_holder_id") REFERENCES "account_holders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "other_brokerage_accounts" ADD CONSTRAINT "other_brokerage_accounts_account_holder_id_fkey" FOREIGN KEY ("account_holder_id") REFERENCES "account_holders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_finra_affiliation" ADD CONSTRAINT "exchange_finra_affiliation_account_holder_id_fkey" FOREIGN KEY ("account_holder_id") REFERENCES "account_holders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_company_information" ADD CONSTRAINT "public_company_information_account_holder_id_fkey" FOREIGN KEY ("account_holder_id") REFERENCES "account_holders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_objectives" ADD CONSTRAINT "investment_objectives_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_values" ADD CONSTRAINT "investment_values_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trusted_contacts" ADD CONSTRAINT "trusted_contacts_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
