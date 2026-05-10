"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { PAGES } from "@/lib/routes";
import { TRENDING_LOOKS, SOCIAL_PROOF, MARQUEE_ITEMS } from "@/lib/trending";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { ButtonPrimary, ButtonSecondary } from "./ui/Button";

// ── SVG Illustrated Face ──────────────────────────────────────────────────
function FaceIllustration() {
  return (
    <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[300px] md:max-w-[340px] drop-shadow-xl">
      <defs>
        <radialGradient id="skinGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#f5e6d3"/>
          <stop offset="100%" stopColor="#e8c9a8"/>
        </radialGradient>
        <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fb7185" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#fb7185" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="hlGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
        </radialGradient>
        <filter id="softBlur">
          <feGaussianBlur stdDeviation="2.5"/>
        </filter>
        <filter id="glowFilter">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="lipGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e11d48"/>
          <stop offset="100%" stopColor="#9f1239"/>
        </linearGradient>
        <linearGradient id="eyeshadowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b87aaa"/>
          <stop offset="100%" stopColor="#7d3f71" stopOpacity="0.6"/>
        </linearGradient>
        <clipPath id="faceClip">
          <ellipse cx="160" cy="175" rx="118" ry="145"/>
        </clipPath>
      </defs>

      {/* Neck */}
      <rect x="135" y="300" width="50" height="55" rx="8" fill="#e8c9a8"/>

      {/* Face base */}
      <ellipse cx="160" cy="175" rx="118" ry="145" fill="url(#skinGrad)"/>

      {/* Hair — top */}
      <ellipse cx="160" cy="68" rx="122" ry="52" fill="#3d2010"/>
      <ellipse cx="50" cy="120" rx="38" ry="100" fill="#3d2010"/>
      <ellipse cx="270" cy="120" rx="38" ry="100" fill="#3d2010"/>
      {/* Hair highlight */}
      <ellipse cx="140" cy="55" rx="45" ry="20" fill="#6b3a1f" opacity="0.5"/>

      {/* Blush — left */}
      <ellipse cx="82" cy="218" rx="42" ry="30" fill="url(#blushGrad)" filter="url(#softBlur)"/>
      {/* Blush — right */}
      <ellipse cx="238" cy="218" rx="42" ry="30" fill="url(#blushGrad)" filter="url(#softBlur)"/>

      {/* Eyeshadow left */}
      <ellipse cx="107" cy="152" rx="32" ry="14" fill="url(#eyeshadowGrad)" opacity="0.75" filter="url(#softBlur)"/>
      {/* Eyeshadow right */}
      <ellipse cx="213" cy="152" rx="32" ry="14" fill="url(#eyeshadowGrad)" opacity="0.75" filter="url(#softBlur)"/>

      {/* Eyes white left */}
      <ellipse cx="107" cy="162" rx="26" ry="14" fill="white"/>
      {/* Eyes white right */}
      <ellipse cx="213" cy="162" rx="26" ry="14" fill="white"/>
      {/* Iris left */}
      <circle cx="107" cy="162" r="9" fill="#5c3d1e"/>
      <circle cx="107" cy="162" r="5.5" fill="#2e1a0e"/>
      <circle cx="103" cy="158" r="2" fill="white" opacity="0.9"/>
      {/* Iris right */}
      <circle cx="213" cy="162" r="9" fill="#5c3d1e"/>
      <circle cx="213" cy="162" r="5.5" fill="#2e1a0e"/>
      <circle cx="209" cy="158" r="2" fill="white" opacity="0.9"/>

      {/* Eyeliner upper left */}
      <path d="M81 155 Q107 148 133 155 L135 158 Q107 151 79 158 Z" fill="#1a0a00" opacity="0.9"/>
      {/* Eyeliner wing left */}
      <path d="M133 155 L142 149 L135 158 Z" fill="#1a0a00"/>
      {/* Eyeliner upper right */}
      <path d="M187 155 Q213 148 239 155 L241 158 Q213 151 185 158 Z" fill="#1a0a00" opacity="0.9"/>
      {/* Eyeliner wing right */}
      <path d="M187 155 L178 149 L185 158 Z" fill="#1a0a00"/>

      {/* Lashes left (simple dashes) */}
      {[84,92,100,108,116,124,131].map((x,i) => (
        <line key={i} x1={x} y1="155" x2={x-1} y2={147} stroke="#1a0a00" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
      {/* Lashes right */}
      {[189,197,205,213,221,229,236].map((x,i) => (
        <line key={i} x1={x} y1="155" x2={x+1} y2={147} stroke="#1a0a00" strokeWidth="1.5" strokeLinecap="round"/>
      ))}

      {/* Eyebrows left */}
      <path d="M78 138 Q107 128 135 136" stroke="#3d2010" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M78 138 Q107 128 135 136" stroke="#5c3d1e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Eyebrows right */}
      <path d="M185 136 Q213 128 242 138" stroke="#3d2010" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M185 136 Q213 128 242 138" stroke="#5c3d1e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

      {/* Nose */}
      <path d="M147 198 Q140 214 148 220 Q160 224 172 220 Q180 214 173 198" stroke="#c4a882" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

      {/* Lips */}
      <path d="M130 258 Q145 250 160 252 Q175 250 190 258 Q180 268 160 270 Q140 268 130 258 Z" fill="url(#lipGrad)"/>
      {/* Upper lip */}
      <path d="M130 258 Q142 262 160 260 Q178 262 190 258 Q182 252 170 248 Q160 246 150 248 Q138 252 130 258 Z" fill="#e11d48"/>
      {/* Cupid bow */}
      <path d="M143 250 Q152 244 160 247 Q168 244 177 250" stroke="#9f1239" strokeWidth="1" fill="none"/>
      {/* Lip highlight */}
      <ellipse cx="152" cy="264" rx="10" ry="3" fill="white" opacity="0.25" filter="url(#softBlur)"/>

      {/* Highlighter cheekbones */}
      <ellipse cx="90" cy="200" rx="22" ry="10" fill="url(#hlGrad)" filter="url(#softBlur)"/>
      <ellipse cx="230" cy="200" rx="22" ry="10" fill="url(#hlGrad)" filter="url(#softBlur)"/>
      {/* Bridge highlight */}
      <ellipse cx="160" cy="185" rx="6" ry="18" fill="url(#hlGrad)" filter="url(#softBlur)"/>

      {/* Floating product dots */}
      <circle cx="290" cy="100" r="14" fill="#fb7185" opacity="0.15" className="animate-float"/>
      <circle cx="30"  cy="130" r="10" fill="#b87aaa" opacity="0.18" className="animate-float-delayed"/>
      <circle cx="295" cy="260" r="9"  fill="#e8956a" opacity="0.15" className="animate-float-slow"/>
      <circle cx="25"  cy="270" r="12" fill="#fecdd3" opacity="0.2" className="animate-float"/>
    </svg>
  );
}

// ── Floating product badges ───────────────────────────────────────────────
function FloatingBadge({ children, style, className = "" }) {
  return (
    <div
      className={`absolute glass rounded-2xl px-3 py-2 shadow-lg text-xs font-semibold
                  font-sans text-nude-700 border border-white/80 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// ── Trending Look Card ────────────────────────────────────────────────────
function TrendingCard({ look, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl overflow-hidden border border-nude-100
                 hover:border-rose-200 hover:-translate-y-1 hover:shadow-lg
                 transition-all duration-300 cursor-pointer"
    >
      {/* Palette header */}
      <div className="h-20 flex">
        {look.palette.map((hex, i) => (
          <div key={i} className="flex-1 transition-all duration-300 group-hover:flex-[1.2]"
               style={{ background: hex }} />
        ))}
      </div>

      {/* Badge */}
      <div className="absolute top-3 left-3">
        <span className="pill bg-white/90 text-nude-700 backdrop-blur-sm shadow-sm">
          {look.season}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-serif text-base font-semibold text-nude-800 mb-1">{look.name}</h3>
        <p className="text-xs text-nude-400 leading-relaxed mb-3 line-clamp-2">{look.desc}</p>
        <div className="flex flex-wrap gap-1.5">
          {look.keywords.map((kw) => (
            <span key={kw} className="pill bg-nude-50 text-nude-500">{kw}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Testimonial Card ──────────────────────────────────────────────────────
function TestimonialCard({ t }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-nude-100 flex flex-col gap-4 h-full">
      <div className="flex-1">
        {/* Stars */}
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#fb7185">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          ))}
        </div>
        <p className="text-sm text-nude-600 leading-relaxed italic font-sans">"{t.text}"</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold font-sans shrink-0"
             style={{ background: t.avatarColor }}>
          {t.avatar}
        </div>
        <div>
          <div className="text-sm font-semibold text-nude-800 font-sans">{t.name}</div>
          <div className="text-xs text-nude-400 font-sans">{t.handle}</div>
        </div>
        <span className="ml-auto pill bg-rose-50 text-rose-500">{t.look}</span>
      </div>
    </div>
  );
}

// ── Marquee strip ─────────────────────────────────────────────────────────
function MarqueeStrip() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="marquee-wrap py-3 bg-nude-800 overflow-hidden">
      <div className="marquee-track animate-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="mx-6 text-nude-200 text-xs font-sans font-medium tracking-wide whitespace-nowrap">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Stat counter ──────────────────────────────────────────────────────────
function StatCounter({ n, label, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        let start = 0;
        const end = n;
        const duration = 1400;
        const startTime = performance.now();
        function tick(now) {
          const t = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setCount(Math.round(eased * end));
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [n]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-serif text-4xl md:text-5xl font-bold text-shimmer mb-1">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-nude-500 text-sm font-sans">{label}</div>
    </div>
  );
}

// ── Main HomePage ─────────────────────────────────────────────────────────
export default function HomePage({ setPage }) {
  const { inventory, profile, hydrated } = useApp();
  const revealRef  = useScrollReveal();
  const reveal2Ref = useScrollReveal();
  const reveal3Ref = useScrollReveal();
  const reveal4Ref = useScrollReveal();
  const hasProfile = !!profile?.skinTone;

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden"
               style={{ background: "linear-gradient(135deg, #fdfaf8 0%, #fff1f2 40%, #f8f2f7 100%)" }}>

        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-20 animate-orb"
               style={{ background: "radial-gradient(circle, #fb7185, transparent 70%)", filter: "blur(40px)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 animate-orb-alt"
               style={{ background: "radial-gradient(circle, #b87aaa, transparent 70%)", filter: "blur(50px)" }} />
          <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full opacity-10 animate-orb"
               style={{ background: "radial-gradient(circle, #e8956a, transparent 70%)", filter: "blur(35px)", animationDelay: "4s" }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left — Copy */}
          <div className="flex flex-col items-start">

            {/* Live badge */}
            <div className="animate-fade-in flex items-center gap-2 bg-white/80 backdrop-blur-sm
                            border border-rose-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block" />
              <span className="text-xs text-rose-600 font-semibold font-sans tracking-wide uppercase">
                AI Makeup Intelligence · Free
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up font-serif text-5xl md:text-6xl lg:text-7xl font-bold
                           text-nude-800 leading-[1.05] tracking-tight mb-6">
              Your beauty,
              <br />
              <span className="text-shimmer italic">elevated.</span>
            </h1>

            <p className="animate-fade-up font-sans text-lg text-nude-500 max-w-md leading-relaxed mb-8"
               style={{ animationDelay: "100ms" }}>
              Add your makeup products once. Set your skin profile. Get AI-powered routines,
              real-time evaluations, and expert guidance — all personalised to{" "}
              <em className="text-nude-700 not-italic font-medium">you</em>.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up flex flex-wrap gap-3 mb-10"
                 style={{ animationDelay: "200ms" }}>
              <ButtonPrimary
                onClick={() => setPage(hydrated && inventory.length ? PAGES.GENERATE : PAGES.INVENTORY)}>
                {hydrated && inventory.length ? "✨ Generate My Look" : "→ Get Started Free"}
              </ButtonPrimary>
              <ButtonSecondary onClick={() => setPage(PAGES.EVALUATE)}>
                🤖 Try AI Evaluation
              </ButtonSecondary>
            </div>

            {/* Mini social proof */}
            <div className="animate-fade-in flex items-center gap-3" style={{ animationDelay: "350ms" }}>
              <div className="flex -space-x-2">
                {[["#fb7185","A"],["#b87aaa","P"],["#e8956a","S"],["#7d3f71","Z"]].map(([c,l],i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center
                                          justify-center text-white text-xs font-bold font-sans"
                       style={{ background: c }}>
                    {l}
                  </div>
                ))}
              </div>
              <div className="font-sans">
                <div className="flex items-center gap-1">
                  {Array.from({length:5}).map((_,i)=>(
                    <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#fb7185">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  ))}
                  <span className="text-xs text-nude-600 ml-1">4.9 / 5</span>
                </div>
                <div className="text-xs text-nude-400">loved by beauty enthusiasts</div>
              </div>
            </div>

            {/* Quick stats for returning user */}
            {hydrated && inventory.length > 0 && (
              <div className="animate-fade-up mt-8 flex gap-6 p-4 bg-white/70 backdrop-blur-sm
                              rounded-2xl border border-nude-100 shadow-sm">
                {[
                  { n: inventory.length, label: "Products" },
                  { n: new Set(inventory.map(p => p.category)).size, label: "Categories" },
                  { n: 8, label: "Occasions" },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="font-serif text-2xl font-bold text-rose-600">{s.n}</div>
                    <div className="text-nude-400 text-xs font-sans uppercase tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Illustrated face + floating badges */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in"
               style={{ animationDelay: "200ms" }}>
            <div className="relative">
              <FaceIllustration />

              {/* Floating product labels */}
              <FloatingBadge
                className="animate-float"
                style={{ top: "8%", right: "-8%", animationDelay: "0s" }}>
                💄 Soft Glam Look
              </FloatingBadge>
              <FloatingBadge
                className="animate-float-delayed"
                style={{ top: "38%", left: "-14%", animationDelay: "0.8s" }}>
                ✨ 94/100 AI Score
              </FloatingBadge>
              <FloatingBadge
                className="animate-float-slow"
                style={{ bottom: "20%", right: "-10%", animationDelay: "1.4s" }}>
                🌸 Warm Undertone
              </FloatingBadge>
              <FloatingBadge
                className="animate-float"
                style={{ bottom: "5%", left: "-6%", animationDelay: "0.4s" }}>
                ✦ 12 Products Used
              </FloatingBadge>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          MARQUEE STRIP
      ══════════════════════════════════════════════════════════════ */}
      <MarqueeStrip />

      {/* ══════════════════════════════════════════════════════════════
          TRENDING LOOKS
      ══════════════════════════════════════════════════════════════ */}
      <section ref={revealRef} className="py-20 px-6 max-w-6xl mx-auto">
        <div className="reveal text-center mb-12">
          <span className="pill bg-rose-50 text-rose-600 mb-4 inline-block">Trending Now</span>
          <h2 className="font-serif text-4xl font-bold text-nude-800 mb-3">
            Discover your next look
          </h2>
          <p className="font-sans text-nude-400 text-base max-w-md mx-auto mb-2">
            From quiet luxury to bold glam — see which of these trending aesthetics
            matches your products and vibe.
          </p>
          <button
            onClick={() => setPage(PAGES.LIBRARY)}
            className="text-rose-600 text-sm font-semibold font-sans cursor-pointer
                       bg-transparent border-none hover:underline"
          >
            Browse all {24} looks in the library →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TRENDING_LOOKS.map((look, i) => (
            <div key={look.id}
                 className={`reveal reveal-delay-${Math.min(i + 1, 6)}`}>
              <TrendingCard look={look} onClick={() => setPage(PAGES.GENERATE)} />
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS — 4 STEPS
      ══════════════════════════════════════════════════════════════ */}
      <section ref={reveal2Ref}
               className="py-20 px-6"
               style={{ background: "linear-gradient(180deg, #fdfaf8 0%, #fff1f2 50%, #fdfaf8 100%)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="reveal text-center mb-14">
            <span className="pill bg-nude-100 text-nude-600 mb-4 inline-block">How it works</span>
            <h2 className="font-serif text-4xl font-bold text-nude-800 mb-3">Four steps to flawless</h2>
            <p className="font-sans text-nude-400 max-w-sm mx-auto">
              Set up once, use every day. The whole experience takes under 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n:"01", icon:"🧴", label:"Add Products",     desc:"Drop in your makeup stash — brand, shade, finish. Takes 2 minutes.", page: PAGES.INVENTORY, cta:"Add Products" },
              { n:"02", icon:"✦",  label:"Build Profile",    desc:"Skin tone, undertone, type, face shape. Personalises every result.", page: PAGES.PROFILE,   cta:"Set Profile" },
              { n:"03", icon:"📚", label:"Browse Library",   desc:"24 curated looks. See which ones your stash can already recreate.", page: PAGES.LIBRARY,   cta:"Browse Looks" },
              { n:"04", icon:"✨", label:"Generate a Look",  desc:"Pick occasion and intensity. Get a full routine from your products.", page: PAGES.GENERATE,  cta:"Generate" },
            ].map((step, i) => (
              <div key={step.n}
                   onClick={() => setPage(step.page)}
                   className={`reveal reveal-delay-${i + 1} group relative bg-white rounded-2xl p-6
                               border border-nude-100 cursor-pointer overflow-hidden
                               hover:border-rose-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300`}>
                {/* Step number watermark */}
                <span className="absolute -top-2 -right-1 font-serif text-8xl font-bold text-nude-100
                                 select-none group-hover:text-rose-50 transition-colors duration-300">
                  {step.n}
                </span>
                <div className="relative">
                  <span className="text-3xl block mb-4">{step.icon}</span>
                  <h3 className="font-serif text-lg font-bold text-nude-800 mb-2">{step.label}</h3>
                  <p className="font-sans text-nude-400 text-sm leading-relaxed mb-5">{step.desc}</p>
                  <span className="font-sans text-rose-600 text-sm font-semibold group-hover:gap-2 flex items-center gap-1.5 transition-all">
                    {step.cta}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-nude-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter n={20}   label="Makeup categories"    suffix="+" />
          <StatCounter n={8}    label="Occasions covered"               />
          <StatCounter n={468}  label="Face landmarks tracked"          />
          <StatCounter n={100}  label="% browser-private"    suffix="%" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES DEEP DIVE
      ══════════════════════════════════════════════════════════════ */}
      <section ref={reveal3Ref} className="py-20 px-6 max-w-6xl mx-auto">
        <div className="reveal text-center mb-14">
          <span className="pill bg-mauve-100 text-mauve-600 mb-4 inline-block">Features</span>
          <h2 className="font-serif text-4xl font-bold text-nude-800 mb-3">
            Everything your makeup bag needs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon:"🎨", color:"#fff1f2", border:"#fecdd3", title:"Smart Inventory",
              desc:"Track every product — brand, shade, finish, formula. Filter and search instantly. Gap analysis shows exactly what's missing." },
            { icon:"✨", color:"#f8f2f7", border:"#dfc0d8", title:"Look Generator",
              desc:"Pick your occasion and intensity — get a full step-by-step routine using only what you already own, with why-it-works science." },
            { icon:"🔬", color:"#fdf4f0", border:"#f6cdb5", title:"Fix My Makeup",
              desc:"Describe any problem — cakey, orange, flat, creasing. Get an instant root cause diagnosis and numbered correction steps." },
            { icon:"🤖", color:"#fff1f2", border:"#fecdd3", title:"AI Face Analysis",
              desc:"MediaPipe FaceMesh detects 468 landmarks. Scores your skin, eyes, brows, blush, and lips. Fully private — never leaves your device." },
            { icon:"💡", color:"#f8f2f7", border:"#dfc0d8", title:"Smart Pairings",
              desc:"Colour harmony logic pairs your blush with your lip shade, balances eye and cheek intensity, and flags technique improvements." },
            { icon:"📖", color:"#fdf4f0", border:"#f6cdb5", title:"Expert Guides",
              desc:"Five deep-dive articles on skin tone, face shapes, foundation technique, colour theory, and beginner application — searchable and free." },
          ].map((f, i) => (
            <div key={f.title}
                 className={`reveal reveal-delay-${Math.min(i + 1, 6)} rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1`}
                 style={{ background: f.color, borderColor: f.border }}>
              <span className="text-3xl block mb-4">{f.icon}</span>
              <h3 className="font-serif text-lg font-bold text-nude-800 mb-2">{f.title}</h3>
              <p className="font-sans text-nude-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <section ref={reveal4Ref}
               className="py-20 px-6"
               style={{ background: "linear-gradient(135deg, #fdf4f0, #f8f2f7)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="reveal text-center mb-12">
            <span className="pill bg-white text-nude-600 mb-4 inline-block shadow-sm">Real users</span>
            <h2 className="font-serif text-4xl font-bold text-nude-800 mb-3">
              They tried it. Here's what happened.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SOCIAL_PROOF.map((t, i) => (
              <div key={t.name} className={`reveal reveal-delay-${i + 1}`}>
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 text-center relative overflow-hidden"
               style={{ background: "linear-gradient(135deg, #4d3c28 0%, #7d3f71 50%, #9f1239 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-10"
               style={{ background: "radial-gradient(circle, #fecdd3, transparent)", filter: "blur(40px)" }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10"
               style={{ background: "radial-gradient(circle, #b87aaa, transparent)", filter: "blur(40px)" }} />
        </div>
        <div className="relative max-w-xl mx-auto">
          <div className="text-5xl mb-6">✦</div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Your best look is{" "}
            <span className="italic text-rose-200">already</span> in your bag.
          </h2>
          <p className="font-sans text-nude-200 text-lg mb-10 leading-relaxed">
            You own the products. We provide the intelligence.
            No subscriptions, no data collection, no excuses.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <ButtonPrimary
              onClick={() => setPage(hydrated && inventory.length ? PAGES.GENERATE : PAGES.INVENTORY)}
              className="!bg-white !text-rose-600 hover:!bg-rose-50"
              style={{ background:"#fff", color:"#e11d48" }}>
              {hydrated && inventory.length ? "✨ Generate My Look" : "→ Start Free Now"}
            </ButtonPrimary>
            {!hasProfile && (
              <button
                onClick={() => setPage(PAGES.PROFILE)}
                className="font-sans text-nude-200 border border-nude-400 rounded-full px-6 py-3
                           text-sm font-medium cursor-pointer hover:border-white hover:text-white
                           transition-all bg-transparent">
                Set Skin Profile
              </button>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
