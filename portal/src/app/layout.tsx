import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import Providers from "../components/Providers";
import EnhancedBackground from "../components/EnhancedBackground";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { prisma } from "@/lib/prisma";

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
  let avatarUrl: string | null = null;
  let displayName: string | null = null;
  if (session?.user?.id) {
    try {
      const profile = await prisma.profile.findUnique({ where: { userId: session.user.id }, select: { avatarUrl: true } });
      avatarUrl = profile?.avatarUrl ?? null;
    } catch {}
    displayName = (session.user.username || session.user.name || null) as string | null;
  }
  return (
    <html lang="en" data-theme="dark" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]`}>
        <EnhancedBackground />
        <Providers session={session}>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-[var(--color-surface)] text-[var(--color-text-primary)] px-3 py-2 rounded-md border border-[var(--color-border)]">Skip to content</a>
          <header className="px-6 md:px-8 xl:px-12 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-40 backdrop-blur">
            <div className="max-w-screen-2xl mx-auto w-full flex items-center gap-6">
              <Link href="/" className="font-semibold text-lg text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors">
                ECE NTUA Portal
              </Link>
              <nav className="flex-1">
                <ul className="flex flex-wrap gap-5 text-sm font-medium text-[var(--color-text-secondary)]">
                  <li><Link className="hover:text-[var(--color-text-primary)]" href="/">Home</Link></li>
                  <li><Link className="hover:text-[var(--color-text-primary)]" href="/about">About</Link></li>
                  <li><Link className="hover:text-[var(--color-text-primary)]" href="/departments">Departments</Link></li>
                  <li><Link className="hover:text-[var(--color-text-primary)]" href="/courses">Courses</Link></li>
                  <li><Link className="hover:text-[var(--color-text-primary)]" href="/research">Research</Link></li>
                  <li><Link className="hover:text-[var(--color-text-primary)]" href="/blog">Blog</Link></li>
                  <li><Link className="hover:text-[var(--color-text-primary)]" href="/announcements">Announcements</Link></li>
                  <li><Link className="hover:text-[var(--color-text-primary)]" href="/resources">Resources</Link></li>
                  <li><Link className="hover:text-[var(--color-text-primary)]" href="/search">Search</Link></li>
                  <li><Link className="hover:text-[var(--color-text-primary)]" href="/profile">Profile</Link></li>
                </ul>
              </nav>
              <div className="flex items-center gap-4">
                {session?.user ? (
                  <Link href="/profile" className="flex items-center gap-2 text-xs px-2 py-1 rounded-md bg-[var(--color-surface-alt)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors" title="My profile">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="Avatar" width={24} height={24} className="h-6 w-6 rounded-full object-cover border border-[var(--color-border)] bg-[var(--color-surface)]" />
                    ) : (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent-fade)] text-[var(--color-accent)] font-semibold">
                        {displayName?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                    <span className="max-w-[10ch] truncate text-[var(--color-text-primary)]">{displayName || 'Profile'}</span>
                  </Link>
                ) : (
                  <Link href="/auth/signin" className="btn-primary text-xs">Sign in</Link>
                )}
              </div>
            </div>
          </header>
          <main id="main" className="px-6 md:px-8 xl:px-12 py-10 max-w-screen-2xl mx-auto w-full">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
