import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StallWetter — Smarter mornings for horse owners",
  description:
    "Daily blanket and grazing decisions for your horses, based on real local weather and each horse's profile.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
