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
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-12 md:py-16">
        <header className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-900">
              Voicemagic
            </Link>
            <nav className="flex flex-wrap items-center justify-end gap-3 text-sm text-zinc-500">
              <Link href="/privacy" className="hover:text-zinc-900">Privacy</Link>
              <Link href="/terms" className="hover:text-zinc-900">Terms</Link>
              <Link href="/acceptable-use" className="hover:text-zinc-900">Acceptable use</Link>
            </nav>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Effective date: May 11, 2026
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950">
              {title}
            </h1>
            <p className="mt-4 text-base leading-7 text-zinc-600">
              {description}
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                {section.title}
              </h2>
              <div className="mt-4 flex flex-col gap-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-zinc-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="border-t border-zinc-200 pt-6 text-sm leading-6 text-zinc-500">
          Questions about these terms? Contact us at{" "}
          <a href="mailto:business@codewithantonio.com" className="font-medium text-zinc-900 underline underline-offset-4">
            business@codewithantonio.com
          </a>
          .
        </footer>
      </div>
    </main>
  );
}
