import { Mail } from "lucide-react";

import { ContactForm } from "@/components/marketing/ContactForm";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { PublicFooter } from "@/components/marketing/PublicFooter";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#07040f] text-[#f7f1ff]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(189,97,255,0.26),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(66,188,255,0.16),transparent_45%)]" />
      <MarketingNav />

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
            <Mail className="size-3.5" />
            Contact
          </div>
          <h1 className="text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">
            Talk to Voicemagic.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/65">
            Questions about voice cloning, API access, MCP agent workflows,
            pricing, support, or custom use cases? Send a note and it will be
            addressed to Jeff directly.
          </p>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-sm leading-7 text-white/58">
            Prefer plain email? Write to{" "}
            <a href="mailto:jeff@jeffhampton.us" className="font-medium text-white underline underline-offset-4">
              jeff@jeffhampton.us
            </a>
            .
          </div>
        </div>

        <ContactForm />
      </section>
      <PublicFooter />
    </main>
  );
}
