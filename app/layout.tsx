import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vinnie Tooling',
  description: 'A collection of useful development tools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Developer Tooling Suite</h1>
            <p className="text-gray-600 dark:text-gray-300">Simple tools to make your workflow faster</p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}