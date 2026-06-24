import { HelpCircle } from "lucide-react";

import { MarketingNav } from "@/components/marketing/MarketingNav";
import { PublicFooter } from "@/components/marketing/PublicFooter";

const faqs = [
  {
    question: "What does Voicemagic do?",
    answer:
      "Voicemagic turns text into speech using built-in voices, cloned voices, web workflows, API calls, and MCP-compatible agent tools.",
  },
  {
    question: "Do web, API, and MCP usage use different balances?",
    answer:
      "No. Web generations, API requests, and MCP agent usage all draw from the same plan credit base so usage is easy to understand.",
  },
  {
    question: "Can I try it without a credit card?",
    answer:
      "Yes. The free tier is designed for testing the product, trying voices, and understanding the generation workflow before upgrading.",
  },
  {
    question: "What are simulated accounts while the site is for sale?",
    answer:
      "During the sale process, plan selection can be tested without live payment processing. This lets prospective buyers review onboarding, plan access, and credit behavior safely.",
  },
  {
    question: "Can agents use Voicemagic?",
    answer:
      "Yes. Voicemagic includes MCP support so compatible agents can list voices and generate audio as part of automated creative or operational workflows.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Use the contact page or email jeff@jeffhampton.us for support, sale inquiries, billing questions, or technical handoff details.",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#07040f] text-[#f7f1ff]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(189,97,255,0.26),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(66,188,255,0.16),transparent_45%)]" />
      <MarketingNav />

      <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <div className="mb-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
            <HelpCircle className="size-3.5" />
            FAQ
          </div>
          <h1 className="text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">
            Common questions about Voicemagic.
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/65">
            Quick answers for buyers, creators, developers, and teams evaluating web, API, and MCP voice workflows.
          </p>
        </div>

        <div className="grid gap-4">
          {faqs.map((item) => (
            <article key={item.question} className="rounded-3xl border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/20 backdrop-blur">
              <h2 className="text-xl font-semibold tracking-tight text-white">{item.question}</h2>
              <p className="mt-3 text-sm leading-7 text-white/62">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
