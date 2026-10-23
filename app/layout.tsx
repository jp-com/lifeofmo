import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life of Mo — Ella’s Night Flight",
  description:
    "Pre-order Ella’s Night Flight for £20. A gentle woodland adventure about courage and friendship for ages 4–8, with three activities to enjoy together.",
  metadataBase: new URL(
    "https://life-of-mo-woodland-stories.abuzzluck129.chatgpt.site",
  ),
  openGraph: {
    title: "Life of Mo — Stories that hug back",
    description:
      "Small adventures. Big feelings. Meet Mo and his friends in Ella’s Night Flight.",
    images: ["/assets/hero-v2.webp"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
