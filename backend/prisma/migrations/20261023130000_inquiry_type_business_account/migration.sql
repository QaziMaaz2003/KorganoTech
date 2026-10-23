-- "Request a business account" submissions use their own inquiry type. The value is added in
-- its own migration because PostgreSQL cannot use a new enum value in the transaction that adds it.
ALTER TYPE "InquiryType" ADD VALUE 'BUSINESS_ACCOUNT';
