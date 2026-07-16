-- prisma/migrations/0002_rename_price_physical_to_nfcqr.sql
-- Rename Template.pricePhysical -> Template.priceNfcQr to match the new
-- "NFC + QR" plan tier (data-preserving column rename).
--
-- NOTE: The price columns were previously synced to the database via
-- `prisma db push` and are NOT part of migration 0001. Applying this with
-- `prisma migrate deploy` is safe because it only renames the column.
-- Do NOT run `prisma db push` after this change — db push would DROP and
-- re-CREATE the column (losing existing price data).

ALTER TABLE `templates`
  CHANGE COLUMN `pricePhysical` `priceNfcQr` FLOAT NULL;
