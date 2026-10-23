-- Business accounts: companies with a saved filter list they can reorder from.

-- Business-account requests carry an address and an optional uploaded filter list.
ALTER TABLE "Inquiry" ADD COLUMN     "address" TEXT,
ADD COLUMN     "attachmentName" TEXT,
ADD COLUMN     "attachmentUrl" TEXT;

CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "inquiryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessFilter" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "label" TEXT,
    "variantId" TEXT,
    "customKey" TEXT,
    "customSpec" JSONB,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessFilter_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "User" ADD COLUMN "businessId" TEXT;

CREATE UNIQUE INDEX "Business_inquiryId_key" ON "Business"("inquiryId");
CREATE INDEX "BusinessFilter_businessId_sortOrder_idx" ON "BusinessFilter"("businessId", "sortOrder");
CREATE UNIQUE INDEX "BusinessFilter_businessId_variantId_key" ON "BusinessFilter"("businessId", "variantId");
CREATE UNIQUE INDEX "BusinessFilter_businessId_customKey_key" ON "BusinessFilter"("businessId", "customKey");
CREATE INDEX "User_businessId_idx" ON "User"("businessId");

ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BusinessFilter" ADD CONSTRAINT "BusinessFilter_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessFilter" ADD CONSTRAINT "BusinessFilter_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Same lock-down as every other table: Supabase's REST API must not reach these.
ALTER TABLE "Business" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessFilter" ENABLE ROW LEVEL SECURITY;
