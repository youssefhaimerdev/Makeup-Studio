"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { PAGES } from "@/lib/routes";

const ZONES = [
  { key: "skin",      label: "Base / Skin",   icon: "✦", default: "#e8c9a8" },
  { key: "blush",     label: "Blush",         icon: "🌸", default: "#f09080" },
  { key: "eye",       label: "Eye",           icon: "👁",  default: "#b87aaa" },
  { key: "brow",      label: "Brow",          icon: "〰",  default: "#806040" },
  { key: "lip",       label: "Lip",           icon: "💋", default: "#c05060" },
  { key: "highlight", label: "Highlight",     icon: "✨", default: "#f0d890" },
  { key: "bronze",    label: "Bronzer",       icon: "🌑", default: "#b08040" },
];

const PRESET_PALETTES = [
  { name: "Soft Glam",       palette: { skin: "#d4a97a", blush: "#e8956a", eye: "#b87aaa", brow: "#604020", lip: "#c08080", highlight: "#f0d890", bronze: "#b08040" } },
  { name: "Clean Girl",      palette: { skin: "#f0dcc8", blush: "#f5b8a8", eye: "#c4a882", brow: "#907050", lip: "#f0a898", highlight: "#f8f0e0", bronze: null } },
  { name: "Dark Feminine",   palette: { skin: "#8f7252", blush: "#803050", eye: "#4a2142", brow: "#301010", lip: "#700030", highlight: "#c08040", bronze: "#704030" } },
  { name: "Summer Bronze",   palette: { skin: "#d4a060", blush: "#e87848", eye: "#c08040", brow: "#604020", lip: "#d06038", highlight: "#f0c860", bronze: "#a07030" } },
  { name: "Old Money",       palette: { skin: "#f0e0c8", blush: "#f0d0c0", eye: "#d4bfa5", brow: "#a08060", lip: "#e8c8b8", highlight: "#f8f0e0", bronze: null } },
  { name: "Holiday Glam",    palette: { skin: "#c4a882", blush: "#b07060", eye: "#4a2142", brow: "#302010", lip: "#900030", highlight: "#f0d060", bronze: "#906030" } },
];

function hexToRgb(hex) {
  const h = (hex || "#e3d5c5").replace("#", "");
  return { r: parseInt(h.slice(0,2),16)||200, g: parseInt(h.slice(2,4),16)||160, b: parseInt(h.slice(4,6),16)||130 };
}
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299*r + 0.587*g + 0.114*b) / 255;
}

