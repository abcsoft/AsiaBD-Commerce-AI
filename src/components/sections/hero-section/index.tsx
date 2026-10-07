import Link from 'next/link';
import Tilt from '@/components/motion/tilt';
import MarketplaceStrip from '../marketplace-strip';
import AppPreviewMock from './app-preview-mock';
import HeroFloatChips from './hero-float-chips';
import { Subheading } from './subheading';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 dark:bg-[#171F2E]">
      {/* Atmosphere: drifting aurora orbs + fine grid */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div className="anim-orb-a absolute -top-24 left-[8%] size-[420px] rounded-full bg-[radial-gradient(circle,rgba(56,168,240,0.26),transparent_65%)] blur-2xl" />
        <div className="anim-orb-b absolute right-[6%] top-10 size-[380px] rounded-full bg-[radial-gradient(circle,rgba(47,126,248,0.22),transparent_65%)] blur-2xl" />
        <div className="absolute left-1/2 top-1/3 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(26,99,196,0.12),transparent_70%)] blur-3xl" />
      </div>
      <div
        className="hero-grid-bg pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[120rem]">
        <div className="wrapper">
          <div className="mx-auto max-w-[820px]">
            <div className="pb-14 text-center">
              <div className="anim-hero-rise">
                <Subheading text="Built for e-commerce sellers" />
              </div>

              <h1
                className="anim-hero-rise mx-auto mb-4 max-w-[740px] text-4xl font-bold text-gray-700 dark:text-white/90 sm:text-[50px] sm:leading-[64px]"
                style={{ animationDelay: '110ms' }}
              >
                Turn product details into{' '}
                <span className="hero-accent anim-gradient-pan">
                  listings that sell
                </span>
              </h1>
              <p
                className="anim-hero-rise mx-auto max-w-[560px] text-center text-base text-gray-500 dark:text-gray-400"
                style={{ animationDelay: '210ms' }}
              >
                AsiaBD Commerce AI writes marketplace-ready titles, SEO
                descriptions, ad copy, and customer replies for Shopify, Amazon,
                Etsy, and TikTok Shop, tuned to your brand voice.
              </p>

              <div
                className="anim-hero-rise relative z-30 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
                style={{ animationDelay: '310ms' }}
              >
                <Link
                  href="/signup"
                  className="gradient-btn btn-shine inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-medium text-white"
                >
                  Start generating free
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 px-7 text-sm font-medium text-gray-600 transition hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:text-gray-300"
                >
                  See how it works
                </a>
              </div>

              <p
                className="anim-hero-rise mt-4 text-xs text-gray-400"
                style={{ animationDelay: '400ms' }}
              >
                Free account · 50 welcome credits, no credit card required
              </p>
            </div>
          </div>

          <div className="relative mx-auto max-w-[1000px]">
            <div
              className="anim-hero-tilt-in relative z-30 p-2 sm:p-3"
              style={{ animationDelay: '420ms' }}
            >
              <Tilt max={5} scale={1.012}>
                <AppPreviewMock />
              </Tilt>
            </div>
            <HeroFloatChips />
            <div className="absolute left-1/2 top-0 hidden -translate-x-1/2 -translate-y-20 lg:block">
              <svg
                width="1100"
                height="900"
                viewBox="0 0 1100 900"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <g opacity="0.45" filter="url(#heroGlowA)">
                  <circle cx="680" cy="450" r="280" fill="#2f7ef8" />
                </g>
                <g opacity="0.25" filter="url(#heroGlowB)">
                  <circle cx="420" cy="450" r="280" fill="#38a8f0" />
                </g>
                <defs>
                  <filter
                    id="heroGlowA"
                    x="0"
                    y="-230"
                    width="1360"
                    height="1360"
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
                    <feGaussianBlur stdDeviation="100" result="blur" />
                  </filter>
                  <filter
                    id="heroGlowB"
                    x="-260"
                    y="-230"
                    width="1360"
                    height="1360"
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
                    <feGaussianBlur stdDeviation="100" result="blur" />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-glow-bg pointer-events-none absolute bottom-0 z-10 h-167.5 w-full" />
      <MarketplaceStrip />
    </section>
  );
}
