'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ToolIcon } from '@/components/app/tool-icons';
import ThemeToggle from '@/components/layout/header/theme-toggle';
import { cn } from '@/lib/utils';

interface OverviewLite {
  credits: number;
  demoMode: boolean;
  user?: { name: string; email: string } | null;
}

export const CREDITS_CHANGED_EVENT = 'asiabd:credits-changed';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [overview, setOverview] = useState<OverviewLite | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/overview', { cache: 'no-store' });
        if (res.status === 401) {
          window.location.href = '/signin';
          return;
        }
        if (!res.ok) return;
        const data = (await res.json()) as OverviewLite;
        if (active) setOverview(data);
      } catch {
        /* offline - keep last known value */
      }
    };
    load();
    const onChange = () => void load();
    window.addEventListener(CREDITS_CHANGED_EVENT, onChange);
    return () => {
      active = false;
      window.removeEventListener(CREDITS_CHANGED_EVENT, onChange);
    };
  }, []);

  const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/tools', label: 'Tools', icon: 'spark' },
    { href: '/library', label: 'Library', icon: 'library' },
  ];

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } finally {
      window.location.href = '/';
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#101828]">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-dark-primary/95">
        <div className="wrapper flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2" aria-label="AsiaBD Commerce AI home">
              <Image
                src="/images/logo-black.svg"
                alt="AsiaBD Commerce AI"
                width={170}
                height={30}
                className="block h-7 w-auto dark:hidden"
              />
              <Image
                src="/images/logo-white.svg"
                alt="AsiaBD Commerce AI"
                width={170}
                height={30}
                className="hidden h-7 w-auto dark:block"
              />
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex" aria-label="App navigation">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-primary-500 dark:text-gray-400',
                    active &&
                      'bg-gray-100 text-gray-800 dark:bg-white/5 dark:text-white/90'
                  )}
                >
                  <ToolIcon name={item.icon} className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            {overview?.demoMode && (
              <span className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600 sm:inline-block dark:bg-amber-500/10 dark:text-amber-400">
                Demo mode
              </span>
            )}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-sm dark:border-gray-700"
              title="Your credit balance"
            >
              <span
                key={overview ? overview.credits : 'pending'}
                className="anim-pop font-semibold text-gray-800 dark:text-white/90"
              >
                {overview ? overview.credits : '-'}
              </span>
              <span className="text-gray-500 dark:text-gray-400">credits</span>
            </Link>
            {overview?.user && (
              <span className="hidden max-w-[170px] truncate text-xs text-gray-500 dark:text-gray-400 lg:block">
                {overview.user.email}
              </span>
            )}
            <button
              type="button"
              onClick={signOut}
              title="Sign out"
              aria-label="Sign out"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F2F4F7] text-[#667085] transition hover:bg-gray-100 hover:text-gray-800 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white/90"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
            <ThemeToggle />
          </div>
        </div>

        <nav
          className="flex items-center gap-1 border-t border-gray-100 px-4 pb-2 pt-1 md:hidden dark:border-gray-800"
          aria-label="App navigation mobile"
        >
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400',
                  active &&
                    'bg-gray-100 text-gray-800 dark:bg-white/5 dark:text-white/90'
                )}
              >
                <ToolIcon name={item.icon} className="size-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
