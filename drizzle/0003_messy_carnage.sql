CREATE TABLE `checkout_events` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`type` text NOT NULL,
	`processed` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `checkout_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_hash` text NOT NULL,
	`stripe_session_id` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`cart` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`amount` integer NOT NULL,
	`lock_id` text,
	`lock_until` integer DEFAULT 0 NOT NULL,
	`email` text,
	`shipping_details` text,
	`payment_intent_id` text,
	`gift_quantity` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`paid_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checkout_orders_stripe_session_id_unique` ON `checkout_orders` (`stripe_session_id`);