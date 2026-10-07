import type { Metadata } from 'next';
import LegalPage from '@/components/sections/legal-page';

export const metadata: Metadata = {
  title: 'Refund Policy',
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy" updated="October 2026">
      <p>
        This policy explains how refunds work for AsiaBD Commerce AI purchases,
        including credit packs and subscriptions.
      </p>

      <h2>Credit-based service</h2>
      <p>
        The Service is metered by credits. Credits are only deducted when a
        generation succeeds - failed generations are never charged. Because
        each credit corresponds to a completed AI generation (which incurs
        real processing cost), consumed credits are generally non-refundable.
      </p>

      <h2>Eligible refunds</h2>
      <ul>
        <li>
          <strong>Unused credit packs:</strong> you may request a refund within
          14 days of purchase for credits that have not been used.
        </li>
        <li>
          <strong>Duplicate charges:</strong> accidental duplicate payments are
          refunded in full.
        </li>
        <li>
          <strong>Extended outages:</strong> if a verified service issue caused
          repeated failed generations, we refund the affected credits.
        </li>
      </ul>

      <h2>How to request a refund</h2>
      <p>
        Email <a href="mailto:support@asiabd.shop">support@asiabd.shop</a> with
        the email used at checkout and your order or receipt reference. We aim
        to respond within 2 business days and process approved refunds within
        5-10 business days to the original payment method.
      </p>

      <h2>Subscriptions</h2>
      <p>
        Subscriptions renew monthly or annually until cancelled and can be
        cancelled at any time. Cancelling stops future renewals; the current
        billing period remains active until its end. Partial-period refunds are
        generally not provided, except where required by law.
      </p>

      <h2>Chargebacks</h2>
      <p>
        Please contact us before initiating a chargeback - we can usually
        resolve issues faster directly. Chargebacks filed without contacting
        support may result in the suspension of the workspace while the dispute
        is investigated.
      </p>
    </LegalPage>
  );
}
