CREATE TABLE `gift_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`redeemed_at` text,
	`redeemed_order_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gift_claims_email_unique` ON `gift_claims` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `gift_claims_redeemed_order_id_unique` ON `gift_claims` (`redeemed_order_id`);