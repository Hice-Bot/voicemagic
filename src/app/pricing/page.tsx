import { PricingTable } from "@clerk/nextjs";
import Link from "next/link";

import { PublicFooter } from "@/components/marketing/PublicFooter";
import "../landing.css";

const PRICING_PLANS = [
  {
    key: "free",
    eyebrow: "No card required",
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "A starter credit pool for trying web generation, API calls, and MCP agent workflows.",
    features: ["Shared credits across web + API/MCP", "Built-in voices", "Good for testing the flow"],
  },
  {
    key: "standard",
    eyebrow: "Recommended",
    name: "Standard",
    price: "$19",
    cadence: "month",
    description: "The practical tier for regular creator work and lightweight agent automation.",
    features: ["Larger shared credit pool", "Voice cloning", "API and MCP access included"],
    highlighted: true,
  },
  {
    key: "pro",
    eyebrow: "Higher volume",
    name: "Pro",
    price: "$49",
    cadence: "month",
    description: "More room for production workloads, automations, and heavier web/API usage.",
    features: ["Largest shared credit pool", "Priority production workflows", "API and MCP access included"],
  },
];

function isBillingSimulationEnabled() {
  return process.env.CLERK_BILLING_SIMULATION === "true" || process.env.CLERK_BILLING_SIMULATION === "1";
}

function SalePricingTable() {
  return (
    <section className="pricing-sec">
      <div className="pricing-orbit pricing-orbit-1" />
      <div className="pricing-orbit pricing-orbit-2" />
      <div className="section-head pricing-head">
        <h1 className="section-h2">Simple credits. One balance.</h1>
        <p className="section-sub">
          Pick the plan that fits your workflow. Web usage, API calls, and MCP agent usage all draw from the same
          credit base, so there is one plan and one pool to understand.
        </p>
        <p className="section-sub">
          (While Voicemagic is listed for sale, plan selection uses simulated accounts so prospective buyers can test
          onboarding, plan access, and credit behavior without processing live payments.)
        </p>
      </div>

      <div className="pricing-grid">
        {PRICING_PLANS.map((plan) => (
          <article
            key={plan.key}
            className={`price-card${plan.highlighted ? " price-card-featured" : ""}`}
          >
            {plan.highlighted && <div className="price-ribbon">Recommended</div>}
            <div className="price-top">
              <div>
                <div className="price-eyebrow">{plan.eyebrow}</div>
                <h2 className="price-name">{plan.name}</h2>
              </div>
              <div className="price-chip">Shared credits</div>
            </div>
            <div className="price-amount">
              <span className="price-value">{plan.price}</span>
              <span className="price-cadence">/{plan.cadence}</span>
            </div>
            <p className="price-desc">{plan.description}</p>
            <form action="/api/billing/simulate" method="post">
              <input type="hidden" name="plan" value={plan.key} />
              <button
                className={`price-cta${plan.highlighted ? " price-cta-primary" : ""}`}
                type="submit"
              >
                {plan.key === "free" ? "Start free" : `Choose ${plan.name}`}
              </button>
            </form>
            <ul className="price-features">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function ClerkPricingSection() {
  return (
    <section className="pricing-sec">
      <div className="pricing-orbit pricing-orbit-1" />
      <div className="pricing-orbit pricing-orbit-2" />
      <div className="section-head pricing-head">
        <h1 className="section-h2">Simple credits. One balance.</h1>
        <p className="section-sub">
          Pick a plan in Clerk Billing. Web usage, API calls, and MCP agent usage all draw from the same credit base,
          so there is one plan and one pool to understand.
        </p>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-24">
        <PricingTable for="user" />
      </div>
    </section>
  );
}

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
            <Link href="/docs">API</Link>
          </div>
          <div className="nav-ctas">
            <Link href="/sign-in" className="nav-signin">Sign in</Link>
          </div>
        </div>
      </nav>

      {isBillingSimulationEnabled() ? <SalePricingTable /> : <ClerkPricingSection />}
      <PublicFooter />
    </main>
  );
}
