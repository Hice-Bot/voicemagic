import Link from "next/link";

interface LegalSection {
  title: string;
  body: string[];
}

export function LegalPage({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-[#07040f] text-[#f7f1ff]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(189,97,255,0.24),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(66,188,255,0.14),transparent_45%)]" />
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-12 md:py-16">
        <header className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-sm font-semibold tracking-tight text-white">
              Voicemagic
            </Link>
            <nav className="flex flex-wrap items-center justify-end gap-3 text-sm text-white/55">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/acceptable-use" className="hover:text-white">Acceptable use</Link>
            </nav>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Effective date: May 11, 2026
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-4 text-base leading-7 text-white/65">
              {description}
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-sm backdrop-blur">
              <h2 className="text-xl font-semibold tracking-tight text-white">
                {section.title}
              </h2>
              <div className="mt-4 flex flex-col gap-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-white/62">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="border-t border-white/10 pt-6 text-sm leading-6 text-white/55">
          Questions about these terms? Contact us at{" "}
          <a href="mailto:jeff@jeffhampton.us" className="font-medium text-white underline underline-offset-4">
            jeff@jeffhampton.us
          </a>
          .
        </footer>
      </div>
    </main>
  );
}
