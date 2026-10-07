'use client';

import { Input } from '@/components/ui/inputs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/inputs/textarea';
import { BRAND } from '@/lib/brand';
import { useState } from 'react';

const TOPICS = [
  'Sales & pricing',
  'Support issue',
  'Partnership',
  'Feedback',
] as const;

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [message, setMessage] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `[AsiaBD] ${topic} - ${name || 'New message'}`;
    const body = `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`;
    window.location.href = `mailto:${BRAND.contactEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="relative py-28">
      <div className="wrapper">
        <div className="relative mx-auto max-w-[800px]">
          <div className="contact-wrapper relative z-30 border border-gray-100 bg-white p-8 dark:border-gray-800 dark:bg-dark-primary md:p-14">
            <div className="mb-12 text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">
                Get in touch
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Sales, support, or feedback - we usually reply within one
                business day.
              </p>
            </div>

            <form onSubmit={submit}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-full">
                  <Label htmlFor="topic">Topic</Label>
                  <select
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-12 w-full rounded-full border border-gray-300 bg-white px-5 text-sm text-gray-800 shadow-theme-xs focus:border-primary-300 focus:outline-0 focus:ring-3 focus:ring-primary-300/20 dark:border-gray-700 dark:bg-dark-primary dark:text-white/90"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-full">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    placeholder="Tell us what you need help with…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-full">
                  <button className="h-12 w-full rounded-full bg-primary-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-600">
                    Compose message
                  </button>
                  <p className="mt-3 text-center text-xs text-gray-400">
                    This opens your email app with the message pre-filled.
                    Prefer email? Write to{' '}
                    <a
                      href={`mailto:${BRAND.contactEmail}`}
                      className="font-medium text-primary-500"
                    >
                      {BRAND.contactEmail}
                    </a>
                    .
                  </p>
                </div>
              </div>
            </form>
          </div>

          <div className="relative z-30 mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-dark-primary">
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Customer support
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Order issues, credits, refunds.
              </p>
              <a
                href={`mailto:${BRAND.supportEmail}`}
                className="mt-3 inline-block text-sm font-medium text-primary-500"
              >
                {BRAND.supportEmail}
              </a>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-dark-primary">
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Response time
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                We reply within 1 business day, Sunday-Thursday (GMT+6).
              </p>
            </div>
          </div>
        </div>
      </div>
      <span className="absolute -bottom-32 left-1/2 z-0 -translate-x-1/2">
        <svg
          width="930"
          height="760"
          viewBox="0 0 930 760"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <g opacity="0.25" filter="url(#contactGlowA)">
            <circle cx="380.335" cy="380.335" r="179.665" fill="#38a8f0" />
          </g>
          <g opacity="0.5" filter="url(#contactGlowB)">
            <circle cx="549.665" cy="380.335" r="179.665" fill="#2f7ef8" />
          </g>
          <defs>
            <filter
              id="contactGlowA"
              x="0.669922"
              y="0.6698"
              width="759.33"
              height="759.33"
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
              <feGaussianBlur stdDeviation="100" result="blurA" />
            </filter>
            <filter
              id="contactGlowB"
              x="170"
              y="0.6698"
              width="759.33"
              height="759.33"
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
              <feGaussianBlur stdDeviation="100" result="blurB" />
            </filter>
          </defs>
        </svg>
      </span>
    </section>
  );
}
