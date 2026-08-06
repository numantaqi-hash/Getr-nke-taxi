import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GetränkeTaxi Greifswald – Backend",
  description:
    "Next.js-App mit Supabase-Backend für GetränkeTaxi Greifswald (Konzept-Prototyp).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
