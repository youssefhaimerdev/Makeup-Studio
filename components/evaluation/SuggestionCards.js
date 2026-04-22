"use client";

const SEVERITY_STYLE = {
  high:     { bg: "#fff1f2", border: "#fecdd3", badge: "#e11d48", badgeBg: "#fff1f2", label: "Priority" },
  medium:   { bg: "#fdf4f0", border: "#f6cdb5", badge: "#c4622c", badgeBg: "#fdf4f0", label: "Improve"  },
  positive: { bg: "#f0fdf4", border: "#bbf7d0", badge: "#16a34a", badgeBg: "#f0fdf4", label: "Great"    },
};

const ZONE_ICONS = {
  Skin:     "✦",
  Blush:    "🌸",
  Eyes:     "👁",
  Brows:    "〰",
  Lips:     "💋",
  Harmony:  "✨",
  Overall:  "⭐",
};

export default function SuggestionCards({ suggestions }) {
  if (!suggestions?.length) return null;

  return (
    <div className="bg-white border border-nude-100 rounded-2xl p-6">
      <h3 className="font-serif text-lg text-nude-800 mb-5">Improvement Suggestions</h3>
      <div className="flex flex-col gap-3">
        {suggestions.map((s, i) => {
          const style = SEVERITY_STYLE[s.severity] ?? SEVERITY_STYLE.medium;
          return (
            <div
              key={i}
              className="rounded-xl p-4 border"
              style={{ background: style.bg, borderColor: style.border }}
            >
              <div className="flex items-start gap-3">
                {/* Zone icon */}
                <span className="text-lg shrink-0 mt-0.5">
                  {ZONE_ICONS[s.zone] ?? "✦"}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-sm font-bold" style={{ color: style.badge }}>
                      {s.zone}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={{ background: style.badge + "20", color: style.badge }}
                    >
                      {style.label}
                    </span>
                  </div>
                  <p className="text-sm text-nude-600 leading-relaxed">{s.text}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
