import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ThemeToggle from "../components/ThemeToggle";
import Providers from "../components/Providers";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import SignInOut from "@/components/SignInOut";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ECE NTUA Student Portal",
  description: "Tools and resources for ECE NTUA students",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" data-theme="dark" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]`}>
        <Providers session={session}>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-[var(--color-surface)] text-[var(--color-text-primary)] px-3 py-2 rounded-md border border-[var(--color-border)]">Skip to content</a>
          <header className="flex items-center gap-6 px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-40 backdrop-blur">
            <Link href="/" className="font-semibold text-lg text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors">
              ECE NTUA Portal
            </Link>
            <nav className="flex-1">
              <ul className="flex flex-wrap gap-6 text-sm font-medium text-[var(--color-text-secondary)]">
                <li><Link className="hover:text-[var(--color-text-primary)]" href="/">Home</Link></li>
                <li><Link className="hover:text-[var(--color-text-primary)]" href="/announcements">Announcements</Link></li>
                <li><Link className="hover:text-[var(--color-text-primary)]" href="/lab-partners">Lab Partners</Link></li>
                <li><Link className="hover:text-[var(--color-text-primary)]" href="/calendar">Calendar</Link></li>
                <li><Link className="hover:text-[var(--color-text-primary)]" href="/past-papers">Past Papers</Link></li>
                <li><Link className="hover:text-[var(--color-text-primary)]" href="/network">Network</Link></li>
                <li><Link className="hover:text-[var(--color-text-primary)]" href="/profile">Profile</Link></li>
              </ul>
            </nav>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <SignInOut session={session} />
            </div>
          </header>
          <main id="main" className="px-6 py-10 max-w-5xl mx-auto w-full">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
