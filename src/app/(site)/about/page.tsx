import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About AsiaBD Commerce AI - the AI content and listing suite for e-commerce sellers.',
};

export default function AboutPage() {
  return (
    <section className="py-20">
      <div className="wrapper">
        <div className="mx-auto max-w-[800px]">
          <h1 className="mb-6 text-4xl font-semibold text-gray-800 dark:text-white/90">
            About AsiaBD Commerce AI
          </h1>
          <div className="prose max-w-none prose-gray dark:prose-invert prose-headings:font-semibold prose-a:text-primary-500">
            <p>
              <strong>AsiaBD Commerce AI</strong> is an AI content and listing
              suite built for one audience: e-commerce sellers. Instead of a
              generic “AI tools” dashboard, every feature is designed around
              the real workflow of listing and selling products on{' '}
              <strong>Shopify, Amazon, Etsy, TikTok Shop</strong>, and general
              e-commerce stores.
            </p>

            <h2>What the product does</h2>
            <p>
              Sellers describe a product once - name, category, features,
              target customer, keywords - choose a marketplace and tone, and
              get publish-ready content: optimized product titles, SEO
              descriptions, full listing audits with fixes, ad copy, social
              captions, customer support replies, reusable brand voice
              profiles, keyword plans, and bulk generation for product
              catalogs. Everything can be edited, saved to a content library,
              and exported as TXT, JSON, or CSV.
            </p>

            <h2>How it works</h2>
            <p>
              Generation is powered by Anthropic’s Claude models, called
              server-side so API keys never reach the browser. Every
              generation is metered by credits enforced on the server, and
              credits are only deducted when a generation succeeds. Without a
              configured API key, the app runs in demo mode with realistic
              sample output so you can explore every tool first.
            </p>

            <h2>Who it is for</h2>
            <p>
              Solo Shopify store owners, Amazon FBA sellers, Etsy makers,
              TikTok Shop creators - and import/export businesses across Asia
              and beyond - who want professional, marketplace-aware content
              without hiring a copy team.
            </p>

            <h2>Our principles</h2>
            <ul>
              <li>Accuracy over hype: no invented certifications, prices, or guarantees.</li>
              <li>Marketplace-aware output: rules per platform, in one configurable place.</li>
              <li>Human in the loop: everything is editable, everything is reviewable.</li>
              <li>Server-side security: keys stay on the server, always.</li>
            </ul>

            <h2>Get in touch</h2>
            <p>
              Questions, feedback, or partnership ideas? Reach us at{' '}
              <a href="mailto:hello@asiabd.shop">hello@asiabd.shop</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
