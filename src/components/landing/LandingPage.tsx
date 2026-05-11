"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";

// ── Deterministic pseudo-random ──────────────────────────────────────────────
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ── Waveform ─────────────────────────────────────────────────────────────────
function Waveform({
  seed = 1, bars = 48, active = false, height = 40, color,
}: {
  seed?: number; bars?: number; active?: boolean; height?: number; color?: string;
}) {
  const vals = useMemo(() => {
    const r = seededRand(seed);
    return Array.from({ length: bars }, (_, i) => {
      const v = r();
      const envelope = Math.sin((i / bars) * Math.PI);
      return 0.15 + v * 0.7 * envelope + 0.1;
    });
  }, [seed, bars]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="wf" style={{ height, ["--wf-color" as string]: color || "var(--brand)" }}>
      {vals.map((v, i) => {
        const dynamic = active ? v * (0.7 + 0.3 * Math.sin((tick + i * 0.7) * 0.5)) : v;
        return (
          <span key={i} className="wf-bar" style={{ height: `${Math.max(6, dynamic * height)}px` }} />
        );
      })}
    </div>
  );
}

// ── VoiceAvatar ───────────────────────────────────────────────────────────────
function VoiceAvatar({ name, hue, size = 48 }: { name: string; hue?: number; size?: number }) {
  const initials = name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  const h = hue ?? (name.charCodeAt(0) * 7) % 360;
  return (
    <div
      className="v-avatar"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, oklch(0.55 0.18 ${h}) 0%, oklch(0.35 0.16 ${(h + 40) % 360}) 100%)`,
        fontSize: size * 0.38,
      }}
    >
      <span>{initials}</span>
    </div>
  );
}

// ── SoundSculpture ────────────────────────────────────────────────────────────
function SoundSculpture() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = () => {
      setPhase((performance.now() - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const coreBarData = useMemo(() => {
    const r = seededRand(42);
    return Array.from({ length: 64 }, () => r());
  }, []);

  const particles = useMemo(() => {
    const r = seededRand(7);
    return Array.from({ length: 40 }, () => ({
      angle: r() * Math.PI * 2,
      radius: 180 + r() * 160,
      size: 1 + r() * 3,
      speed: 0.08 + r() * 0.15,
      offset: r() * Math.PI * 2,
    }));
  }, []);

  return (
    <div className="sculpture-wrap">
      <div className="sc-glow sc-glow-1" />
      <div className="sc-glow sc-glow-2" />
      <svg viewBox="-300 -300 600 600" className="sculpture">
        <defs>
          <radialGradient id="coreGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="oklch(0.85 0.15 295deg)" stopOpacity="1" />
            <stop offset="40%" stopColor="oklch(0.65 0.22 295deg)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="oklch(0.35 0.2 295deg)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.75 0.2 295deg)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="oklch(0.5 0.18 325deg)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {[0, 1, 2].map(i => {
          const tilt = 70 + i * 8;
          const rot = phase * (8 - i * 2) + i * 60;
          const rx = 220 + i * 30;
          const ry = rx * Math.cos((tilt * Math.PI) / 180);
          return (
            <g key={i} transform={`rotate(${rot})`}>
              <ellipse cx="0" cy="0" rx={rx} ry={ry}
                fill="none" stroke="url(#ringGrad)" strokeWidth={0.8}
                opacity={0.6 - i * 0.15}
              />
            </g>
          );
        })}

        {particles.map((p, i) => {
          const a = p.angle + phase * p.speed;
          const wobble = Math.sin(phase * 0.7 + p.offset) * 8;
          const r = p.radius + wobble;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r * 0.35;
          return (
            <circle key={i} cx={x} cy={y} r={p.size}
              fill={`oklch(${0.6 + Math.sin(phase + p.offset) * 0.2} 0.2 295deg)`}
              opacity={0.4 + Math.sin(phase + p.offset) * 0.3}
            />
          );
        })}

        <circle cx="0" cy="0" r="140" fill="url(#coreGrad)" />

        {coreBarData.map((v, i) => {
          const angle = (i / 64) * Math.PI * 2;
          const pulse = 0.6 + 0.4 * Math.sin(phase * 3 + i * 0.4);
          const barLen = 20 + v * 50 * pulse;
          const innerR = 90, outerR = innerR + barLen;
          const x1 = Math.cos(angle) * innerR, y1 = Math.sin(angle) * innerR;
          const x2 = Math.cos(angle) * outerR, y2 = Math.sin(angle) * outerR;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={`oklch(${0.75 + pulse * 0.15} 0.22 295deg)`}
              strokeWidth="2.5" strokeLinecap="round"
              opacity={0.5 + pulse * 0.4}
            />
          );
        })}

        <circle cx="0" cy="0" r={18 + Math.sin(phase * 4) * 3}
          fill="oklch(0.95 0.06 295deg)" opacity="0.95"
        />
      </svg>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="vm-nav">
      <div className="nav-inner">
        <a className="nav-brand" href="#">
          <svg viewBox="0 0 32 32" className="nav-glyph" aria-hidden="true">
            <g>
              <rect x="4" y="13" width="2.5" height="6" rx="1.25" fill="currentColor" opacity="0.5"/>
              <rect x="8.5" y="10" width="2.5" height="12" rx="1.25" fill="currentColor" opacity="0.75"/>
              <rect x="13" y="6" width="2.5" height="20" rx="1.25" fill="currentColor"/>
              <rect x="17.5" y="10" width="2.5" height="12" rx="1.25" fill="currentColor" opacity="0.75"/>
              <rect x="22" y="13" width="2.5" height="6" rx="1.25" fill="currentColor" opacity="0.5"/>
              <circle cx="27" cy="7" r="1.8" fill="currentColor" opacity="0.9"/>
            </g>
          </svg>
          <span className="nav-wordmark">Voicemagic</span>
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#voices">Voices</a>
          <a href="#api">API</a>
          <Link href="/pricing">Pricing</Link>
        </div>
        <div className="nav-ctas">
          <Link href="/sign-in" className="nav-signin">Sign in</Link>
          <Link href="/pricing" className="btn btn-primary btn-sm">Start for free</Link>
        </div>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg-gradient" />
      <div className="hero-grid" />
      <SoundSculpture />
      <div className="hero-content">
        <div className="hero-pill">
          <span className="pill-dot" />
          <span>New — clone your voice from 10 seconds of audio</span>
          <span className="pill-arrow">→</span>
        </div>
        <h1 className="hero-headline">
          <span className="hl-line hl-1">Any voice.</span>
          <span className="hl-line hl-2">Cloned in seconds.</span>
          <span className="hl-line hl-3">Or not.</span>
        </h1>
        <p className="hero-sub">
          Voicemagic turns a 10-second recording into a voice you can use forever. Or skip the cloning entirely and pick from 200+ professional voices — ready to generate natural, expressive speech from any text.
        </p>
        <div className="hero-ctas">
          <Link href="/pricing" className="btn btn-primary btn-lg">
            Clone Any Voice Free
            <span className="btn-arrow">→</span>
          </Link>
          <a href="#voices" className="btn btn-ghost btn-lg">
            <span className="play-glyph">▶</span>
            Watch demo · 90s
          </a>
        </div>
        <div className="hero-trust">
          <span>No credit card required</span>
          <span className="dot-sep">·</span>
          <span>Works in your browser</span>
          <span className="dot-sep">·</span>
          <span>Ready in under a minute</span>
        </div>
      </div>
    </section>
  );
}

// ── How It Works ─────────────────────────────────────────────────────────────
function StepRecord() {
  const [rec, setRec] = useState(false);
  return (
    <div className="sv-inner">
      <div className="sv-rec-top">
        <div className={`rec-dot${rec ? " on" : ""}`} />
        <span>{rec ? "Recording… 0:07" : "Ready to record"}</span>
      </div>
      <Waveform seed={11} bars={32} active={rec} height={54} />
      <button className={`rec-btn${rec ? " on" : ""}`} onClick={() => setRec(r => !r)}>
        {rec ? "Stop" : "Start recording"}
      </button>
    </div>
  );
}

function StepName() {
  return (
    <div className="sv-inner">
      <div className="sv-form-row">
        <label className="sv-label">Voice name</label>
        <div className="sv-input">
          <span>Morning Narrator</span>
          <span className="sv-caret" />
        </div>
      </div>
      <div className="sv-form-row">
        <label className="sv-label">Category</label>
        <div className="sv-chips">
          <span className="sv-chip sv-chip-active">Narration</span>
          <span className="sv-chip">Conversational</span>
          <span className="sv-chip">Character</span>
        </div>
      </div>
      <button className="sv-save">Save to library</button>
    </div>
  );
}

function StepGenerate() {
  return (
    <div className="sv-inner">
      <div className="sv-script">
        <span className="sv-line">Welcome back to the show. Today,</span>
        <span className="sv-line">we&apos;re talking about the one thing</span>
        <span className="sv-line">every creator wishes they knew…<span className="sv-cursor" /></span>
      </div>
      <div className="sv-out">
        <div className="sv-play-btn">▶</div>
        <Waveform seed={23} bars={28} active={true} height={28} />
        <span className="sv-time">0:12</span>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Record", desc: "Speak for ten seconds. Upload a file or record right in your browser — Voicemagic captures the unique qualities of your voice.", visual: <StepRecord /> },
    { n: "02", title: "Name it", desc: "Give your voice a name, add it to your library. It's yours now — ready whenever you need it.", visual: <StepName /> },
    { n: "03", title: "Generate", desc: "Type anything. Click generate. Hear your words in your own voice, instantly. Download and use anywhere.", visual: <StepGenerate /> },
  ];
  return (
    <section id="how" className="howit">
      <div className="section-head">
        <div className="kicker">How it works</div>
        <h2 className="section-h2">It&apos;s actually this simple.</h2>
        <p className="section-sub">Three steps, under a minute. No audio engineering degree required.</p>
      </div>
      <div className="steps-rail">
        <div className="steps-connector" />
        {steps.map((s, i) => (
          <div key={i} className="step-card">
            <div className="step-meta">
              <span className="step-n">{s.n}</span>
              <h3 className="step-title">{s.title}</h3>
            </div>
            <p className="step-desc">{s.desc}</p>
            <div className="step-visual">{s.visual}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────
const IconMic = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>
  </svg>
);
const IconLibrary = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="3" y="4" width="4" height="16" rx="1"/><rect x="9" y="4" width="4" height="16" rx="1"/><path d="M16 5 L20 19" />
  </svg>
);
const IconBolt = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M13 2 L4 14 h6 l-1 8 l9 -12 h-6 z"/>
  </svg>
);
const IconDial = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="6" cy="8" r="2"/><path d="M3 8h1 M8 8h13"/>
    <circle cx="16" cy="16" r="2"/><path d="M3 16h11 M18 16h3"/>
  </svg>
);
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="9"/><path d="M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>
  </svg>
);

function Features() {
  const feats = [
    { icon: <IconMic />, title: "Voice cloning", desc: "Record 10 seconds and Voicemagic creates your digital clone. Narrate videos, record podcasts, generate voiceovers — all without sitting in front of a mic.", size: "lg" },
    { icon: <IconLibrary />, title: "200+ built-in voices", desc: "Not ready to clone your own? Choose from 200+ professionally trained voices — warm narrators, energetic presenters, calm guides." },
    { icon: <IconBolt />, title: "Instant generation", desc: "Paste your script. Hit generate. Audio ready in seconds — fast enough to use mid-workflow." },
    { icon: <IconDial />, title: "Fine-tune the output", desc: "Dial in creativity, pacing and expressiveness. Get consistent reads or dynamic, emotive delivery." },
    { icon: <IconGlobe />, title: "Works in your browser", desc: "No app to download. No plugins. Open voicemagic.dev, sign in, start generating." },
    { icon: <IconLock />, title: "Your voice is yours", desc: "Every custom voice is private to your account. Never shared. Never sold. Never used to train other models." },
  ];

  return (
    <section id="features" className="features">
      <div className="section-head">
        <div className="kicker">Features</div>
        <h2 className="section-h2">Everything you need.<br />Nothing you don&apos;t.</h2>
      </div>
      <div className="feat-grid">
        {feats.slice(0, 4).map((f, i) => (
          <div key={i} className={`feat-card${i === 0 ? " feat-card-lg" : ""}`}>
            <div className="feat-icon">{f.icon}</div>
            <h3 className="feat-title">{f.title}</h3>
            <p className="feat-desc">{f.desc}</p>
            {i === 0 && (
              <div className="feat-lg-visual">
                <div className="feat-lg-row">
                  <VoiceAvatar name="Any Voice" hue={290} size={36} />
                  <Waveform seed={17} bars={40} active={true} height={30} />
                  <span className="feat-lg-tag">cloned · 00:09</span>
                </div>
              </div>
            )}
          </div>
        ))}
        <div className="feat-row-centered">
          {feats.slice(4).map((f, i) => (
            <div key={i + 4} className="feat-card">
              <div className="feat-icon">{f.icon}</div>
              <h3 className="feat-title">{f.title}</h3>
              <p className="feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Voice Showcase ────────────────────────────────────────────────────────────
const VOICES = [
  { name: "Aaron", category: "Narrative", duration: "0:24", hue: 275, genId: "cmo83lrdt000001s543t3fgxd", transcript: "In 1969, a single line of code changed everything we thought we knew about computation." },
  { name: "Zoe", category: "Conversational", duration: "0:18", hue: 310, genId: "cmo83m4je000401s53fx160f0", transcript: "Okay so here's the thing — most people get this completely backwards, and I used to too." },
  { name: "Marcus", category: "Documentary", duration: "0:31", hue: 245, genId: "cmo83lxfw000201s5txr94h2r", transcript: "Beneath the Atlantic, at depths where sunlight has never reached, life has found a way." },
  { name: "Ines", category: "Energetic", duration: "0:15", hue: 340, genId: "cmo83m1at000301s5j9p3mfa6", transcript: "Let's GO. Today we're building something that I genuinely, seriously cannot wait to show you." },
  { name: "Theo", category: "Calm Guide", duration: "0:28", hue: 200, genId: "cmo83luiu000101s5gcerml0d", transcript: "Close your eyes. Take a breath in through your nose, and let it out slowly. You're safe here." },
];

function PlayIcon() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 4 L20 12 L7 20 Z"/></svg>;
}
function PauseIcon() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>;
}

function VoiceCard({ voice, playing, onToggle }: { voice: typeof VOICES[0]; playing: boolean; onToggle: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onToggleRef = useRef(onToggle);

  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  useEffect(() => {
    const audio = new Audio(`/api/v1/audio/${voice.genId}`);
    audioRef.current = audio;
    const handleEnded = () => onToggleRef.current();
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [voice.genId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (playing) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [playing]);

  return (
    <div className={`vcard${playing ? " vcard-playing" : ""}`}>
      <div className="vcard-accent" style={{ background: `oklch(0.6 0.2 ${voice.hue})` }} />
      <div className="vcard-top">
        <VoiceAvatar name={voice.name} hue={voice.hue} size={40} />
        <div className="vcard-meta">
          <div className="vcard-name">{voice.name}</div>
          <div className="vcard-cat">{voice.category}</div>
        </div>
        <button className="vcard-play" onClick={onToggle} aria-label="Play preview">
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
      <div className="vcard-transcript">&ldquo;{voice.transcript}&rdquo;</div>
      <div className="vcard-wf">
        <Waveform seed={voice.hue} bars={52} active={playing} height={44}
          color={`oklch(0.7 0.2 ${voice.hue})`} />
      </div>
      <div className="vcard-foot">
        <span className="vcard-dur">{voice.duration}</span>
        <span className="vcard-sep">·</span>
        <span className="vcard-tag">studio quality</span>
        <span className="vcard-try">Use this voice →</span>
      </div>
    </div>
  );
}

function VoiceShowcase() {
  const [playing, setPlaying] = useState<number | null>(null);
  return (
    <section id="voices" className="showcase showcase-lg">
      <div className="section-head">
        <div className="kicker">Voice library</div>
        <h2 className="section-h2">Don&apos;t take our word for it.<br />Press play.</h2>
        <p className="section-sub">Real outputs from Voicemagic. No post-processing. No cherry-picking.</p>
      </div>
      <div className="voice-grid">
        {VOICES.map((v, i) => (
          <VoiceCard key={i} voice={v} playing={playing === i}
            onToggle={() => setPlaying(p => p === i ? null : i)} />
        ))}
      </div>
      <div className="showcase-foot">
        <div className="foot-note">All 200+ voices available on the free tier.</div>
        <Link href="/pricing" className="foot-link">Browse the full library →</Link>
      </div>
    </section>
  );
}

// ── Use Cases ─────────────────────────────────────────────────────────────────
function UseCases() {
  const cases = [
    { tag: "Creators", title: "Record once. Narrate a hundred videos.", desc: "Clone your voice and stay consistent across all your content — even when your voice is tired or your schedule is packed.", meta: ["YouTube", "TikTok", "Shorts"] },
    { tag: "Podcasters", title: "Intros, sponsor reads, transitions — on tap.", desc: "Generate supporting audio in your own voice without booking studio time. Your voice, your brand, on demand.", meta: ["Ads", "Trailers", "Patches"] },
    { tag: "Developers", title: "Voice for your product, without the stitching.", desc: "A clean UI and a growing library — plus custom voices your users will actually recognize. REST API in private beta.", meta: ["API", "Webhooks", "SDK"] },
    { tag: "Businesses", title: "Professional voiceovers, without a voice actor.", desc: "Ads, explainers, customer support audio — polished on any budget, consistent across every channel.", meta: ["Training", "Support", "Marketing"] },
  ];
  return (
    <section className="usecases">
      <div className="section-head">
        <div className="kicker">Who it&apos;s for</div>
        <h2 className="section-h2">Built for people who make things.</h2>
      </div>
      <div className="uc-grid">
        {cases.map((c, i) => (
          <div key={i} className="uc-card">
            <div className="uc-top">
              <span className="uc-tag">{c.tag}</span>
              <span className="uc-num">0{i + 1}</span>
            </div>
            <h3 className="uc-title">{c.title}</h3>
            <p className="uc-desc">{c.desc}</p>
            <div className="uc-meta">
              {c.meta.map((m, j) => <span key={j} className="uc-pill">{m}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Pricing ──────────────────────────────────────────────────────────────────
const PRICING_PLANS = [
  {
    name: "Free",
    key: "free",
    eyebrow: "No credit card required",
    price: "$0",
    cadence: "forever",
    credits: "10k credits / month",
    voiceLimit: "1 custom voice",
    description: "Try Voicemagic, test the voices, and generate real audio without putting a card on file.",
    cta: "Start free",
    href: "/sign-up",
    features: [
      "200+ built-in voices",
      "10k monthly generation credits",
      "1 custom voice clone",
      "WAV downloads",
      "Browser recording",
    ],
  },
  {
    name: "Standard",
    key: "standard",
    eyebrow: "For regular creators",
    price: "$12",
    cadence: "per month",
    credits: "250k credits / month",
    voiceLimit: "10 custom voices",
    description: "The practical plan for videos, podcasts, support snippets, and weekly production work.",
    cta: "Upgrade to Standard",
    href: "/sign-up",
    highlighted: true,
    features: [
      "Everything in Free",
      "250k monthly generation credits",
      "10 custom voice clones",
      "Priority generation queue",
      "Commercial usage",
      "Email support",
    ],
  },
  {
    name: "Pro",
    key: "pro",
    eyebrow: "For heavier workflows",
    price: "$29",
    cadence: "per month",
    credits: "1M credits / month",
    voiceLimit: "50 custom voices",
    description: "For teams, automation, API workflows, and larger content libraries that need headroom.",
    cta: "Go Pro",
    href: "/sign-up",
    features: [
      "Everything in Standard",
      "1M monthly generation credits",
      "50 custom voice clones",
      "API access",
      "Early feature access",
      "Priority support",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="pricing-sec">
      <div className="pricing-orbit pricing-orbit-1" />
      <div className="pricing-orbit pricing-orbit-2" />
      <div className="section-head pricing-head">
        <div className="kicker">Pricing</div>
        <h2 className="section-h2">Simple credits. Generous limits.</h2>
        <p className="section-sub">
          We run Voicemagic lean, so pricing is based on practical usage instead
          of scary AI-token math. Start free, then upgrade when you need more room.
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
                <h3 className="price-name">{plan.name}</h3>
              </div>
              <div className="price-chip">{plan.credits}</div>
            </div>

            <div className="price-row">
              <span className="price-value">{plan.price}</span>
              <span className="price-cadence">/{plan.cadence}</span>
            </div>
            <p className="price-desc">{plan.description}</p>

            <div className="credit-meter" aria-hidden="true">
              <span className={`credit-fill credit-fill-${plan.key}`} />
            </div>
            <div className="price-meta">
              <span>{plan.voiceLimit}</span>
              <span>1 credit ≈ 1 character</span>
            </div>

            <Link
              href={plan.href}
              className={`price-cta${plan.highlighted ? " price-cta-primary" : ""}`}
            >
              {plan.cta}
              <span>→</span>
            </Link>

            <ul className="price-features">
              {plan.features.map((feature) => (
                <li key={feature}>
                  <span className="price-check">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

// ── API Section ───────────────────────────────────────────────────────────────
const CodeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 6 L2 12 L8 18" /><path d="M16 6 L22 12 L16 18" /><path d="M14 4 L10 20" />
  </svg>
);
const AgentIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="7" width="16" height="12" rx="3" />
    <path d="M12 3 L12 7" /><circle cx="12" cy="3" r="1" />
    <circle cx="9" cy="13" r="1" /><circle cx="15" cy="13" r="1" />
    <path d="M9 17 L15 17" />
  </svg>
);

const SNIPPETS: Record<string, string> = {
  curl: `curl https://api.voicemagic.dev/v1/tts \\
  -H "Authorization: Bearer vm_live_••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "voice": "aaron_vale",
    "text": "Welcome back to the show.",
    "format": "mp3"
  }' --output out.mp3`,
  node: `import { Voicemagic } from "voicemagic";

const vm = new Voicemagic({ apiKey: process.env.VM_KEY });

const audio = await vm.tts.generate({
  voice: "aaron_vale",
  text: "Welcome back to the show.",
  format: "mp3"
});

await audio.save("./out.mp3");`,
  mcp: `{
  "mcpServers": {
    "voicemagic": {
      "url": "https://api.voicemagic.dev/mcp",
      "headers": {
        "Authorization": "Bearer vm_live_••••"
      }
    }
  }
}`,
};

