declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    CHECKOUT_MODE?: "disabled" | "sandbox" | "live";
    NEXT_BOOK_POSTAGE?: "pending" | "included";
    STRIPE_SECRET_KEY?: string;
    STRIPE_PUBLISHABLE_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
  }
}
