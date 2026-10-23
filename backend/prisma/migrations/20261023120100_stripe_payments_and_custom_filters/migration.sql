-- Stripe card payments and made-to-order custom size filters.

-- Orders: default to card, track the Stripe checkout session, hold stock until it expires.
ALTER TABLE "Order" ADD COLUMN     "paymentExpiresAt" TIMESTAMP(3),
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeSessionId" TEXT,
ALTER COLUMN "paymentMethod" SET DEFAULT 'CARD';

CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");

-- Order lines: custom-size items have no catalog variant.
ALTER TABLE "OrderItem" ADD COLUMN     "customSpec" JSONB,
ADD COLUMN     "isCustom" BOOLEAN NOT NULL DEFAULT false;

-- Cart lines: a line is either a catalog variant or a custom size.
ALTER TABLE "CartItem" ADD COLUMN     "customKey" TEXT,
ADD COLUMN     "customSpec" JSONB,
ALTER COLUMN "variantId" DROP NOT NULL;

CREATE UNIQUE INDEX "CartItem_cartId_customKey_key" ON "CartItem"("cartId", "customKey");

-- Settings: the COD switch becomes the master checkout switch (value preserved),
-- and custom-filter pricing rules are stored as JSON.
ALTER TABLE "StoreSettings" RENAME COLUMN "codEnabled" TO "checkoutEnabled";
ALTER TABLE "StoreSettings" ADD COLUMN "customFilter" JSONB;

-- Drop the Cash on Delivery wording from the storefront announcement bar.
UPDATE "StoreSettings"
SET "announcement" = NULLIF(
  btrim(regexp_replace("announcement", '\s*[·|•-]?\s*Cash on Delivery( available)?', '', 'gi')),
  ''
)
WHERE "announcement" ILIKE '%cash on delivery%';
