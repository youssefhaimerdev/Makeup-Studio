"use client";

// ── Colour utilities ──────────────────────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  if (h.length < 6) return { r: 200, g: 160, b: 130 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function textOnHex(hex) {
  return luminance(hex) > 0.55 ? "#4d3c28" : "#fff";
}

// ── Palette swatch strip ──────────────────────────────────────────────────
function PaletteStrip({ palette }) {
  const zones = [
    { key: "skin",  label: "Skin"  },
    { key: "blush", label: "Blush" },
    { key: "eye",   label: "Eye"   },
    { key: "lip",   label: "Lip"   },
  ];

  return (
    <div className="flex w-full h-16 rounded-xl overflow-hidden shadow-inner">
      {zones.map(({ key, label }) => {
        const hex = palette[key] || "#e3d5c5";
        const fg  = textOnHex(hex);
        return (
          <div
            key={key}
            className="flex-1 flex items-end justify-center pb-1.5 transition-all duration-300 hover:flex-[1.5]"
            style={{ background: hex }}
            title={`${label}: ${hex}`}
          >
            <span
              className="text-[9px] font-bold uppercase tracking-wide font-sans opacity-80"
              style={{ color: fg }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Colour circle row ─────────────────────────────────────────────────────
function PaletteCircles({ palette }) {
  const items = [
    { key: "skin",      label: "Base",       size: "w-10 h-10" },
    { key: "blush",     label: "Blush",      size: "w-10 h-10" },
    { key: "eye",       label: "Eye",        size: "w-10 h-10" },
    { key: "lip",       label: "Lip",        size: "w-10 h-10" },
    { key: "bronze",    label: "Bronze",     size: "w-8 h-8" },
    { key: "highlight", label: "Highlight",  size: "w-8 h-8" },
  ];

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {items.map(({ key, label, size }) => {
        const hex = palette[key];
        if (!hex) return null;
        return (
          <div key={key} className="flex flex-col items-center gap-1">
            <div
              className={`${size} rounded-full border-2 border-white shadow-md`}
              style={{ background: hex }}
              title={`${label}: ${hex}`}
            />
            <span className="text-[9px] text-nude-400 font-sans uppercase tracking-wide">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main MoodCard ─────────────────────────────────────────────────────────
export default function MoodCard({ look }) {
  const { trendName, moodDesc, aesthetic = [], palette = {}, occasion, intensity } = look;

  // Dominant card background — blend of skin and blush very lightly
  const bg = palette.skin
    ? `linear-gradient(135deg, ${palette.skin}22 0%, ${palette.lip || "#fecdd3"}18 100%)`
    : "linear-gradient(135deg, #fff1f2, #f8f2f7)";

  return (
    <div
      className="rounded-2xl overflow-hidden border border-nude-100 shadow-sm mb-6"
      style={{ background: bg }}
    >
      {/* ── Palette strip ──────────────────────────────────────────── */}
      <PaletteStrip palette={palette} />

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="p-5">
        {/* Trend label */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] font-bold text-nude-400 uppercase tracking-widest font-sans mb-0.5">
              Your look
            </p>
            <h2 className="font-serif text-2xl font-bold text-nude-800 leading-tight">
              {trendName}
            </h2>
          </div>

          {/* Occasion + intensity chips */}
          <div className="flex flex-col gap-1 items-end shrink-0">
            <span className="pill bg-white/80 text-nude-600 shadow-sm">{occasion}</span>
            <span className="pill bg-white/80 text-nude-500 shadow-sm">{intensity?.label || intensity}</span>
          </div>
        </div>

        {/* Mood description */}
        <p className="text-sm text-nude-500 font-sans leading-relaxed mb-4 italic">
          "{moodDesc}"
        </p>

        {/* Aesthetic tags */}
        {aesthetic.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {aesthetic.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-semibold font-sans border"
                style={{
                  background: palette.lip ? `${palette.lip}18` : "#fff1f2",
                  borderColor: palette.lip ? `${palette.lip}40` : "#fecdd3",
                  color:       palette.lip ? palette.lip : "#e11d48",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Colour circles */}
        <PaletteCircles palette={palette} />
      </div>
    </div>
  );
}
