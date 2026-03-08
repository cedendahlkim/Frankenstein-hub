import { UserProvider } from '@auth0/nextjs-auth0/client';
import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Frankenstein AI - Multi-Agent Authorization Hub',
  description:
    'Zero Trust authorization layer for multi-agent AI ecosystems powered by Auth0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <UserProvider>
          <Navigation />
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
