import "./globals.css";

export const metadata = {
  title: "Fantasy Madness",
  description: "March Madness Fantasy Basketball",
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
