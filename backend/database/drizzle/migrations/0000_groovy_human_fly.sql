CREATE TABLE `AllowedRefreshTokens` (
	`hash` varchar(64) NOT NULL,
	`user` varchar(64) NOT NULL,
	`current` text NOT NULL,
	`previous` text,
	CONSTRAINT `AllowedRefreshTokens_hash` PRIMARY KEY(`hash`),
	CONSTRAINT `AllowedRefreshTokens_hash_unique` UNIQUE(`hash`)
);
--> statement-breakpoint
CREATE TABLE `Card` (
	`hash` varchar(64) NOT NULL,
	`created` datetime NOT NULL,
	`set` varchar(36),
	CONSTRAINT `Card_hash` PRIMARY KEY(`hash`),
	CONSTRAINT `Card_hash_unique` UNIQUE(`hash`)
);
--> statement-breakpoint
CREATE TABLE `CardVersion` (
	`id` varchar(36) NOT NULL,
	`card` varchar(64) NOT NULL,
	`created` datetime NOT NULL,
	`lnurlP` varchar(36),
	`lnurlW` varchar(36),
	`textForWithdraw` text NOT NULL,
	`noteForStatusPage` text NOT NULL,
	`sharedFunding` boolean NOT NULL,
	`landingPageViewed` datetime,
	CONSTRAINT `CardVersion_id` PRIMARY KEY(`id`),
	CONSTRAINT `CardVersion_id_unique` UNIQUE(`id`),
	CONSTRAINT `CardVersion_lnurlP_unique` UNIQUE(`lnurlP`)
);
--> statement-breakpoint
CREATE TABLE `CardVersionHasInvoice` (
	`cardVersion` varchar(36) NOT NULL,
	`invoice` varchar(64) NOT NULL,
	CONSTRAINT `CardVersionHasInvoice_cardVersion_invoice_pk` PRIMARY KEY(`cardVersion`,`invoice`)
);
--> statement-breakpoint
CREATE TABLE `Image` (
	`id` varchar(36) NOT NULL,
	`type` enum('svg','png') NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL,
	CONSTRAINT `Image_id` PRIMARY KEY(`id`),
	CONSTRAINT `Image_id_unique` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `Invoice` (
	`amount` int NOT NULL,
	`paymentHash` varchar(64) NOT NULL,
	`paymentRequest` text NOT NULL,
	`created` datetime NOT NULL,
	`paid` datetime,
	`expiresAt` datetime NOT NULL,
	`extra` text NOT NULL,
	CONSTRAINT `Invoice_paymentHash` PRIMARY KEY(`paymentHash`),
	CONSTRAINT `Invoice_paymentHash_unique` UNIQUE(`paymentHash`)
);
--> statement-breakpoint
CREATE TABLE `LandingPage` (
	`id` varchar(36) NOT NULL,
	`type` enum('core','external') NOT NULL,
	`name` text NOT NULL,
	`url` text,
	CONSTRAINT `LandingPage_id` PRIMARY KEY(`id`),
	CONSTRAINT `LandingPage_id_unique` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `LnurlP` (
	`lnbitsId` varchar(36) NOT NULL,
	`created` datetime NOT NULL,
	`expiresAt` datetime,
	`finished` datetime,
	CONSTRAINT `LnurlP_lnbitsId` PRIMARY KEY(`lnbitsId`),
	CONSTRAINT `LnurlP_lnbitsId_unique` UNIQUE(`lnbitsId`)
);
--> statement-breakpoint
CREATE TABLE `LnurlW` (
	`lnbitsId` varchar(36) NOT NULL,
	`created` datetime NOT NULL,
	`expiresAt` datetime,
	`withdrawn` datetime,
	CONSTRAINT `LnurlW_lnbitsId` PRIMARY KEY(`lnbitsId`),
	CONSTRAINT `LnurlW_lnbitsId_unique` UNIQUE(`lnbitsId`)
);
--> statement-breakpoint
CREATE TABLE `Profile` (
	`user` varchar(64) NOT NULL,
	`accountName` text NOT NULL,
	`displayName` text NOT NULL,
	`email` text NOT NULL,
	CONSTRAINT `Profile_user` PRIMARY KEY(`user`),
	CONSTRAINT `Profile_user_unique` UNIQUE(`user`)
);
--> statement-breakpoint
CREATE TABLE `Set` (
	`id` varchar(36) NOT NULL,
	`created` datetime NOT NULL,
	`changed` datetime NOT NULL,
	CONSTRAINT `Set_id` PRIMARY KEY(`id`),
	CONSTRAINT `Set_id_unique` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `SetSettings` (
	`set` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`numberOfCards` int NOT NULL,
	`cardHeadline` text NOT NULL,
	`cardCopytext` text NOT NULL,
	`image` varchar(36) NOT NULL,
	`landingPage` varchar(36) NOT NULL,
	CONSTRAINT `SetSettings_set` PRIMARY KEY(`set`),
	CONSTRAINT `SetSettings_set_unique` UNIQUE(`set`)
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` varchar(64) NOT NULL,
	`lnurlAuthKey` varchar(128) NOT NULL,
	`created` datetime NOT NULL,
	`permissions` json NOT NULL,
	CONSTRAINT `User_id` PRIMARY KEY(`id`),
	CONSTRAINT `User_id_unique` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `UserCanUseImage` (
	`user` varchar(64) NOT NULL,
	`image` varchar(36) NOT NULL,
	`canEdit` boolean NOT NULL DEFAULT false,
	CONSTRAINT `UserCanUseImage_user_image_pk` PRIMARY KEY(`user`,`image`)
);
--> statement-breakpoint
CREATE TABLE `UserCanUseLandingPage` (
	`user` varchar(64) NOT NULL,
	`landingPage` varchar(36) NOT NULL,
	`canEdit` boolean NOT NULL DEFAULT false,
	CONSTRAINT `UserCanUseLandingPage_user_landingPage_pk` PRIMARY KEY(`user`,`landingPage`)
);
--> statement-breakpoint
CREATE TABLE `UserCanUseSet` (
	`user` varchar(64) NOT NULL,
	`set` varchar(36) NOT NULL,
	`canEdit` boolean NOT NULL DEFAULT false,
	CONSTRAINT `UserCanUseSet_user_set_pk` PRIMARY KEY(`user`,`set`)
);
--> statement-breakpoint
CREATE INDEX `userIndex` ON `AllowedRefreshTokens` (`user`);--> statement-breakpoint
ALTER TABLE `AllowedRefreshTokens` ADD CONSTRAINT `AllowedRefreshTokens_user_User_id_fk` FOREIGN KEY (`user`) REFERENCES `User`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Card` ADD CONSTRAINT `Card_set_Set_id_fk` FOREIGN KEY (`set`) REFERENCES `Set`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `CardVersion` ADD CONSTRAINT `CardVersion_card_Card_hash_fk` FOREIGN KEY (`card`) REFERENCES `Card`(`hash`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `CardVersion` ADD CONSTRAINT `CardVersion_lnurlP_LnurlP_lnbitsId_fk` FOREIGN KEY (`lnurlP`) REFERENCES `LnurlP`(`lnbitsId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `CardVersion` ADD CONSTRAINT `CardVersion_lnurlW_LnurlW_lnbitsId_fk` FOREIGN KEY (`lnurlW`) REFERENCES `LnurlW`(`lnbitsId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `CardVersionHasInvoice` ADD CONSTRAINT `CardVersionHasInvoice_cardVersion_CardVersion_id_fk` FOREIGN KEY (`cardVersion`) REFERENCES `CardVersion`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `CardVersionHasInvoice` ADD CONSTRAINT `CardVersionHasInvoice_invoice_Invoice_paymentHash_fk` FOREIGN KEY (`invoice`) REFERENCES `Invoice`(`paymentHash`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_user_User_id_fk` FOREIGN KEY (`user`) REFERENCES `User`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `SetSettings` ADD CONSTRAINT `SetSettings_set_Set_id_fk` FOREIGN KEY (`set`) REFERENCES `Set`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `SetSettings` ADD CONSTRAINT `SetSettings_image_Image_id_fk` FOREIGN KEY (`image`) REFERENCES `Image`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `SetSettings` ADD CONSTRAINT `SetSettings_landingPage_LandingPage_id_fk` FOREIGN KEY (`landingPage`) REFERENCES `LandingPage`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `UserCanUseImage` ADD CONSTRAINT `UserCanUseImage_user_User_id_fk` FOREIGN KEY (`user`) REFERENCES `User`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `UserCanUseImage` ADD CONSTRAINT `UserCanUseImage_image_Image_id_fk` FOREIGN KEY (`image`) REFERENCES `Image`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `UserCanUseLandingPage` ADD CONSTRAINT `UserCanUseLandingPage_user_User_id_fk` FOREIGN KEY (`user`) REFERENCES `User`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `UserCanUseLandingPage` ADD CONSTRAINT `UserCanUseLandingPage_landingPage_LandingPage_id_fk` FOREIGN KEY (`landingPage`) REFERENCES `LandingPage`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `UserCanUseSet` ADD CONSTRAINT `UserCanUseSet_user_User_id_fk` FOREIGN KEY (`user`) REFERENCES `User`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `UserCanUseSet` ADD CONSTRAINT `UserCanUseSet_set_Set_id_fk` FOREIGN KEY (`set`) REFERENCES `Set`(`id`) ON DELETE no action ON UPDATE no action;