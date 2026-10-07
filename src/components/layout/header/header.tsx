'use client';
import { CloseIcon, MenuIcon } from '@/icons/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DesktopNav from './desktop-nav';
import MainMobileNav from './main-mobile-nav';
import ThemeToggle from './theme-toggle';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white py-2 dark:border-gray-800 dark:bg-dark-primary lg:py-4">
      <div className="px-4 sm:px-6 lg:px-7">
        <div className="grid grid-cols-2 items-center lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center">
            <Link href="/" className="flex items-end gap-2" aria-label="AsiaBD Commerce AI home">
              <Image
                src="/images/logo-black.svg"
                className="block h-auto w-[170px] dark:hidden"
                alt="AsiaBD Commerce AI"
                width={180}
                height={30}
              />

              <Image
                src="/images/logo-white.svg"
                className="hidden h-auto w-[170px] dark:block"
                alt="AsiaBD Commerce AI"
                width={180}
                height={30}
              />
            </Link>
          </div>

          <DesktopNav />

          <div className="flex items-center gap-4 justify-self-end">
            <ThemeToggle />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              type="button"
              aria-label="Toggle menu"
              className="order-last inline-flex shrink-0 items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 lg:hidden"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <Link
              href="/signin"
              className="hidden text-sm font-medium text-gray-700 hover:text-primary-500 dark:text-gray-400 lg:block"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="gradient-btn button-bg btn-shine hidden h-11 items-center rounded-full px-5 py-3 text-sm text-white lg:inline-flex"
            >
              Start free
            </Link>
          </div>
        </div>
      </div>

      <MainMobileNav isOpen={mobileMenuOpen} />
    </header>
  );
}
