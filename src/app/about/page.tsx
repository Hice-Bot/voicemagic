import Link from "next/link";
import { Bot, Braces, Mic2, Sparkles, Workflow } from "lucide-react";

import { MarketingNav } from "@/components/marketing/MarketingNav";
import { PublicFooter } from "@/components/marketing/PublicFooter";

const pillars = [
  {
    icon: Mic2,
    title: "Voice cloning",
    description:
      "Create a private custom voice from a short recording, then generate consistent speech without re-recording every script.",
  },
  {
    icon: Sparkles,
    title: "Built-in voices",
    description:
      "Use 200+ built-in voices for narration, demos, support content, prototypes, and production audio when cloning is not needed.",
  },
  {
    icon: Braces,
    title: "REST API",
    description:
      "Generate speech, list voices, retrieve generation metadata, and download audio from your own backend or automation scripts.",
  },
  {
    icon: Bot,
    title: "MCP for agents",
    description:
      "Connect Voicemagic to MCP-compatible agents so they can generate audio as a tool inside creative and operational workflows.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#07040f] text-[#f7f1ff]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(189,97,255,0.26),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(66,188,255,0.16),transparent_45%)]" />
      <MarketingNav />

      <section className="mx-auto flex max-w-6xl flex-col gap-14 px-6 py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
            <Workflow className="size-3.5" />
            Voice software for humans and agents
          </div>
          <h1 className="text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">
            Voicemagic turns text, voices, and agent workflows into usable audio.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
            Voicemagic is an AI voice platform for creating natural speech from
            scripts, cloned voices, built-in voices, API calls, and MCP-enabled
            agent tools. It is designed to make audio generation feel like a
            normal part of your creative or software workflow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pricing" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#12081f] transition hover:bg-white/90">
              Choose a tier
            </Link>
            <Link href="/api-mcp" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Explore API/MCP
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="rounded-3xl border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[oklch(0.82_0.13_325)]">
                <pillar.icon className="size-6" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                {pillar.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/62">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.035] p-7 md:p-9">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                MCP and agent usage
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Give agents a real voice-generation tool.
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-white/65">
              <p>
                Voicemagic exposes an MCP server so compatible agents can list
                voices, generate speech, and retrieve generation details from
                the same account-backed voice library your team uses in the web
                app.
              </p>
              <p>
                That means an agent can draft narration, create support audio,
                produce placeholders for video workflows, or turn structured
                output into speech without a custom integration layer.
              </p>
              <p>
                API keys control access, and the dashboard gives users a clear
                place to create keys, review usage, and connect API/MCP clients.
              </p>
            </div>
          </div>
        </section>
      </section>
      <PublicFooter />
    </main>
  );
}
