import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TurnierPlaner",
  description: "Fußball-Turnierverwaltung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b">
          <div className="container mx-auto flex items-center justify-between p-4">
            <Link href="/" className="text-xl font-bold">
              TurnierPlaner
            </Link>
            <Link
              href="/turnier/neu"
              className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
            >
              Neues Turnier
            </Link>
          </div>
        </header>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
