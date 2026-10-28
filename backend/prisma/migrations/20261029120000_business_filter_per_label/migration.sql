-- A business can list the same size once per place it is used (for example one row per school
-- building), so the label becomes part of the uniqueness. The application also rejects an exact
-- duplicate (same size and same label), including when the label is empty.
DROP INDEX "BusinessFilter_businessId_variantId_key";
DROP INDEX "BusinessFilter_businessId_customKey_key";
CREATE UNIQUE INDEX "BusinessFilter_businessId_variantId_label_key" ON "BusinessFilter"("businessId", "variantId", "label");
CREATE UNIQUE INDEX "BusinessFilter_businessId_customKey_label_key" ON "BusinessFilter"("businessId", "customKey", "label");
