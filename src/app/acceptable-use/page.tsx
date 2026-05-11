import { LegalPage } from "@/components/legal/LegalPage";

export default function AcceptableUsePage() {
  return (
    <LegalPage
      title="Acceptable Use Policy"
      description="This Acceptable Use Policy explains what is and is not allowed when using Voicemagic, especially for voice cloning, generated speech, API access, and MCP integrations."
      sections={[
        {
          title: "Consent and identity",
          body: [
            "Do not clone, imitate, or generate speech using a person's voice without appropriate consent, rights, or legal authority.",
            "Do not use Voicemagic to impersonate a real person, organization, public official, customer, employee, or trusted party in a deceptive or harmful way.",
            "Do not misrepresent AI-generated audio as authentic human speech when that misrepresentation could deceive, harm, defraud, or manipulate others.",
          ],
        },
        {
          title: "Fraud, scams, and abuse",
          body: [
            "Do not use Voicemagic for phishing, social engineering, credential theft, financial fraud, extortion, spam, robocalls, or other deceptive schemes.",
            "Do not use generated audio to bypass identity verification, authentication, biometric systems, moderation systems, or security controls.",
          ],
        },
        {
          title: "Harassment and harm",
          body: [
            "Do not use Voicemagic to harass, threaten, intimidate, stalk, exploit, shame, or abuse another person or group.",
            "Do not create content that promotes or facilitates violence, self-harm, sexual exploitation, abuse of minors, or illegal activity.",
          ],
        },
        {
          title: "Sensitive and regulated uses",
          body: [
            "Do not use Voicemagic to provide professional advice or instructions in regulated areas such as medical, legal, financial, employment, housing, education, or public safety contexts unless you are qualified and legally authorized to do so.",
            "Do not use Voicemagic for political persuasion, voter suppression, election interference, or misleading public-interest communications.",
          ],
        },
        {
          title: "Intellectual property and rights",
          body: [
            "Do not upload, clone, generate, distribute, or commercialize content that infringes copyrights, trademarks, publicity rights, privacy rights, contractual rights, or other third-party rights.",
            "You are responsible for obtaining permissions for scripts, recordings, voices, brands, characters, and other materials you use with the service.",
          ],
        },
        {
          title: "Platform integrity",
          body: [
            "Do not attempt to reverse engineer, scrape, overload, probe, attack, disrupt, or bypass rate limits, access controls, safety systems, or usage limits.",
            "Do not share API keys publicly, resell unauthorized access, or use automated systems in a way that degrades service reliability for others.",
          ],
        },
        {
          title: "Enforcement",
          body: [
            "We may investigate suspected violations and may remove content, limit usage, revoke API keys, suspend accounts, terminate access, or report activity when appropriate.",
            "We may consider context, intent, severity, user history, risk to others, and applicable law when deciding how to respond to a violation.",
          ],
        },
      ]}
    />
  );
}
