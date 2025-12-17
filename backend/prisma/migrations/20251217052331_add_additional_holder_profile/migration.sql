-- CreateTable
CREATE TABLE "additional_holder_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'draft',
    "last_completed_page" INTEGER NOT NULL DEFAULT 0,
    "page_completion_status" JSONB,
    "account_registration" TEXT,
    "rr_name" TEXT,
    "rr_no" TEXT,
    "name" TEXT,
    "person_entity" "PersonEntity",
    "ssn" TEXT,
    "ein" TEXT,
    "holder_participant_role" TEXT,
    "email" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "position_held" TEXT,
    "primary_citizenship" TEXT,
    "additional_citizenship" TEXT,
    "gender" "Gender",
    "marital_status" "MaritalStatus"[],
    "employment_status" "EmploymentAffiliation"[],
    "occupation" TEXT,
    "years_employed" INTEGER,
    "type_of_business" TEXT,
    "employer_name" TEXT,
    "overall_investment_knowledge" "InvestmentKnowledgeLevel",
    "annual_income_from" DECIMAL(19,2),
    "annual_income_to" DECIMAL(19,2),
    "net_worth_from" DECIMAL(19,2),
    "net_worth_to" DECIMAL(19,2),
    "liquid_net_worth_from" DECIMAL(19,2),
    "liquid_net_worth_to" DECIMAL(19,2),
    "tax_bracket" "TaxBracket",
    "years_of_investment_experience" INTEGER,
    "employee_of_this_broker_dealer" "YesNo",
    "related_to_employee_at_this_broker_dealer" "YesNo",
    "employee_name" TEXT,
    "relationship" TEXT,
    "employee_of_another_broker_dealer" "YesNo",
    "broker_dealer_name" TEXT,
    "related_to_employee_at_another_broker_dealer" "YesNo",
    "broker_dealer_name_2" TEXT,
    "employee_name_2" TEXT,
    "relationship_2" TEXT,
    "maintaining_other_brokerage_accounts" "YesNo",
    "with_what_firms" TEXT,
    "affiliated_with_exchange_or_finra" "YesNo",
    "what_is_the_affiliation" TEXT,
    "senior_officer_director_shareholder" "YesNo",
    "company_names" TEXT,
    "signature" TEXT,
    "printed_name" TEXT,
    "signature_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),

    CONSTRAINT "additional_holder_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_holder_addresses" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "address_type" "AddressType" NOT NULL,
    "address_line" TEXT,
    "city" TEXT,
    "state_province" TEXT,
    "zip_postal_code" TEXT,
    "country" TEXT,

    CONSTRAINT "additional_holder_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_holder_phones" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "phone_type" "PhoneType" NOT NULL,
    "phone_number" TEXT,

    CONSTRAINT "additional_holder_phones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_holder_government_ids" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "type" TEXT,
    "id_number" TEXT,
    "country_of_issue" TEXT,
    "date_of_issue" TIMESTAMP(3),
    "date_of_expiration" TIMESTAMP(3),

    CONSTRAINT "additional_holder_government_ids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_holder_investment_knowledge" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "investment_type" "InvestmentType" NOT NULL,
    "knowledge_level" "InvestmentKnowledgeLevel",
    "since_year" INTEGER,

    CONSTRAINT "additional_holder_investment_knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "additional_holder_profiles_user_id_idx" ON "additional_holder_profiles"("user_id");

-- CreateIndex
CREATE INDEX "additional_holder_profiles_status_idx" ON "additional_holder_profiles"("status");

-- CreateIndex
CREATE INDEX "additional_holder_profiles_created_at_idx" ON "additional_holder_profiles"("created_at");

-- CreateIndex
CREATE INDEX "additional_holder_addresses_profile_id_idx" ON "additional_holder_addresses"("profile_id");

-- CreateIndex
CREATE INDEX "additional_holder_addresses_address_type_idx" ON "additional_holder_addresses"("address_type");

-- CreateIndex
CREATE INDEX "additional_holder_phones_profile_id_idx" ON "additional_holder_phones"("profile_id");

-- CreateIndex
CREATE INDEX "additional_holder_phones_phone_type_idx" ON "additional_holder_phones"("phone_type");

-- CreateIndex
CREATE INDEX "additional_holder_government_ids_profile_id_idx" ON "additional_holder_government_ids"("profile_id");

-- CreateIndex
CREATE INDEX "additional_holder_investment_knowledge_profile_id_idx" ON "additional_holder_investment_knowledge"("profile_id");

-- CreateIndex
CREATE INDEX "additional_holder_investment_knowledge_investment_type_idx" ON "additional_holder_investment_knowledge"("investment_type");

-- CreateIndex
CREATE UNIQUE INDEX "additional_holder_investment_knowledge_profile_id_investmen_key" ON "additional_holder_investment_knowledge"("profile_id", "investment_type");

-- AddForeignKey
ALTER TABLE "additional_holder_profiles" ADD CONSTRAINT "additional_holder_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_holder_addresses" ADD CONSTRAINT "additional_holder_addresses_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "additional_holder_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_holder_phones" ADD CONSTRAINT "additional_holder_phones_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "additional_holder_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_holder_government_ids" ADD CONSTRAINT "additional_holder_government_ids_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "additional_holder_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_holder_investment_knowledge" ADD CONSTRAINT "additional_holder_investment_knowledge_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "additional_holder_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
