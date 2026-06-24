import Link from "next/link";
import { Map } from "lucide-react";

import { MarketingNav } from "@/components/marketing/MarketingNav";
import { PublicFooter } from "@/components/marketing/PublicFooter";

const sitemapGroups = [
  {
    title: "Product",
    links: [
      { label: "Home", href: "/" },
      { label: "Pricing", href: "/pricing" },
      { label: "API Docs", href: "/docs" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Acceptable Use", href: "/acceptable-use" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign Up", href: "/sign-up" },
      { label: "Sign In", href: "/sign-in" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-[#07040f] text-[#f7f1ff]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(189,97,255,0.26),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(66,188,255,0.16),transparent_45%)]" />
      <MarketingNav />

      <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <div className="mb-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
            <Map className="size-3.5" />
            Sitemap
          </div>
          <h1 className="text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">
            Explore Voicemagic.
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/65">
            A structured guide to the public pages available on voicemagic.dev.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sitemapGroups.map((group) => (
            <section key={group.title} className="rounded-3xl border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/20 backdrop-blur">
              <h2 className="text-xl font-semibold tracking-tight text-white">{group.title}</h2>
              <div className="mt-5 flex flex-col gap-3">
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-sm text-white/62 transition hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
