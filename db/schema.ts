import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  source: text("source").notNull(),
  consentVersion: text("consent_version")
    .notNull()
    .default("launch-updates-v1"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const contactMessages = sqliteTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const giftClaims = sqliteTable("gift_claims", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  redeemedAt: text("redeemed_at"),
  redeemedOrderId: text("redeemed_order_id").unique(),
});

export const checkoutOrders = sqliteTable("checkout_orders", {
  id: text("id").primaryKey(),
  ownerHash: text("owner_hash").notNull(),
  stripeSessionId: text("stripe_session_id").unique(),
  status: text("status").notNull().default("draft"),
  cart: text("cart").notNull(),
  version: integer("version").notNull().default(0),
  amount: integer("amount").notNull(),
  lockId: text("lock_id"),
  lockUntil: integer("lock_until").notNull().default(0),
  email: text("email"),
  phone: text("phone"),
  shippingDetails: text("shipping_details"),
  paymentIntentId: text("payment_intent_id"),
  giftQuantity: integer("gift_quantity").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  paidAt: text("paid_at"),
});

export const checkoutEvents = sqliteTable("checkout_events", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  type: text("type").notNull(),
  processed: integer("processed").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
