-- Business accounts order on invoice (Net 30): the order is recorded and invoiced manually on delivery.
-- Kept in its own migration because a new enum value cannot be used in the transaction that adds it.
ALTER TYPE "PaymentMethod" ADD VALUE 'INVOICE';
