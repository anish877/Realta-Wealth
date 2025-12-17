-- CreateTable
CREATE TABLE "alt_order_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'draft',
    "last_completed_page" INTEGER NOT NULL DEFAULT 0,
    "page_completion_status" JSONB,
    "rr_name" TEXT,
    "rr_no" TEXT,
    "customer_names" TEXT,
    "proposed_principal_amount" DECIMAL(19,2),
    "qualified_account" "YesNo",
    "qualified_account_certification_text" TEXT,
    "solicited_trade" "YesNo",
    "tax_advantage_purchase" "YesNo",
    "custodian" TEXT,
    "name_of_product" TEXT,
    "sponsor_issuer" TEXT,
    "date_of_ppm" TIMESTAMP(3),
    "date_ppm_sent" TIMESTAMP(3),
    "existing_illiquid_alt_positions" DECIMAL(19,2),
    "existing_illiquid_alt_concentration" DECIMAL(5,2),
    "existing_semi_liquid_alt_positions" DECIMAL(19,2),
    "existing_semi_liquid_alt_concentration" DECIMAL(5,2),
    "existing_tax_advantage_alt_positions" DECIMAL(19,2),
    "existing_tax_advantage_alt_concentration" DECIMAL(5,2),
    "total_net_worth" DECIMAL(19,2),
    "liquid_net_worth" DECIMAL(19,2),
    "total_concentration" DECIMAL(5,2),
    "account_owner_signature" TEXT,
    "account_owner_printed_name" TEXT,
    "account_owner_date" TIMESTAMP(3),
    "joint_account_owner_signature" TEXT,
    "joint_account_owner_printed_name" TEXT,
    "joint_account_owner_date" TIMESTAMP(3),
    "financial_professional_signature" TEXT,
    "financial_professional_printed_name" TEXT,
    "financial_professional_date" TIMESTAMP(3),
    "registered_principal_signature" TEXT,
    "registered_principal_printed_name" TEXT,
    "registered_principal_date" TIMESTAMP(3),
    "notes" TEXT,
    "reg_bi_delivery" BOOLEAN NOT NULL DEFAULT false,
    "state_registration" BOOLEAN NOT NULL DEFAULT false,
    "ai_insight" BOOLEAN NOT NULL DEFAULT false,
    "statement_of_financial_condition" BOOLEAN NOT NULL DEFAULT false,
    "suitability_received" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),

    CONSTRAINT "alt_order_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alt_order_profiles_user_id_idx" ON "alt_order_profiles"("user_id");

-- CreateIndex
CREATE INDEX "alt_order_profiles_status_idx" ON "alt_order_profiles"("status");

-- CreateIndex
CREATE INDEX "alt_order_profiles_created_at_idx" ON "alt_order_profiles"("created_at");

-- AddForeignKey
ALTER TABLE "alt_order_profiles" ADD CONSTRAINT "alt_order_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
