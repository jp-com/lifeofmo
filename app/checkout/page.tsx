import type { Metadata } from "next";
import Link from "next/link";
import { headers, cookies } from "next/headers";
import { isDeliveryCountry } from "../../lib/checkout-countries";
import { ArrowLeft } from "lucide-react";
import { Brand } from "../../components/brand";
import CheckoutPreview from "./checkout-preview";
import styles from "./checkout.module.css";

export const metadata: Metadata = {
  title: "Your pre-order — Life of Mo",
  description: "Pre-order Ella’s Night Flight, the first Life of Mo story.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const saved = (await cookies()).get("lom_delivery_country")?.value;
  const detected = (await headers()).get("x-vercel-ip-country");
  const initialCountry = isDeliveryCountry(saved) ? saved : isDeliveryCountry(detected) ? detected : "GB";
  return (
    <div className={styles.page}>
      <a className="skip-link" href="#main">Skip to checkout</a>
      <header className={styles.header}>
        <Link href="/" className={styles.back} aria-label="Back to the book"><ArrowLeft size={17} aria-hidden="true" /><span>Back to the book</span></Link>
        <Link href="/" aria-label="Life of Mo home" className={styles.logo}><Brand /></Link>
      </header>
      <main id="main"><CheckoutPreview initialCountry={initialCountry} /></main>
      <footer className={styles.footer}>
        <span>Stories that hug back.</span>
        <Link href="/contact">A question about your order?</Link>
      </footer>
    </div>
  );
}
