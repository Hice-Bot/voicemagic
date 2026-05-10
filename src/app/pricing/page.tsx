import Link from "next/link";

import { PricingSection } from "@/components/landing/LandingPage";
import "../landing.css";

export default function PricingPage() {
  return (
    <main className="vm-page">
      <nav className="vm-nav">
        <div className="nav-inner">
          <Link className="nav-brand" href="/">
            <svg viewBox="0 0 32 32" className="nav-glyph" aria-hidden="true">
              <g>
                <rect x="4" y="13" width="2.5" height="6" rx="1.25" fill="currentColor" opacity="0.5" />
                <rect x="8.5" y="10" width="2.5" height="12" rx="1.25" fill="currentColor" opacity="0.75" />
                <rect x="13" y="6" width="2.5" height="20" rx="1.25" fill="currentColor" />
                <rect x="17.5" y="10" width="2.5" height="12" rx="1.25" fill="currentColor" opacity="0.75" />
                <rect x="22" y="13" width="2.5" height="6" rx="1.25" fill="currentColor" opacity="0.5" />
                <circle cx="27" cy="7" r="1.8" fill="currentColor" opacity="0.9" />
              </g>
            </svg>
            <span className="nav-wordmark">Voicemagic</span>
          </Link>
          <div className="nav-links">
            <Link href="/#features">Features</Link>
            <Link href="/#voices">Voices</Link>
            <Link href="/docs">API</Link>
          </div>
          <div className="nav-ctas">
            <Link href="/sign-in" className="nav-signin">Sign in</Link>
          </div>
        </div>
      </nav>

      <PricingSection />
    </main>
  );
}
