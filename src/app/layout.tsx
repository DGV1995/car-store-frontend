import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Car Store",
  description: "Browse and filter car listings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
