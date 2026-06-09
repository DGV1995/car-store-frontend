import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Car Store",
  description: "Browse and filter available cars",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-zinc-50 font-sans antialiased">
        <Sidebar />

        {/* Main content area — offset to the right on large screens to accommodate the sidebar */}
        <div className="lg:pl-64">
          {/* Spacer for the fixed mobile hamburger button so content isn't hidden behind it */}
          <div className="h-16 lg:hidden" />
          {children}
        </div>
      </body>
    </html>
  );
}
