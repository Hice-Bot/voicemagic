import { LegalPage } from "@/components/legal/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These Terms govern your access to and use of Voicemagic, including the website, dashboard, voice cloning tools, text-to-speech generation, API, MCP server, and related services."
      sections={[
        {
          title: "Acceptance of terms",
          body: [
            "By creating an account, accessing Voicemagic, or using any part of the service, you agree to these Terms and our Privacy Policy.",
            "If you are using Voicemagic on behalf of a company or organization, you represent that you have authority to bind that organization to these Terms.",
          ],
        },
        {
          title: "Accounts and security",
          body: [
            "You must provide accurate account information and keep your login credentials and API keys secure.",
            "You are responsible for all activity that occurs under your account, including activity from API keys, integrations, or MCP clients connected to your account.",
          ],
        },
        {
          title: "Your content and permissions",
          body: [
            "You retain ownership of text, audio, recordings, scripts, custom voices, and generated outputs you submit to or create with Voicemagic, subject to these Terms.",
            "You grant Voicemagic the rights necessary to host, process, transmit, display, and generate content as needed to provide and improve the service.",
            "You represent that you have all rights and permissions needed for content you upload, record, clone, or generate, including any voice, likeness, script, brand, or third-party material.",
          ],
        },
        {
          title: "Voice cloning and consent",
          body: [
            "You may not clone, imitate, or generate speech using a person's voice without the rights, consent, or legal authority required for that use.",
            "You are responsible for disclosing synthetic or AI-generated audio when required by law, platform rules, contracts, or applicable professional standards.",
          ],
        },
        {
          title: "Plans, billing, and credits",
          body: [
            "Some features may require a paid plan or usage credits. Plan limits, features, and prices may change over time, but changes will not apply retroactively to paid periods already purchased unless required by law.",
            "Free plans may include limited credits, voice limits, generation limits, or feature restrictions. We may change or discontinue free features at any time.",
          ],
        },
        {
          title: "Acceptable use",
          body: [
            "You must follow our Acceptable Use Policy. You may not use Voicemagic for unlawful, harmful, deceptive, abusive, infringing, or non-consensual voice activity.",
            "We may suspend or terminate access, remove content, revoke API keys, or limit usage when we believe an account violates these Terms or creates risk for users, third parties, or the service.",
          ],
        },
        {
          title: "Service availability",
          body: [
            "We work to keep Voicemagic reliable, but the service may be unavailable, delayed, changed, or discontinued from time to time.",
            "Generated outputs may vary in quality, accuracy, availability, latency, and suitability for a particular use. You are responsible for reviewing outputs before publishing or relying on them.",
          ],
        },
        {
          title: "Disclaimers and limitation of liability",
          body: [
            "Voicemagic is provided on an as-is and as-available basis to the fullest extent permitted by law.",
            "To the fullest extent permitted by law, Voicemagic will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost data, loss of goodwill, or business interruption.",
          ],
        },
        {
          title: "Changes to these Terms",
          body: [
            "We may update these Terms from time to time. Continued use of Voicemagic after updated Terms become effective means you accept the updated Terms.",
          ],
        },
      ]}
    />
  );
}
