import "./globals.css";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fantasymadness.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fantasy Madness",
    template: "%s | Fantasy Madness",
  },
  description:
    "Draft bracket slots, compete in leagues, and score big when underdogs win. Free March Madness fantasy basketball — upset picks are worth more.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/FantasyMadness_Variant2_Icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "Fantasy Madness",
    title: "Fantasy Madness — March Madness Fantasy Basketball",
    description:
      "Draft bracket slots, compete in leagues, and score big when underdogs win. Free to play — upset picks are worth more.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fantasy Madness — March Madness Fantasy Basketball",
    description:
      "Draft bracket slots, compete in leagues, and score big when underdogs win. Free to play.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
