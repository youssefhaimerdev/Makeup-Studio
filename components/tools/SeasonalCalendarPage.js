"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { LIBRARY_LOOKS } from "@/lib/lookLibrary";
import { matchLookToInventory, READINESS_META } from "@/lib/inventoryMatcher";
import { PAGES } from "@/lib/routes";

const SEASONS = [
  {
    id: "spring",
    label: "Spring",
    emoji: "🌸",
    months: "Mar – May",
    palette: ["#f5b8c8", "#f8c8d8", "#d4a8c8", "#e8d0f8"],
    desc: "Soft pastels, rosy cheeks, and dewy skin. Spring 2025 is all about lavender eyeshadow, strawberry blush, and barely-there bases.",
    trending: ["Spring Pastels", "Clean Girl", "Coquette"],
    tips: [
      "Switch to a lighter foundation — swap full coverage for a tinted moisturiser",
      "Pink and lavender eyeshadow without any crease work reads perfectly fresh",
      "Blush high on the cheekbones for a spring-lifted effect",
      "Glossy lips over a nude liner feels modern and seasonal",
    ],
    slugs: ["spring-pastels", "clean-girl", "coquette"],
  },
  {
    id: "summer",
    label: "Summer",
    emoji: "☀️",
    months: "Jun – Aug",
    palette: ["#e8956a", "#d06038", "#c8a070", "#f0c860"],
    desc: "Heavy bronzer, terracotta blush, and sun-kissed glow. Summer 2025 is the season of looking like you just got back from the Amalfi Coast.",
    trending: ["Summer Bronze", "Glazed Donut", "No-Makeup Makeup"],
    tips: [
      "Bronzer in the 3-position: forehead, cheeks, and jaw — everywhere the sun touches",
      "Terracotta or brick blush layered over bronzer reads genuinely sun-kissed",
      "Waterproof everything — mascara, liner, and setting spray are non-negotiable",
      "Sheer dewy skin looks more expensive in summer heat than full coverage",
    ],
    slugs: ["summer-bronze", "glazed-donut", "no-makeup"],
  },
  {
    id: "autumn",
    label: "Autumn",
    emoji: "🍂",
    months: "Sep – Nov",
    palette: ["#7d3f71", "#9f1239", "#8f7252", "#704030"],
    desc: "Deep berries, warm browns, and vampy lips. Autumn is the season of bold colour — the one time of year a dark lip is practically expected.",
    trending: ["Dark Feminine", "Old Money", "Soft Glam"],
    tips: [
      "Berry and plum lips — the deepest shades are most wearable in autumn light",
      "Warm brown eyeshadow in the crease looks incredible against the season's tones",
      "Matte skin is more wearable in cooler, drier air than in summer",
      "Bronze highlight with warm-toned powder unifies any autumn look",
    ],
    slugs: ["dark-feminine", "old-money", "soft-glam"],
  },
  {
    id: "holiday",
    label: "Holiday",
    emoji: "✨",
    months: "Dec – Jan",
    palette: ["#900030", "#f0d060", "#4a2142", "#c08040"],
    desc: "The one season where full glam is the minimum. Red lips, gold highlight, and smoky eyes — December is the month to go all out.",
    trending: ["Holiday Glam", "Old Hollywood", "Y2K Glam"],
    tips: [
      "A red lip with minimal eye makeup is the most foolproof holiday look",
      "Gold and champagne highlighter photograph beautifully under event lighting",
      "Set everything thoroughly — holiday events run long",
      "Individual false lashes at the outer corners add drama without the weight of full strips",
    ],
    slugs: ["holiday-glam", "old-hollywood", "y2k-butterfly"],
  },
];

function PaletteRow({ colours }) {
  return (
    <div className="flex h-8 rounded-lg overflow-hidden mb-3">
      {colours.map((hex, i) => (
        <div key={i} className="flex-1" style={{ background: hex }}/>
      ))}
    </div>
  );
}

