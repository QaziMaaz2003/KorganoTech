-- The agreed price per filter for a line on a business's list (set and updated by KorganoTech).
ALTER TABLE "BusinessFilter" ADD COLUMN "unitPrice" DECIMAL(10,2);
