-- Phase C: analytics, NFC fulfillment, payment method, wedding RSVP/guestbook, admin 2FA

ALTER TABLE `users`
  ADD COLUMN `totpSecret` VARCHAR(64) NULL,
  ADD COLUMN `totpEnabled` BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE `user_profiles`
  ADD COLUMN `nfcFulfillment` ENUM('NOT_ORDERED', 'PENDING_WRITE', 'PROGRAMMED', 'SHIPPED') NOT NULL DEFAULT 'NOT_ORDERED';

CREATE INDEX `user_profiles_nfcFulfillment_idx` ON `user_profiles`(`nfcFulfillment`);

ALTER TABLE `payments`
  ADD COLUMN `method` ENUM('KBZPay', 'WavePay', 'AYAPay', 'CBPay', 'OTHER') NOT NULL DEFAULT 'KBZPay',
  ADD COLUMN `transactionRef` VARCHAR(120) NULL;

CREATE INDEX `payments_method_idx` ON `payments`(`method`);

CREATE TABLE `profile_analytics_events` (
    `id` VARCHAR(191) NOT NULL,
    `profileId` VARCHAR(191) NOT NULL,
    `type` ENUM('VIEW', 'QR_SCAN', 'NFC_TAP') NOT NULL,
    `referrer` VARCHAR(500) NULL,
    `userAgent` VARCHAR(500) NULL,
    `device` VARCHAR(40) NULL,
    `day` VARCHAR(10) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `profile_analytics_events_profileId_type_day_idx`(`profileId`, `type`, `day`),
    INDEX `profile_analytics_events_profileId_createdAt_idx`(`profileId`, `createdAt`),
    INDEX `profile_analytics_events_day_idx`(`day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `profile_analytics_events`
  ADD CONSTRAINT `profile_analytics_events_profileId_fkey`
  FOREIGN KEY (`profileId`) REFERENCES `user_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `wedding_rsvps` (
    `id` VARCHAR(191) NOT NULL,
    `profileId` VARCHAR(191) NOT NULL,
    `guestName` VARCHAR(120) NOT NULL,
    `email` VARCHAR(160) NULL,
    `phone` VARCHAR(40) NULL,
    `attending` BOOLEAN NOT NULL DEFAULT true,
    `guestCount` INTEGER NOT NULL DEFAULT 1,
    `mealNote` VARCHAR(240) NULL,
    `message` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `wedding_rsvps_profileId_idx`(`profileId`),
    INDEX `wedding_rsvps_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `wedding_rsvps`
  ADD CONSTRAINT `wedding_rsvps_profileId_fkey`
  FOREIGN KEY (`profileId`) REFERENCES `user_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `wedding_guestbook` (
    `id` VARCHAR(191) NOT NULL,
    `profileId` VARCHAR(191) NOT NULL,
    `author` VARCHAR(120) NOT NULL,
    `message` VARCHAR(1000) NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `wedding_guestbook_profileId_idx`(`profileId`),
    INDEX `wedding_guestbook_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `wedding_guestbook`
  ADD CONSTRAINT `wedding_guestbook_profileId_fkey`
  FOREIGN KEY (`profileId`) REFERENCES `user_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
