import Link from 'next/link';
import Reveal from '@/components/motion/reveal';

export default function CtaBand() {
  return (
    <section className="pb-20 pt-4 dark:bg-[#171f2e]">
      <div className="wrapper">
        <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(120deg,#123a78_0%,#1a63c4_45%,#2f9df8_100%)] px-8 py-14 text-center md:px-16">
          <div className="anim-orb-a pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-2xl" />
          <div className="anim-orb-b pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-white/10 blur-2xl" />

          <Reveal>
          <h2 className="relative text-3xl font-bold text-white md:text-4xl">
            Ready to publish better listings?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-6 text-white/80">
            Create your free account in seconds - 50 welcome credits, no credit
            card required. Generate your first marketplace-optimized title in
            under a minute.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-gray-900 transition hover:scale-[1.02] hover:bg-gray-100"
            >
              Start generating free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-8 text-sm font-medium text-white transition hover:bg-white/10"
            >
              View pricing
            </Link>
          </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
