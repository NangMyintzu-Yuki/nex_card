-- Step 1: Migrate existing payment tier data
UPDATE `payments` SET `tier` = 'NFC_QR' WHERE `tier` IN ('NFC_CARD', 'PHYSICAL_CARD');

-- Step 2: Alter enum to remove old values
ALTER TABLE `payments` MODIFY `tier` ENUM('QR_ONLY', 'NFC_QR') NOT NULL;

-- Step 3: Drop old priceNfcQr column from templates
ALTER TABLE `templates` DROP COLUMN `priceNfcQr`;

-- Step 4: Rename priceNfcCard -> priceNfcQr
ALTER TABLE `templates` CHANGE COLUMN `priceNfcCard` `priceNfcQr` DOUBLE NULL;
