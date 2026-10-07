import type { Metadata } from 'next';
import LegalPage from '@/components/sections/legal-page';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 2026">
      <p>
        This Privacy Policy explains what AsiaBD Commerce AI collects, how we
        use it, and the choices you have.
      </p>

      <h2>Data we collect</h2>
      <ul>
        <li>
          <strong>Workspace session:</strong> an anonymous session identifier
          stored in a single httpOnly cookie, used to keep your credits,
          generations, and saved library together. It contains no personal
          information.
        </li>
        <li>
          <strong>Content you submit:</strong> product details, customer
          messages, and other inputs you type into the tools, plus the outputs
          you generate or save.
        </li>
        <li>
          <strong>Usage records:</strong> generation history and credit ledger
          entries for your workspace.
        </li>
        <li>
          <strong>Basic technical logs:</strong> standard server logs (such as
          error diagnostics) that do not include your payment details.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        To operate the Service: generate content you request, track credits,
        power your library and dashboard, prevent abuse (rate limiting), and
        improve reliability.
      </p>

      <h2>AI processing</h2>
      <p>
        When you generate content, your inputs (and any selected brand voice)
        are sent from our servers to Anthropic&rsquo;s API to produce the
        result. We do not use your content to train models.
      </p>

      <h2>Cookies</h2>
      <p>
        The Service uses a single functional session cookie (httpOnly) for your
        workspace. We do not use advertising or third-party tracking cookies.
      </p>

      <h2>Payments</h2>
      <p>
        If you purchase credits or a subscription, payments are processed by
        third-party payment providers. We do not store card numbers on our
        servers.
      </p>

      <h2>Retention &amp; deletion</h2>
      <p>
        Saved library items can be edited or deleted at any time in the app.
        Generation history is retained for your workspace so your dashboard
        works. To request deletion of your entire workspace, contact{' '}
        <a href="mailto:support@asiabd.shop">support@asiabd.shop</a>.
      </p>

      <h2>Security</h2>
      <p>
        API keys and provider credentials are stored server-side only and are
        never exposed to the browser. Traffic is encrypted in transit (HTTPS).
      </p>

      <h2>Children</h2>
      <p>
        The Service is a business tool and is not directed at children under
        13. We do not knowingly collect data from children.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy; the &ldquo;Last updated&rdquo; date reflects
        the current version.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions or requests:{' '}
        <a href="mailto:support@asiabd.shop">support@asiabd.shop</a>.
      </p>
    </LegalPage>
  );
}
