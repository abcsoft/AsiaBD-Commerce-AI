import type { Metadata } from 'next';
import LegalPage from '@/components/sections/legal-page';

export const metadata: Metadata = {
  title: 'AI Usage Disclosure',
};

export default function AiDisclosurePage() {
  return (
    <LegalPage title="AI Usage Disclosure" updated="October 2026">
      <p>
        AsiaBD Commerce AI is, by design, an AI-powered product. This page
        explains how AI is used, what that means for the content you generate,
        and how we recommend working with it responsibly.
      </p>

      <h2>What AI is used for</h2>
      <p>
        All generated content - product titles, descriptions, listings, ads,
        captions, support replies, brand voices, and keywords - is produced by
        large language models (Anthropic&rsquo;s Claude) from the inputs you
        provide. The Service does not make automated decisions about credit
        scores, employment, or anything unrelated to content generation.
      </p>

      <h2>What gets sent to the AI provider</h2>
      <p>
        To generate a result, the product details you submit (and the saved
        brand voice you select, if any) are sent securely from our servers to
        Anthropic&rsquo;s API. Your data is used to produce your result and is
        not used by us to train models. See Anthropic&rsquo;s privacy policy
        for details on their processing.
      </p>

      <h2>Your responsibility: review before publishing</h2>
      <ul>
        <li>
          <strong>Verify facts:</strong> check that features, materials, and
          specifications in the output match your actual product. Never publish
          claims you cannot substantiate.
        </li>
        <li>
          <strong>Check marketplace rules:</strong> some marketplaces have
          specific rules about AI-assisted content, prohibited claims, and
          superlatives. You are responsible for final compliance.
        </li>
        <li>
          <strong>Edit for accuracy and tone:</strong> everything in the app is
          editable - treat AI output as a strong first draft, not a final
          answer.
        </li>
      </ul>

      <h2>Transparency commitments</h2>
      <ul>
        <li>We clearly label demo-mode sample output so it is never mistaken for live generation.</li>
        <li>We keep generation records (what was generated, when, and by which source) in your workspace.</li>
        <li>We do not pretend AI output is human-written, and we recommend you disclose AI assistance where required by law or platform policy.</li>
      </ul>

      <h2>Questions</h2>
      <p>
        Contact <a href="mailto:hello@asiabd.shop">hello@asiabd.shop</a> with
        any questions about how AI is used in the Service.
      </p>
    </LegalPage>
  );
}
