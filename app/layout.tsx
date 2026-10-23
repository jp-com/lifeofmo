import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life of Mo — Ella’s Night Flight",
  description:
    "Stories that hug back. Discover Ella’s Night Flight, a gentle woodland adventure about courage and friendship for ages 4–8. £20. Pre-orders opening soon.",
  metadataBase: new URL(
    "https://life-of-mo-woodland-stories.abuzzluck129.chatgpt.site",
  ),
  openGraph: {
    title: "Life of Mo — Stories that hug back",
    description:
      "Small adventures. Big feelings. Meet Mo and his friends in Ella’s Night Flight.",
    images: ["/assets/book-woodland.webp"],
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
