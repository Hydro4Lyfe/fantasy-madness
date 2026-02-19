import "./globals.css";

export const metadata = {
  title: "Fantasy Madness",
  description: "March Madness Fantasy Basketball",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/FantasyMadness_Variant2_Icon.svg", type: "image/svg+xml" },
    ],
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
