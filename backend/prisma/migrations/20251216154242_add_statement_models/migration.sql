-- CreateEnum
CREATE TYPE "StatementRowCategory" AS ENUM ('liquid_non_qualified', 'liabilities', 'net_worth', 'illiquid_non_qualified', 'liquid_qualified', 'income_summary', 'illiquid_qualified');

-- CreateEnum
CREATE TYPE "StatementSignatureType" AS ENUM ('account_owner', 'joint_account_owner', 'financial_professional', 'registered_principal');

-- CreateTable
CREATE TABLE "statement_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'draft',
    "last_completed_page" INTEGER NOT NULL DEFAULT 0,
    "page_completion_status" JSONB,
    "rr_name" TEXT,
    "rr_no" TEXT,
    "customer_names" TEXT,
    "notes_page1" TEXT,
    "additional_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),

    CONSTRAINT "statement_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statement_financial_rows" (
    "id" TEXT NOT NULL,
    "statement_id" TEXT NOT NULL,
    "category" "StatementRowCategory" NOT NULL,
    "row_key" TEXT NOT NULL,
    "label" TEXT,
    "value" DECIMAL(19,2) NOT NULL,
    "is_total" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "statement_financial_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statement_signatures" (
    "id" TEXT NOT NULL,
    "statement_id" TEXT NOT NULL,
    "signature_type" "StatementSignatureType" NOT NULL,
    "signature_data" TEXT NOT NULL,
    "printed_name" TEXT NOT NULL,
    "signature_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statement_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "statement_profiles_user_id_idx" ON "statement_profiles"("user_id");

-- CreateIndex
CREATE INDEX "statement_profiles_status_idx" ON "statement_profiles"("status");

-- CreateIndex
CREATE INDEX "statement_profiles_created_at_idx" ON "statement_profiles"("created_at");

-- CreateIndex
CREATE INDEX "statement_financial_rows_statement_id_idx" ON "statement_financial_rows"("statement_id");

-- CreateIndex
CREATE INDEX "statement_financial_rows_category_idx" ON "statement_financial_rows"("category");

-- CreateIndex
CREATE INDEX "statement_signatures_statement_id_idx" ON "statement_signatures"("statement_id");

-- CreateIndex
CREATE INDEX "statement_signatures_signature_type_idx" ON "statement_signatures"("signature_type");

-- CreateIndex
CREATE UNIQUE INDEX "statement_signatures_statement_id_signature_type_key" ON "statement_signatures"("statement_id", "signature_type");

-- AddForeignKey
ALTER TABLE "statement_profiles" ADD CONSTRAINT "statement_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statement_financial_rows" ADD CONSTRAINT "statement_financial_rows_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "statement_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statement_signatures" ADD CONSTRAINT "statement_signatures_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "statement_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
