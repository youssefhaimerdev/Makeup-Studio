"use client";

import { READINESS_META } from "@/lib/inventoryMatcher";

function PaletteStrip({ palette }) {
  const keys = ["skin", "blush", "eye", "lip", "bronze", "highlight"];
  const cols  = keys.map(k => palette[k]).filter(Boolean);
  if (!cols.length) return null;
  return (
    <div className="flex h-14 w-full">
      {cols.map((hex, i) => (
        <div
          key={i}
          className="flex-1 transition-all duration-300 group-hover:flex-[1.3] first:rounded-tl-2xl last:rounded-tr-2xl"
          style={{ background: hex }}
        />
      ))}
    </div>
  );
}

function ReadinessBadge({ readiness, score }) {
  if (!readiness) return null;
  const meta = READINESS_META[readiness];
  return (
    <div
      className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full
                 text-[10px] font-bold font-sans shadow-sm border"
      style={{ background: meta.bg, borderColor: meta.border, color: meta.colour }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: meta.dot }}
      />
      {score}% · {meta.label}
    </div>
  );
}

export default function LookCard({ look, match, onClick }) {
  const isNew = look.season?.includes("2025") || look.season === "Comeback";

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl overflow-hidden border border-nude-100
                 hover:border-rose-200 hover:-translate-y-1 hover:shadow-lg
                 transition-all duration-300 cursor-pointer"
    >
      {/* Palette colour strip */}
      <PaletteStrip palette={look.palette} />

      {/* Readiness badge */}
      {match && (
        <ReadinessBadge readiness={match.readiness} score={match.score} />
      )}

      {/* Season / New badge */}
      {isNew && (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold
                        font-sans bg-rose-500 text-white uppercase tracking-wide shadow-sm">
          {look.season?.includes("Trending") ? "Trending" : "New"}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Difficulty */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-nude-400 font-sans uppercase tracking-wide">
            {look.difficulty} · {look.time}
          </span>
          {look.celebrity && (
            <span className="text-[10px] text-mauve-500 font-sans font-semibold">✦ Icon</span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-serif text-base font-bold text-nude-800 leading-tight mb-0.5">
          {look.name}
        </h3>
        <p className="text-xs text-nude-400 font-sans italic mb-2">{look.subtitle}</p>

        {/* Description */}
        <p className="text-xs text-nude-500 font-sans leading-relaxed line-clamp-2 mb-3">
          {look.desc}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {look.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium font-sans
                         bg-nude-50 text-nude-500 border border-nude-100"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Inventory match bar */}
        {match && (
          <div className="mt-3 pt-3 border-t border-nude-50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-nude-400 font-sans">
                {match.coveredRequired}/{match.totalRequired} required products
              </span>
              <span
                className="text-[10px] font-bold font-sans"
                style={{ color: READINESS_META[match.readiness]?.colour }}
              >
                {match.score}%
              </span>
            </div>
            <div className="w-full bg-nude-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${match.score}%`,
                  background: READINESS_META[match.readiness]?.dot || "#e11d48",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
