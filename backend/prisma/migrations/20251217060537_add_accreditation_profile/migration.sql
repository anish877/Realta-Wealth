-- CreateTable
CREATE TABLE "accreditation_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'draft',
    "last_completed_page" INTEGER NOT NULL DEFAULT 0,
    "page_completion_status" JSONB,
    "rr_name" TEXT,
    "rr_no" TEXT,
    "customer_names" TEXT,
    "has_joint_owner" BOOLEAN NOT NULL DEFAULT false,
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),

    CONSTRAINT "accreditation_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accreditation_profiles_user_id_idx" ON "accreditation_profiles"("user_id");

-- CreateIndex
CREATE INDEX "accreditation_profiles_status_idx" ON "accreditation_profiles"("status");

-- CreateIndex
CREATE INDEX "accreditation_profiles_created_at_idx" ON "accreditation_profiles"("created_at");

-- AddForeignKey
ALTER TABLE "accreditation_profiles" ADD CONSTRAINT "accreditation_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
