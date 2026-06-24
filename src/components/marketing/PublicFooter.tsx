"use client";

import Link from "next/link";

type PublicFooterVariant = "dark" | "light";

const footerLinks = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
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
    title: "Resources",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "API Docs", href: "/docs" },
      { label: "Sitemap", href: "/sitemap" },
    ],
  },
];

export function PublicFooter({ variant = "dark" }: { variant?: PublicFooterVariant }) {
  const isLight = variant === "light";

  return (
    <footer
      className={
        isLight
          ? "border-t border-zinc-200 bg-white text-zinc-900"
          : "border-t border-white/10 bg-[#07040f]/80 text-[#f7f1ff]"
      }
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_2fr]">
        <div>
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Voicemagic
          </Link>
          <p className={isLight ? "mt-3 max-w-sm text-sm leading-6 text-zinc-600" : "mt-3 max-w-sm text-sm leading-6 text-white/58"}>
            AI voice cloning, text-to-speech, API access, and MCP-ready voice tools for web users and agent workflows.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <div className={isLight ? "text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500" : "text-xs font-semibold uppercase tracking-[0.16em] text-white/40"}>
                {group.title}
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={isLight ? "text-sm text-zinc-600 transition hover:text-zinc-950" : "text-sm text-white/58 transition hover:text-white"}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={isLight ? "border-t border-zinc-200 px-6 py-5" : "border-t border-white/10 px-6 py-5"}>
        <div className={isLight ? "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.12em] text-zinc-500" : "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.12em] text-white/35"}>
          <span>© 2026 Voicemagic</span>
          <span>voicemagic.dev</span>
        </div>
      </div>
    </footer>
  );
}
