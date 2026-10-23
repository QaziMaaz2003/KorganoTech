-- Card payments replace Cash on Delivery. COD stays in the enum so orders placed
-- before this change remain valid. The new value is added in its own migration
-- because PostgreSQL cannot use an enum value in the transaction that adds it.
ALTER TYPE "PaymentMethod" ADD VALUE 'CARD';
