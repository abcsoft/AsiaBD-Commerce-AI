import { BRAND } from '@/lib/brand';
import { TOOLS } from '@/lib/tools/registry';
import { getCurrentYear } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gray-900">
      <span className="absolute left-1/2 top-0 -translate-x-1/2">
        <svg
          width="1260"
          height="457"
          viewBox="0 0 1260 457"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <g filter="url(#footerGlow)">
            <circle cx="630" cy="-173.299" r="230" fill="#2f7ef8" />
          </g>
          <defs>
            <filter
              id="footerGlow"
              x="0"
              y="-803.299"
              width="1260"
              height="1260"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur stdDeviation="200" result="effect1_foregroundBlur" />
            </filter>
          </defs>
        </svg>
      </span>

      <div className="relative z-10 py-16 xl:py-20">
        <div className="container mx-auto px-5 sm:px-7">
          <div className="grid gap-x-6 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Link href="/" className="mb-6 block" aria-label="AsiaBD Commerce AI home">
                <Image
                  src="/images/logo-white.svg"
                  alt="AsiaBD Commerce AI"
                  width={180}
                  height={30}
                />
              </Link>
              <p className="mb-6 block max-w-sm text-sm leading-6 text-gray-400">
                The AI content and listing suite for e-commerce sellers - write,
                optimize, and scale product content for Shopify, Amazon, Etsy,
                TikTok Shop, and your own store.
              </p>
              <a
                href={`mailto:${BRAND.contactEmail}`}
                className="text-sm font-medium text-gray-300 hover:text-white"
              >
                {BRAND.contactEmail}
              </a>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 gap-7 sm:grid-cols-4">
                <div>
                  <span className="mb-6 block text-sm text-gray-400">
                    Product
                  </span>
                  <nav className="flex flex-col space-y-3">
                    <Link
                      href="/dashboard"
                      className="text-sm font-normal text-gray-400 transition hover:text-white"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/tools"
                      className="text-sm font-normal text-gray-400 transition hover:text-white"
                    >
                      AI Tools
                    </Link>
                    <Link
                      href="/library"
                      className="text-sm font-normal text-gray-400 transition hover:text-white"
                    >
                      Saved Library
                    </Link>
                    <Link
                      href="/pricing"
                      className="text-sm font-normal text-gray-400 transition hover:text-white"
                    >
                      Pricing
                    </Link>
                  </nav>
                </div>

                <div>
                  <span className="mb-6 block text-sm text-gray-400">
                    Popular tools
                  </span>
                  <nav className="flex flex-col space-y-3">
                    {TOOLS.slice(0, 5).map((tool) => (
                      <Link
                        key={tool.id}
                        href={`/tools/${tool.id}`}
                        className="text-sm font-normal text-gray-400 transition hover:text-white"
                      >
                        {tool.shortName}
                      </Link>
                    ))}
                  </nav>
                </div>

                <div>
                  <span className="mb-6 block text-sm text-gray-400">
                    Company
                  </span>
                  <nav className="flex flex-col space-y-3">
                    <Link
                      href="/about"
                      className="text-sm font-normal text-gray-400 transition hover:text-white"
                    >
                      About
                    </Link>
                    <Link
                      href="/contact"
                      className="text-sm font-normal text-gray-400 transition hover:text-white"
                    >
                      Contact
                    </Link>
                    <Link
                      href="/pricing#faq"
                      className="text-sm font-normal text-gray-400 transition hover:text-white"
                    >
                      FAQ
                    </Link>
                    <Link
                      href="/contact"
                      className="text-sm font-normal text-gray-400 transition hover:text-white"
                    >
                      Support
                    </Link>
                  </nav>
                </div>

                <div>
                  <span className="mb-6 block text-sm text-gray-400">
                    Legal
                  </span>
                  <nav className="flex flex-col space-y-3">
                    <Link
                      href="/privacy"
                      className="text-sm font-normal text-gray-400 transition hover:text-white"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      href="/terms"
                      className="text-sm font-normal text-gray-400 transition hover:text-white"
                    >
                      Terms of Service
                    </Link>
                    <Link
                      href="/refund-policy"
                      className="text-sm font-normal text-gray-400 transition hover:text-white"
                    >
                      Refund Policy
                    </Link>
                    <Link
                      href="/ai-disclosure"
                      className="text-sm font-normal text-gray-400 transition hover:text-white"
                    >
                      AI Usage Disclosure
                    </Link>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container relative z-10 mx-auto px-5 sm:px-7">
          <div className="flex flex-col items-center justify-between gap-3 py-5 text-center sm:flex-row sm:text-left">
            <p className="text-sm text-gray-500">
              © {getCurrentYear()} {BRAND.name} - All Rights Reserved.
            </p>
            <p className="text-xs text-gray-600">
              Content you generate is yours. Always review AI output before
              publishing.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
