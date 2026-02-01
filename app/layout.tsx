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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <header className="sticky top-0 z-50 border-b bg-primary text-primary-foreground shadow-md">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-lg font-black tracking-tight transition-transform group-hover:scale-105">
                TP
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight">TurnierPlaner</span>
                <span className="ml-2 hidden text-xs font-medium opacity-70 sm:inline">
                  Turnierverwaltung
                </span>
              </div>
            </Link>
            <Link
              href="/turnier/neu"
              className="rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold backdrop-blur transition-all hover:bg-white/25 hover:shadow-lg"
            >
              + Neues Turnier
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">{children}</main>
        <footer className="border-t mt-auto">
          <div className="container mx-auto px-6 py-4 text-center text-sm text-muted-foreground">
            TurnierPlaner &middot; Turnierverwaltung
          </div>
        </footer>
      </body>
    </html>
  );
}
