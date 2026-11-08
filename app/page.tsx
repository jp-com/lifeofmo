import type { Metadata } from "next";
import HomeContent from "./home-content";
import { bookStructuredData } from "../lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookStructuredData).replace(/</g, "\\u003c") }} />
    <HomeContent />
  </>;
}