// Simple SVG face preview
function FacePreview({ palette }) {
  const skinCol  = palette.skin      || "#e8c9a8";
  const blushCol = palette.blush     || "#f09080";
  const eyeCol   = palette.eye       || "#b87aaa";
  const browCol  = palette.brow      || "#806040";
  const lipCol   = palette.lip       || "#c05060";
  const hlCol    = palette.highlight || "transparent";

  return (
    <svg viewBox="0 0 160 200" width="140" height="175" className="drop-shadow-sm">
      <defs>
        <radialGradient id="pv-blush-l" cx="35%" cy="55%" r="50%">
          <stop offset="0%" stopColor={blushCol} stopOpacity="0.7"/>
          <stop offset="100%" stopColor={blushCol} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="pv-blush-r" cx="65%" cy="55%" r="50%">
          <stop offset="0%" stopColor={blushCol} stopOpacity="0.7"/>
          <stop offset="100%" stopColor={blushCol} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="pv-hl" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={hlCol} stopOpacity="0.8"/>
          <stop offset="100%" stopColor={hlCol} stopOpacity="0"/>
        </radialGradient>
        <filter id="pv-blur"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>

      {/* Hair */}
      <ellipse cx="80" cy="38" rx="60" ry="30" fill="#3d2010"/>
      <ellipse cx="28" cy="78" rx="20" ry="55" fill="#3d2010"/>
      <ellipse cx="132" cy="78" rx="20" ry="55" fill="#3d2010"/>

      {/* Face */}
      <ellipse cx="80" cy="102" rx="58" ry="74" fill={skinCol}/>

      {/* Blush */}
      <ellipse cx="44" cy="122" rx="30" ry="20" fill="url(#pv-blush-l)" filter="url(#pv-blur)"/>
      <ellipse cx="116" cy="122" rx="30" ry="20" fill="url(#pv-blush-r)" filter="url(#pv-blur)"/>

      {/* Highlight */}
      <ellipse cx="52" cy="110" rx="16" ry="8" fill="url(#pv-hl)" filter="url(#pv-blur)"/>
      <ellipse cx="108" cy="110" rx="16" ry="8" fill="url(#pv-hl)" filter="url(#pv-blur)"/>

      {/* Eye shadow */}
      <ellipse cx="57" cy="86" rx="18" ry="9" fill={eyeCol} opacity="0.65" filter="url(#pv-blur)"/>
      <ellipse cx="103" cy="86" rx="18" ry="9" fill={eyeCol} opacity="0.65" filter="url(#pv-blur)"/>

      {/* Eye whites */}
      <ellipse cx="57" cy="90" rx="14" ry="8" fill="white"/>
      <ellipse cx="103" cy="90" rx="14" ry="8" fill="white"/>

      {/* Iris */}
      <circle cx="57" cy="90" r="5" fill="#3d2010"/>
      <circle cx="103" cy="90" r="5" fill="#3d2010"/>
      <circle cx="55" cy="88" r="1.5" fill="white" opacity="0.9"/>
      <circle cx="101" cy="88" r="1.5" fill="white" opacity="0.9"/>

      {/* Brows */}
      <path d="M40 79 Q57 71 74 78" stroke={browCol} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M86 78 Q103 71 120 79" stroke={browCol} strokeWidth="3.5" strokeLinecap="round" fill="none"/>

      {/* Nose */}
      <path d="M73 122 Q69 132 74 136 Q80 138 86 136 Q91 132 87 122"
            stroke="#c4a882" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

      {/* Lips */}
      <path d="M62 154 Q71 150 80 151 Q89 150 98 154 Q92 163 80 165 Q68 163 62 154Z"
            fill={lipCol} opacity="0.9"/>
      <path d="M62 154 Q70 157 80 156 Q90 157 98 154 Q93 149 85 146 Q80 145 75 146 Q67 149 62 154Z"
            fill={lipCol}/>
      <ellipse cx="74" cy="159" rx="6" ry="2" fill="white" opacity="0.25" filter="url(#pv-blur)"/>
    </svg>
  );
}

