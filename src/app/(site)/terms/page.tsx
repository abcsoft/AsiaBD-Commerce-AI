import type { Metadata } from 'next';
import LegalPage from '@/components/sections/legal-page';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 2026">
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
        use of AsiaBD Commerce AI (the &ldquo;Service&rdquo;), available at
        asiabd.shop. By using the Service you agree to these Terms. If you do
        not agree, do not use the Service.
      </p>

      <h2>1. The Service</h2>
      <p>
        The Service generates marketing and listing content using artificial
        intelligence, including product titles, descriptions, ads, captions,
        replies, brand voice profiles, and keyword suggestions, tailored to
        marketplaces such as Shopify, Amazon, Etsy, and TikTok Shop. The
        Service is provided on an &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo; basis.
      </p>

      <h2>2. AI output</h2>
      <p>
        AI-generated content may contain inaccuracies and may not always be
        suitable for your specific product, audience, or marketplace. You are
        responsible for reviewing, editing, and verifying all output before
        publishing it, including compliance with each marketplace&rsquo;s
        policies. Do not publish claims that are untrue or that you cannot
        substantiate.
      </p>

      <h2>3. Accounts, workspaces, and credits</h2>
      <p>
        The Service operates with anonymous workspaces identified by a session
        cookie. Credits are consumed per generation and are only deducted when
        a generation completes successfully. Credit balances, ledger history,
        and saved items are stored for your workspace; you can delete saved
        items at any time and request workspace deletion via{' '}
        <a href="mailto:support@asiabd.shop">support@asiabd.shop</a>.
      </p>

      <h2>4. Acceptable use</h2>
      <ul>
        <li>Do not use the Service to create unlawful, deceptive, or infringing content.</li>
        <li>Do not attempt to bypass rate limits, credit systems, or security controls.</li>
        <li>Do not resell the Service&rsquo;s capacity without authorization.</li>
        <li>Do not submit content you do not have the right to process.</li>
      </ul>
      <p>
        We may suspend or terminate access for violations of these Terms or
        for conduct that harms the Service or other users.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        You retain ownership of the inputs you submit. Subject to your
        compliance with these Terms, we assign to you all rights we may hold
        in the generated output for your workspace. The Service itself,
        including its software, design, and brand, remains our property.
      </p>

      <h2>6. Disclaimers</h2>
      <p>
        We do not warrant that the Service will be uninterrupted, error-free,
        or that output will meet your requirements or marketplace standards.
        You are solely responsible for your marketplace accounts, listings,
        and compliance obligations.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for indirect,
        incidental, special, consequential, or punitive damages, or for lost
        profits, revenues, or data, arising from your use of the Service. Our
        aggregate liability will not exceed the amounts you paid for the
        Service in the twelve months preceding the claim.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these Terms from time to time. Material changes will be
        reflected by the &ldquo;Last updated&rdquo; date on this page.
        Continued use after changes constitutes acceptance.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these Terms: <a href="mailto:hello@asiabd.shop">hello@asiabd.shop</a>.
      </p>
    </LegalPage>
  );
}
