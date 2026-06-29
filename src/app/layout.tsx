import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Car Store',
  description: 'Browse and manage cars in our store',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
