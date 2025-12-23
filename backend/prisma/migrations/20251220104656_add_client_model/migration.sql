-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "investor_profiles" ADD COLUMN "client_id" TEXT;

-- AlterTable
ALTER TABLE "statement_profiles" ADD COLUMN "client_id" TEXT;

-- AlterTable
ALTER TABLE "additional_holder_profiles" ADD COLUMN "client_id" TEXT;

-- AlterTable
ALTER TABLE "alt_order_profiles" ADD COLUMN "client_id" TEXT;

-- AlterTable
ALTER TABLE "accreditation_profiles" ADD COLUMN "client_id" TEXT;

-- AlterTable
ALTER TABLE "investor_profiles" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "statement_profiles" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "additional_holder_profiles" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "alt_order_profiles" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "accreditation_profiles" ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "clients_created_by_idx" ON "clients"("created_by");

-- CreateIndex
CREATE INDEX "clients_created_at_idx" ON "clients"("created_at");

-- CreateIndex
CREATE INDEX "investor_profiles_client_id_idx" ON "investor_profiles"("client_id");

-- CreateIndex
CREATE INDEX "statement_profiles_client_id_idx" ON "statement_profiles"("client_id");

-- CreateIndex
CREATE INDEX "additional_holder_profiles_client_id_idx" ON "additional_holder_profiles"("client_id");

-- CreateIndex
CREATE INDEX "alt_order_profiles_client_id_idx" ON "alt_order_profiles"("client_id");

-- CreateIndex
CREATE INDEX "accreditation_profiles_client_id_idx" ON "accreditation_profiles"("client_id");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investor_profiles" ADD CONSTRAINT "investor_profiles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statement_profiles" ADD CONSTRAINT "statement_profiles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_holder_profiles" ADD CONSTRAINT "additional_holder_profiles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alt_order_profiles" ADD CONSTRAINT "alt_order_profiles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accreditation_profiles" ADD CONSTRAINT "accreditation_profiles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;


