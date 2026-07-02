import Link from "next/link";

export function MarketingNav() {
  return (
    <nav className="border-b border-white/10 bg-[#07040f]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-5">
        <Link href="/" className="flex items-center gap-3 text-white">
          <svg viewBox="0 0 32 32" className="size-7 text-[oklch(0.82_0.13_325)]" aria-hidden="true">
            <g>
              <rect x="4" y="13" width="2.5" height="6" rx="1.25" fill="currentColor" opacity="0.5" />
              <rect x="8.5" y="10" width="2.5" height="12" rx="1.25" fill="currentColor" opacity="0.75" />
              <rect x="13" y="6" width="2.5" height="20" rx="1.25" fill="currentColor" />
              <rect x="17.5" y="10" width="2.5" height="12" rx="1.25" fill="currentColor" opacity="0.75" />
              <rect x="22" y="13" width="2.5" height="6" rx="1.25" fill="currentColor" opacity="0.5" />
              <circle cx="27" cy="7" r="1.8" fill="currentColor" opacity="0.9" />
            </g>
          </svg>
          <span className="text-lg font-semibold tracking-tight">Voicemagic</span>
        </Link>
        <div className="ml-auto hidden items-center gap-6 text-sm text-white/60 sm:flex">
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
          <Link
            href="/sign-in"
            className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 font-semibold text-white hover:bg-white hover:text-[#07040f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}
