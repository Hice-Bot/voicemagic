import { LegalPage } from "@/components/legal/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This Privacy Policy explains how Voicemagic collects, uses, stores, and protects information when you use our voice generation, voice cloning, API, MCP, and account services."
      sections={[
        {
          title: "Information we collect",
          body: [
            "We collect account information such as your name, email address, authentication identifiers, and settings needed to operate your account.",
            "We collect content you provide to the service, including text prompts, uploaded or recorded audio, generated audio, custom voice names, API keys, and related generation metadata.",
            "We collect technical information such as device and browser details, IP address, log events, usage data, error reports, and security signals needed to keep the service reliable and secure.",
          ],
        },
        {
          title: "How we use information",
          body: [
            "We use your information to provide the service, generate audio, create and manage custom voices, authenticate users, process API and MCP requests, provide support, and improve reliability.",
            "We may use aggregated or de-identified usage information to understand product performance, capacity needs, and feature adoption.",
            "We do not sell your personal information or your private voice data.",
          ],
        },
        {
          title: "Voice data and generated content",
          body: [
            "Custom voice recordings and generated audio are treated as your account content. We use them to provide the features you request, including voice cloning, text-to-speech generation, previews, downloads, and API access.",
            "You are responsible for ensuring you have permission to upload, clone, or generate audio using any voice, recording, script, likeness, or other content you submit.",
            "We may review content or account activity when needed to enforce our Terms, investigate abuse, comply with law, or protect users and the service.",
          ],
        },
        {
          title: "Service providers",
          body: [
            "We may share information with vendors that help us operate Voicemagic, including hosting, authentication, database, storage, analytics, error monitoring, payment, and support providers.",
            "These providers are allowed to process information only as needed to provide services to us and must protect information according to appropriate confidentiality and security obligations.",
          ],
        },
        {
          title: "Retention and deletion",
          body: [
            "We retain account information, voice data, generated content, and logs for as long as needed to provide the service, comply with legal obligations, resolve disputes, prevent abuse, and enforce agreements.",
            "You may request deletion of your account or certain content by contacting us. Some information may remain in backups, logs, security records, or records we are legally required or permitted to keep.",
          ],
        },
        {
          title: "Security",
          body: [
            "We use reasonable administrative, technical, and organizational safeguards designed to protect information. No online service can guarantee absolute security.",
            "You are responsible for protecting your account credentials and API keys. If you believe your account or API key has been compromised, revoke the key and contact us promptly.",
          ],
        },
        {
          title: "Children",
          body: [
            "Voicemagic is not directed to children under 13, and we do not knowingly collect personal information from children under 13.",
            "If you believe a child has provided personal information to us, contact us so we can review and take appropriate action.",
          ],
        },
        {
          title: "Changes",
          body: [
            "We may update this Privacy Policy from time to time. When we make material changes, we will update the effective date and may provide additional notice when appropriate.",
          ],
        },
      ]}
    />
  );
}
