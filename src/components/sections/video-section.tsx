'use client';

import { useState } from 'react';

const VIDEO_SRC = '/videos/asiabd-commerce-ai-demo.mp4';

export default function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="bg-gray-50 py-14 md:py-24 dark:bg-[#101828]">
      <div className="wrapper">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-800 dark:text-white/90 md:text-title-lg">
            Watch the 90-second walkthrough
          </h2>
          <p className="mx-auto max-w-xl leading-6 text-gray-500 dark:text-gray-400">
            Select a product, choose Shopify, generate a title and description,
            create ad copy, then save and export.
          </p>
        </div>

        <div className="mx-auto max-w-[860px]">
          <div className="group/poster relative overflow-hidden rounded-3xl border border-gray-100 bg-gray-900 shadow-theme-lg dark:border-gray-800">
            {playing ? (
              <video
                className="block aspect-video w-full bg-black"
                src={VIDEO_SRC}
                controls
                autoPlay
                playsInline
              />
            ) : (
              <div className="relative flex aspect-video items-center justify-center">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(135deg,#0b1f3a_0%,#1a63c4_55%,#38a8f0_100%)] transition-transform duration-700 ease-out group-hover/poster:scale-[1.03]"
                />

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  <span className="anim-ring absolute size-20 rounded-full border border-white/40" />
                  <span
                    className="anim-ring absolute size-20 rounded-full border border-white/25"
                    style={{ animationDelay: '1.3s' }}
                  />
                </span>

                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label="Play the 90-second walkthrough"
                  className="group relative z-10 inline-flex size-20 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25"
                >
                  <span className="inline-flex size-14 items-center justify-center rounded-full bg-white text-primary-600 shadow-theme-md transition group-hover:scale-105">
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-1 size-6"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 text-center sm:grid-cols-3">
            {[
              ['Select a product', 'Use any of the built-in samples or paste your own details.'],
              ['Generate & edit', 'Claude writes titles, descriptions, and ad copy in seconds.'],
              ['Save & export', 'Library, TXT, JSON, CSV - ready for any marketplace.'],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-dark-primary"
              >
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {title}
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