export default function PaletteVisualiserPage({ setPage }) {
  const { inventory } = useApp();
  const [palette, setPalette] = useState({
    skin: "#e8c9a8", blush: "#f09080", eye: "#b87aaa",
    brow: "#806040", lip: "#c05060", highlight: "#f0d890", bronze: "#b08040",
  });
  const [savedPalettes, setSaved] = useState([]);
  const [paletteName, setPaletteName] = useState("");

  function setZone(key, hex) {
    setPalette(prev => ({ ...prev, [key]: hex }));
  }

  function applyPreset(p) {
    setPalette({ ...palette, ...p.palette });
  }

  function savePalette() {
    const name = paletteName.trim() || "My Palette";
    setSaved(prev => [{ name, palette: { ...palette } }, ...prev].slice(0, 10));
    setPaletteName("");
  }

  // Auto-fill from inventory
  function fillFromInventory() {
    const byCategory = {};
    inventory.forEach(p => { if (!byCategory[p.category]) byCategory[p.category] = p; });
    const get = cats => {
      for (const c of cats) if (byCategory[c]?.shadeHex) return byCategory[c].shadeHex;
      return null;
    };
    const next = { ...palette };
    const skin = get(["Foundation","BB Cream","CC Cream","Skin Tint"]);
    const blush = get(["Blush","Blush Stick","Cream Blush"]);
    const eye   = get(["Eyeshadow","Loose Pigment","Eyeliner"]);
    const lip   = get(["Lipstick","Lip Gloss","Lip Oil","Lip Stain"]);
    const hl    = get(["Highlighter"]);
    const brnz  = get(["Bronzer","Cream Bronzer","Contour"]);
    const brow  = get(["Eyebrow"]);
    if (skin)  next.skin      = skin;
    if (blush) next.blush     = blush;
    if (eye)   next.eye       = eye;
    if (lip)   next.lip       = lip;
    if (hl)    next.highlight = hl;
    if (brnz)  next.bronze    = brnz;
    if (brow)  next.brow      = brow;
    setPalette(next);
  }

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => setPage(PAGES.TOOLS)}
        className="text-xs font-sans cursor-pointer bg-transparent border-none mb-5"
        style={{ color: "var(--text-muted)" }}>← Back to Tools</button>

      <h1 className="page-title">🎨 Palette Visualiser</h1>
      <p className="page-subtitle">Build a colour combination and preview it on a face before applying.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="flex flex-col gap-4">

          {/* Auto-fill from inventory */}
          {inventory.length > 0 && (
            <button onClick={fillFromInventory}
              className="w-full rounded-xl border border-dashed py-3 text-sm font-semibold
                         font-sans cursor-pointer transition-all hover:border-rose-300"
              style={{ borderColor: "var(--border-mid)", color: "var(--text-muted)",
                       background: "var(--bg-card)" }}>
              ✦ Auto-fill from my inventory
            </button>
          )}

          {/* Zone pickers */}
          <div className="rounded-2xl border p-4 flex flex-col gap-3"
               style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="section-label">Adjust colours</p>
            {ZONES.map(zone => (
              <div key={zone.key} className="flex items-center gap-3">
                <span className="text-base w-5 text-center shrink-0">{zone.icon}</span>
                <span className="text-xs font-sans font-medium w-20 shrink-0"
                      style={{ color: "var(--text-muted)" }}>
                  {zone.label}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm shrink-0"
                       style={{ background: palette[zone.key] || zone.default }}/>
                  <input type="color"
                    value={palette[zone.key] || zone.default}
                    onChange={e => setZone(zone.key, e.target.value)}
                    className="w-full h-7 rounded-lg cursor-pointer border-0 p-0"
                    style={{ background: "transparent" }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Preset palettes */}
          <div className="rounded-2xl border p-4"
               style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="section-label mb-2">Preset looks</p>
            <div className="flex flex-col gap-2">
              {PRESET_PALETTES.map(p => (
                <button key={p.name} onClick={() => applyPreset(p)}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg
                             cursor-pointer transition-all border hover:border-rose-200"
                  style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                  <div className="flex gap-0.5 shrink-0">
                    {["skin","blush","eye","lip"].map(k => p.palette[k] && (
                      <div key={k} className="w-4 h-4 rounded-full border border-white shadow-sm"
                           style={{ background: p.palette[k] }}/>
                    ))}
                  </div>
                  <span className="text-xs font-semibold font-sans"
                        style={{ color: "var(--text-primary)" }}>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Save palette */}
          <div className="flex gap-2">
            <input value={paletteName} onChange={e => setPaletteName(e.target.value)}
              placeholder="Name this palette…"
              className="input-field flex-1 !py-2 !text-sm"
              onKeyDown={e => e.key === "Enter" && savePalette()}/>
            <button onClick={savePalette}
              className="btn-primary !py-2 !px-4 !text-xs !shadow-none shrink-0">
              Save
            </button>
          </div>

          {/* Saved palettes */}
          {savedPalettes.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="section-label">Saved</p>
              {savedPalettes.map((p, i) => (
                <button key={i} onClick={() => applyPreset(p)}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg
                             cursor-pointer transition-all border hover:border-rose-200"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                  <div className="flex gap-0.5">
                    {["skin","blush","eye","lip"].map(k => p.palette[k] && (
                      <div key={k} className="w-4 h-4 rounded-full border border-white shadow-sm"
                           style={{ background: p.palette[k] }}/>
                    ))}
                  </div>
                  <span className="text-xs font-semibold font-sans"
                        style={{ color: "var(--text-primary)" }}>{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Face preview + swatches */}
        <div className="flex flex-col items-center gap-4">
          {/* Palette strip */}
          <div className="w-full h-10 rounded-xl overflow-hidden flex shadow-sm">
            {ZONES.map(zone => (
              <div key={zone.key} className="flex-1" style={{ background: palette[zone.key] || zone.default }}/>
            ))}
          </div>

          {/* Face preview */}
          <div className="flex flex-col items-center">
            <FacePreview palette={palette}/>
          </div>

          {/* Swatch circles */}
          <div className="flex flex-wrap gap-3 justify-center">
            {ZONES.map(zone => {
              const hex = palette[zone.key] || zone.default;
              const fg  = luminance(hex) > 0.55 ? "#4d3c28" : "#fff";
              return (
                <div key={zone.key} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                       style={{ background: hex }}>
                  </div>
                  <span className="text-[9px] font-sans uppercase tracking-wide"
                        style={{ color: "var(--text-faint)" }}>
                    {zone.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Hex values */}
          <div className="w-full rounded-xl border p-3"
               style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="section-label mb-2">Hex values</p>
            <div className="grid grid-cols-2 gap-1">
              {ZONES.map(zone => (
                <div key={zone.key} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0"
                       style={{ background: palette[zone.key] || zone.default }}/>
                  <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                    {zone.label}: {palette[zone.key] || zone.default}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
