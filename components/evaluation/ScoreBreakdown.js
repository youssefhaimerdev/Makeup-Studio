"use client";

import { useEffect, useState } from "react";

const ZONE_META = {
  skin:    { label: "Skin & Foundation", icon: "✦", weight: "20%" },
  blush:   { label: "Blush & Cheeks",    icon: "🌸", weight: "15%" },
  eyes:    { label: "Eyes",              icon: "👁",  weight: "25%" },
  brows:   { label: "Eyebrows",          icon: "〰",  weight: "15%" },
  lips:    { label: "Lips",              icon: "💋",  weight: "15%" },
  harmony: { label: "Overall Harmony",   icon: "✨",  weight: "10%" },
};

function scoreColor(score) {
  if (score >= 80) return "#e11d48";
  if (score >= 65) return "#f97316";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

function BarRow({ zone, score, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const meta = ZONE_META[zone];
  const color = scoreColor(score);

  useEffect(() => {
    const t = setTimeout(() => setWidth(score), delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <div className="flex items-center gap-3">
      {/* Icon + label */}
      <div className="w-36 shrink-0 flex items-center gap-2">
        <span className="text-base">{meta.icon}</span>
        <div>
          <div className="text-xs font-semibold text-nude-700 leading-tight">{meta.label}</div>
          <div className="text-[10px] text-nude-400">{meta.weight} weight</div>
        </div>
      </div>

      {/* Bar */}
      <div className="flex-1 bg-nude-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, background: color }}
        />
      </div>

      {/* Score */}
      <div
        className="w-9 text-right text-sm font-bold shrink-0"
        style={{ color }}
      >
        {score}
      </div>
    </div>
  );
}

export default function ScoreBreakdown({ subscores }) {
  return (
    <div className="bg-white border border-nude-100 rounded-2xl p-6">
      <h3 className="font-serif text-lg text-nude-800 mb-5">Score Breakdown</h3>
      <div className="flex flex-col gap-4">
        {Object.entries(subscores).map(([zone, score], i) => (
          <BarRow key={zone} zone={zone} score={score} delay={i * 80} />
        ))}
      </div>
    </div>
  );
}