function ApiSection() {
  const [tab, setTab] = useState<"curl" | "node" | "mcp">("curl");
  return (
    <section id="api" className="api-sec">
      <div className="api-bg-glow" />
      <div className="api-inner">
        <div className="api-head">
          <div className="kicker">For developers &amp; agents</div>
          <h2 className="section-h2">Plug voice into anything.</h2>
          <p className="section-sub">
            A clean REST API for your backend. A native MCP server for your agents. Same voices, same quality — now programmable.
          </p>
        </div>
        <div className="api-grid">
          <div className="api-codewell">
            <div className="api-tabs">
              {(["curl", "node", "mcp"] as const).map(t => (
                <button key={t} className={`api-tab${tab === t ? " on" : ""}`} onClick={() => setTab(t)}>
                  <span className="api-tab-dot" />
                  {t === "curl" ? "cURL" : t === "node" ? "Node SDK" : "MCP config"}
                </button>
              ))}
              <div className="api-tab-spacer" />
              <div className="api-endpoint">
                <span className="api-method">POST</span>
                <span className="api-url">/v1/tts</span>
              </div>
            </div>
            <pre className="api-code"><code>{SNIPPETS[tab]}</code></pre>
            <div className="api-response">
              <div className="api-resp-row">
                <span className="api-resp-dot" />
                <span className="api-resp-label">200 OK</span>
                <span className="api-resp-time">· 612 ms</span>
                <span className="api-resp-size">· 84 KB audio/mpeg</span>
              </div>
              <div className="api-resp-wave">
                <Waveform seed={77} bars={72} active={true} height={26}
                  color="oklch(0.75 0.2 295deg)" />
              </div>
            </div>
          </div>

          <div className="api-cards">
            <div className="api-card">
              <div className="api-card-icon"><CodeIcon /></div>
              <h3 className="api-card-title">REST API</h3>
              <p className="api-card-desc">Generate audio, list voices, upload clones. Webhooks for long jobs. Typed SDKs for Node, Python, Go.</p>
              <div className="api-card-meta">
                <span className="api-pill">/v1/tts</span>
                <span className="api-pill">/v1/voices</span>
                <span className="api-pill">/v1/clones</span>
              </div>
            </div>
            <div className="api-card api-card-mcp">
              <div className="api-card-badge">New</div>
              <div className="api-card-icon api-card-icon-accent"><AgentIcon /></div>
              <h3 className="api-card-title">MCP for agents</h3>
              <p className="api-card-desc">Drop Voicemagic into Claude, Cursor, or any MCP-compatible agent. Your agent can generate speech as a tool — no plumbing required.</p>
              <div className="api-card-meta">
                <span className="api-pill">tts.generate</span>
                <span className="api-pill">voices.list</span>
                <span className="api-pill">clones.create</span>
              </div>
            </div>
            <div className="api-stats">
              <div className="api-stat">
                <div className="api-stat-n">&lt;800ms</div>
                <div className="api-stat-l">p50 latency</div>
              </div>
              <div className="api-stat">
                <div className="api-stat-n">99.95%</div>
                <div className="api-stat-l">uptime SLA</div>
              </div>
              <div className="api-stat">
                <div className="api-stat-n">10k req/day</div>
                <div className="api-stat-l">free tier</div>
              </div>
            </div>
          </div>
        </div>
        <div className="api-foot">
          <Link href="/docs" className="btn btn-ghost btn-lg">Read the docs →</Link>
          <Link href="/sign-up" className="btn btn-primary btn-lg">Get an API key</Link>
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="fcta-glow" />
      <div className="fcta-inner">
        <div className="fcta-sculpture">
          <Waveform seed={91} bars={96} active={true} height={80} />
        </div>
        <h2 className="fcta-h2">
          Your voice is your most<br />powerful tool.
          <span className="fcta-h2-alt"> Start using it.</span>
        </h2>
        <p className="fcta-sub">Sign up free. Clone your first voice in under a minute. No credit card required.</p>
        <div className="fcta-ctas">
          <Link href="/pricing" className="btn btn-primary btn-xl">
            Get Started Free
            <span className="btn-arrow">→</span>
          </Link>
        </div>
        <div className="fcta-below">Already have an account? <Link href="/sign-in" className="fcta-signin">Sign in</Link></div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="vm-foot">
      <div className="foot-inner">
        <div className="foot-brand">
          <div className="foot-wordmark">Voicemagic</div>
          <div className="foot-tag">AI voice cloning for everyone.</div>
        </div>
        <div className="foot-cols">
          <div className="foot-col">
            <div className="foot-head">Product</div>
            <a href="#features">Features</a>
            <a href="#voices">Voices</a>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div className="foot-col">
            <div className="foot-head">Developers</div>
            <Link href="/docs">Documentation</Link>
            <Link href="/docs">API reference</Link>
          </div>
          <div className="foot-col">
            <div className="foot-head">Company</div>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="foot-col">
            <div className="foot-head">Legal</div>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/acceptable-use">Acceptable use</Link>
          </div>
        </div>
      </div>
      <div className="foot-base">
        <div>© 2026 Voicemagic Inc.</div>
        <div>voicemagic.dev</div>
      </div>
    </footer>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <div className="vm-page">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <VoiceShowcase />
      <UseCases />
      <PricingSection />
      <ApiSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
