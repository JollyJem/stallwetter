import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";

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
    <html lang="de">
      <body className="antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
