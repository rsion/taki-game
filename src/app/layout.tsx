import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "טאקי - Taki Online",
  description: "Play Taki card game online with friends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="ltr">
      <body className="min-h-screen bg-emerald-900">{children}</body>
    </html>
  );
}
