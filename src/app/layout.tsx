import Footer from '@/app/_components/footer';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import Header from '@/app/_components/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: `Wei Yuan's Blog`,
  description: `Wei Yuan's Blog - my musings about software development and other interesting topics.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000" />
      </head>
      <body className={inter.className}>
        <Header />
        <div className="min-h-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