function SeasonLooks({ slugs, inventory, setPage }) {
  const looks = LIBRARY_LOOKS.filter(l => slugs.includes(l.id));
  if (!looks.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
      {looks.map(look => {
        const match = matchLookToInventory(look, inventory);
        const meta  = READINESS_META[match.readiness];
        return (
          <div key={look.id}
               className="rounded-xl border overflow-hidden cursor-pointer
                          hover:border-rose-200 hover:-translate-y-0.5 transition-all group"
               style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
               onClick={() => setPage(PAGES.LIBRARY)}>
            {/* Palette strip */}
            <div className="flex h-8">
              {["skin","blush","eye","lip"].map(k => look.palette[k] && (
                <div key={k} className="flex-1" style={{ background: look.palette[k] }}/>
              ))}
            </div>
            <div className="px-3 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-xs font-bold font-sans" style={{ color: "var(--text-primary)" }}>
                  {look.name}
                </p>
                <span className="text-[9px] font-bold font-sans"
                      style={{ color: meta?.colour }}>{match.score}%</span>
              </div>
              <p className="text-[11px] font-sans line-clamp-1" style={{ color: "var(--text-muted)" }}>
                {look.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SeasonalCalendarPage({ setPage }) {
  const { inventory } = useApp();
  const now    = new Date();
  const month  = now.getMonth(); // 0-indexed
  const currentSeasonId = month >= 2 && month <= 4 ? "spring"
    : month >= 5 && month <= 7 ? "summer"
    : month >= 8 && month <= 10 ? "autumn"
    : "holiday";

  const [activeSeason, setActiveSeason] = useState(currentSeasonId);
  const season = SEASONS.find(s => s.id === activeSeason);

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => setPage(PAGES.TOOLS)}
        className="text-xs font-sans cursor-pointer bg-transparent border-none mb-5"
        style={{ color: "var(--text-muted)" }}>← Back to Tools</button>

      <h1 className="page-title">🌸 Seasonal Calendar</h1>
      <p className="page-subtitle">Curated looks and trends for every season — matched to your inventory.</p>

      {/* Season tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SEASONS.map(s => (
          <button key={s.id} onClick={() => setActiveSeason(s.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                       font-sans cursor-pointer transition-all border"
            style={{
              background:  activeSeason === s.id ? "#fff1f2" : "var(--bg-card)",
              borderColor: activeSeason === s.id ? "#fecdd3" : "var(--border)",
              color:       activeSeason === s.id ? "#e11d48" : "var(--text-muted)",
              fontWeight:  activeSeason === s.id ? 600 : 400,
            }}>
            <span>{s.emoji}</span>
            {s.label}
            {s.id === currentSeasonId && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block"/>
            )}
          </button>
        ))}
      </div>

      {season && (
        <div>
          {/* Season hero */}
          <div className="rounded-2xl overflow-hidden border mb-6"
               style={{ borderColor: "var(--border)" }}>
            <PaletteRow colours={season.palette}/>
            <div className="px-6 py-5" style={{ background: "var(--bg-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{season.emoji}</span>
                <h2 className="font-serif text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {season.label} {season.months}
                </h2>
                {season.id === currentSeasonId && (
                  <span className="pill bg-rose-50 text-rose-600">Current</span>
                )}
              </div>
              <p className="text-sm font-sans leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
                {season.desc}
              </p>

              {/* Trending aesthetic tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {season.trending.map(t => (
                  <span key={t} className="pill bg-nude-50 text-nude-600"
                        style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)" }}>
                    {t}
                  </span>
                ))}
              </div>

              {/* Seasonal tips */}
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-widest font-sans mb-3"
                   style={{ color: "var(--text-muted)" }}>
                  Seasonal tips
                </p>
                <ul className="flex flex-col gap-2">
                  {season.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-rose-400 shrink-0 mt-0.5 text-sm">✦</span>
                      <p className="text-sm font-sans leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {tip}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Season looks from library */}
          <div>
            <p className="section-label mb-1">Recommended looks from the library</p>
            <p className="text-xs font-sans mb-3" style={{ color: "var(--text-faint)" }}>
              Showing your inventory match score. Click to view full details.
            </p>
            <SeasonLooks slugs={season.slugs} inventory={inventory} setPage={setPage}/>
          </div>
        </div>
      )}
    </div>
  );
}
