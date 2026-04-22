"use client";

import { useApp } from "@/lib/AppContext";
import { PAGES } from "@/lib/routes";
import { ButtonPrimary, ButtonSecondary } from "./ui/Button";

const FEATURES = [
  { icon: "🎨", title: "Inventory System",   desc: "Track every product by category, shade & notes" },
  { icon: "✨", title: "Look Generator",      desc: "Full routines built from your exact products" },
  { icon: "🔬", title: "Fix My Makeup",       desc: "Diagnose issues and get instant corrections" },
  { icon: "✦",  title: "Smart Pairings",      desc: "Colour harmony and product combination logic" },
  { icon: "🤖", title: "AI Evaluation",       desc: "Upload a selfie — get scored on 6 makeup zones" },
  { icon: "📖", title: "Expert Guides",       desc: "In-depth articles on application and colour theory" },
];

export default function HomePage({ setPage }) {
  const { inventory, profile, hydrated } = useApp();
  const hasProfile = !!profile?.skinTone;

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="text-center py-20 relative">
        <div
          className="absolute inset-x-0 top-0 h-72 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, #fff1f2 0%, transparent 80%)",
          }}
        />

        <div className="relative inline-flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
          <span className="text-xs text-rose-600 tracking-widest uppercase font-semibold">
            Personal Makeup Intelligence
          </span>
        </div>

        <h1 className="relative font-serif text-4xl md:text-6xl font-bold text-nude-800 leading-tight tracking-tight mb-5">
          Your products.<br />
          <span className="text-rose-600">Infinite looks.</span>
        </h1>

        <p className="relative text-nude-500 text-lg md:text-xl max-w-lg mx-auto leading-relaxed mb-8">
          Stop guessing what to wear. Add your makeup stash once, set your skin
          profile, and get optimised routines for any occasion — using only what
          you already own.
        </p>

        <div className="relative flex flex-wrap gap-3 justify-center">
          <ButtonPrimary onClick={() => setPage(hydrated && inventory.length ? PAGES.GENERATE : PAGES.INVENTORY)}>
            {hydrated && inventory.length ? "✨ Generate a Look" : "→ Start with Your Products"}
          </ButtonPrimary>
          {!hasProfile && (
            <ButtonSecondary onClick={() => setPage(PAGES.PROFILE)}>
              Set Skin Profile
            </ButtonSecondary>
          )}
        </div>

        {/* Stats row */}
        {hydrated && inventory.length > 0 && (
          <div className="relative mt-10 flex flex-wrap gap-8 justify-center">
            {[
              { n: inventory.length, label: "Products" },
              { n: new Set(inventory.map((p) => p.category)).size, label: "Categories" },
              { n: 8, label: "Occasions Ready" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-serif text-3xl font-bold text-rose-600">{s.n}</div>
                <div className="text-nude-400 text-xs uppercase tracking-widest mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="mb-16">
        <h2 className="font-serif text-2xl text-nude-800 text-center mb-8">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { n: 1, icon: "🧴", label: "Build Inventory",    desc: "Add your makeup products once — brand, shade, notes.", page: PAGES.INVENTORY, cta: "Add Products" },
            { n: 2, icon: "✦",  label: "Set Skin Profile",   desc: "Skin tone, undertone, type, and face shape.", page: PAGES.PROFILE,   cta: "Set Profile" },
            { n: 3, icon: "✨", label: "Generate a Look",    desc: "Receive a full routine for any occasion.",            page: PAGES.GENERATE,  cta: "Create Look" },
            { n: 4, icon: "🤖", label: "AI Evaluation",      desc: "Upload a selfie — get scored on every zone.",         page: PAGES.EVALUATE,  cta: "Evaluate Now" },
          ].map((step) => (
            <div
              key={step.n}
              onClick={() => setPage(step.page)}
              className="relative bg-white border border-nude-100 rounded-2xl p-7 cursor-pointer
                         hover:border-rose-200 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 overflow-hidden"
            >
              <span className="absolute top-4 right-5 font-serif text-5xl font-bold text-nude-100 select-none">
                {step.n}
              </span>
              <span className="text-3xl block mb-4">{step.icon}</span>
              <h3 className="font-serif text-lg font-bold text-nude-800 mb-1.5">{step.label}</h3>
              <p className="text-nude-400 text-sm leading-relaxed mb-4">{step.desc}</p>
              <span className="text-rose-600 text-sm font-semibold">{step.cta} →</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────────────────── */}
      <section
        className="rounded-2xl p-8 mb-16"
        style={{ background: "#faf7f4" }}
      >
        <h2 className="font-serif text-2xl text-nude-800 text-center mb-8">
          Everything your makeup bag needs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-3 items-start">
              <span className="text-2xl shrink-0">{f.icon}</span>
              <div>
                <div className="font-semibold text-sm text-nude-800 mb-0.5">{f.title}</div>
                <div className="text-xs text-nude-400 leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
