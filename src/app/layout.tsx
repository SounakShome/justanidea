import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StockMaster - Inventory Management System',
  description: 'Streamline your inventory management with our powerful yet easy-to-use system. Perfect for businesses of all sizes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <SessionProvider>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
          >
            {children}
          </ThemeProvider>
        </body>
      </SessionProvider>
    </html>
  );
}