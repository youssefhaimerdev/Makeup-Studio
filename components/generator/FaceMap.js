"use client";

/**
 * FaceMap — SVG illustration showing where each product is applied.
 * Zones light up in the product's actual colour (from palette).
 * Inactive zones render in a soft neutral.
 */

const NEUTRAL = "#f2ece5";
const NEUTRAL_DARK = "#e3d5c5";

// Gentle alpha overlay so the base face shows through the colour
function withAlpha(hex, alpha = "55") {
  if (!hex || hex.length < 4) return NEUTRAL;
  const h = hex.replace("#", "");
  if (h.length === 3) return `#${h}${alpha}`;
  return `#${h}${alpha}`;
}

export default function FaceMap({ palette = {}, applyZones = {}, trendName = "" }) {
  // Zone colours — use palette hex with opacity if zone is active
  const skinCol      = applyZones.skin      ? palette.skin      || "#e8c9a8" : NEUTRAL;
  const blushCol     = applyZones.blush     ? palette.blush     || "#f09080" : NEUTRAL_DARK;
  const eyeCol       = applyZones.eyes      ? palette.eye       || "#b87aaa" : NEUTRAL_DARK;
  const browCol      = applyZones.brows     ? palette.eye       || "#806040" : NEUTRAL_DARK;
  const lipCol       = applyZones.lips      ? palette.lip       || "#c05060" : NEUTRAL_DARK;
  const contourCol   = applyZones.contour   ? palette.bronze    || "#b08040" : "transparent";
  const highlightCol = applyZones.highlight ? palette.highlight || "#f0d890" : "transparent";

  // Text colours for zone labels
  const browLabelCol = applyZones.brows     ? "#4d3c28" : "#c4a882";
  const eyeLabelCol  = applyZones.eyes      ? "#fff"    : "#c4a882";
  const lipLabelCol  = applyZones.lips      ? "#fff"    : "#c4a882";
  const blushLabelCol= applyZones.blush     ? "#4d3c28" : "#c4a882";

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[10px] font-bold text-nude-400 uppercase tracking-widest font-sans">
        Application Map
      </p>

      <div className="relative">
        <svg
          viewBox="0 0 240 300"
          width="200"
          height="250"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          <defs>
            <radialGradient id="fmBlushL" cx="40%" cy="50%" r="55%">
              <stop offset="0%" stopColor={blushCol} stopOpacity="0.75"/>
              <stop offset="100%" stopColor={blushCol} stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="fmBlushR" cx="60%" cy="50%" r="55%">
              <stop offset="0%" stopColor={blushCol} stopOpacity="0.75"/>
              <stop offset="100%" stopColor={blushCol} stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="fmHL" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={highlightCol} stopOpacity="0.85"/>
              <stop offset="100%" stopColor={highlightCol} stopOpacity="0"/>
            </radialGradient>
            <filter id="fmSoft">
              <feGaussianBlur stdDeviation="2"/>
            </filter>
            <clipPath id="fmFace">
              <ellipse cx="120" cy="150" rx="88" ry="110"/>
            </clipPath>
          </defs>

          {/* ── Neck ──────────────────────────────────────────────── */}
          <rect x="100" y="245" width="40" height="40" rx="6"
                fill={skinCol} opacity="0.7"/>

          {/* ── Face base ─────────────────────────────────────────── */}
          <ellipse cx="120" cy="150" rx="88" ry="110"
                   fill={skinCol} opacity="0.9"/>

          {/* ── Hair ──────────────────────────────────────────────── */}
          <ellipse cx="120" cy="60"  rx="90" ry="42" fill="#3d2010"/>
          <ellipse cx="42"  cy="108" rx="30" ry="78" fill="#3d2010"/>
          <ellipse cx="198" cy="108" rx="30" ry="78" fill="#3d2010"/>

          {/* ── Contour zones (clipped to face) ───────────────────── */}
          {applyZones.contour && (
            <g clipPath="url(#fmFace)" opacity="0.45" filter="url(#fmSoft)">
              {/* Under cheekbones */}
              <ellipse cx="62"  cy="180" rx="28" ry="14" fill={contourCol}/>
              <ellipse cx="178" cy="180" rx="28" ry="14" fill={contourCol}/>
              {/* Jaw */}
              <ellipse cx="75"  cy="232" rx="22" ry="10" fill={contourCol}/>
              <ellipse cx="165" cy="232" rx="22" ry="10" fill={contourCol}/>
              {/* Temple */}
              <ellipse cx="50"  cy="120" rx="18" ry="24" fill={contourCol}/>
              <ellipse cx="190" cy="120" rx="18" ry="24" fill={contourCol}/>
            </g>
          )}

          {/* ── Blush ─────────────────────────────────────────────── */}
          <ellipse cx="68"  cy="182" rx="38" ry="28"
                   fill="url(#fmBlushL)" filter="url(#fmSoft)"/>
          <ellipse cx="172" cy="182" rx="38" ry="28"
                   fill="url(#fmBlushR)" filter="url(#fmSoft)"/>

          {/* ── Highlighter cheekbones ────────────────────────────── */}
          {applyZones.highlight && (
            <>
              <ellipse cx="78"  cy="168" rx="20" ry="10"
                       fill="url(#fmHL)" filter="url(#fmSoft)"/>
              <ellipse cx="162" cy="168" rx="20" ry="10"
                       fill="url(#fmHL)" filter="url(#fmSoft)"/>
              {/* Bridge */}
              <ellipse cx="120" cy="148" rx="5" ry="14"
                       fill={highlightCol} opacity="0.5" filter="url(#fmSoft)"/>
            </>
          )}

          {/* ── Eyeshadow ─────────────────────────────────────────── */}
          <ellipse cx="86"  cy="122" rx="26" ry="13"
                   fill={eyeCol} opacity={applyZones.eyes ? 0.75 : 0.2}
                   filter="url(#fmSoft)"/>
          <ellipse cx="154" cy="122" rx="26" ry="13"
                   fill={eyeCol} opacity={applyZones.eyes ? 0.75 : 0.2}
                   filter="url(#fmSoft)"/>

          {/* ── Eye whites ────────────────────────────────────────── */}
          <ellipse cx="86"  cy="130" rx="21" ry="11" fill="white"/>
          <ellipse cx="154" cy="130" rx="21" ry="11" fill="white"/>

          {/* ── Irises ────────────────────────────────────────────── */}
          <circle cx="86"  cy="130" r="7"  fill="#5c3d1e"/>
          <circle cx="86"  cy="130" r="4"  fill="#1a0a00"/>
          <circle cx="83"  cy="127" r="1.5" fill="white" opacity="0.9"/>
          <circle cx="154" cy="130" r="7"  fill="#5c3d1e"/>
          <circle cx="154" cy="130" r="4"  fill="#1a0a00"/>
          <circle cx="151" cy="127" r="1.5" fill="white" opacity="0.9"/>

          {/* ── Eyeliner ──────────────────────────────────────────── */}
          {applyZones.eyes && (
            <>
              <path d="M65 125 Q86 118 107 125 L109 128 Q86 121 63 128 Z"
                    fill="#1a0a00" opacity="0.85"/>
              <path d="M131 125 Q154 118 175 125 L177 128 Q154 121 129 128 Z"
                    fill="#1a0a00" opacity="0.85"/>
              {/* Wings */}
              <path d="M107 125 L114 119 L109 128 Z" fill="#1a0a00" opacity="0.85"/>
              <path d="M131 125 L124 119 L129 128 Z" fill="#1a0a00" opacity="0.85"/>
            </>
          )}

          {/* ── Eyebrows ──────────────────────────────────────────── */}
          <path d="M60 106 Q86 97 112 105"
                stroke={applyZones.brows ? "#3d2010" : "#c4a882"}
                strokeWidth={applyZones.brows ? 4.5 : 2.5}
                strokeLinecap="round" fill="none" opacity="0.9"/>
          <path d="M128 105 Q154 97 180 106"
                stroke={applyZones.brows ? "#3d2010" : "#c4a882"}
                strokeWidth={applyZones.brows ? 4.5 : 2.5}
                strokeLinecap="round" fill="none" opacity="0.9"/>

          {/* ── Nose ──────────────────────────────────────────────── */}
          <path d="M112 162 Q106 175 113 182 Q120 185 127 182 Q134 175 128 162"
                stroke="#c4a882" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

          {/* ── Lips ──────────────────────────────────────────────── */}
          {/* Lower lip */}
          <path d="M96 210 Q110 218 120 216 Q130 218 144 210 Q136 222 120 224 Q104 222 96 210 Z"
                fill={lipCol} opacity={applyZones.lips ? 0.9 : 0.35}/>
          {/* Upper lip */}
          <path d="M96 210 Q106 214 120 212 Q134 214 144 210 Q138 203 128 200 Q120 198 112 200 Q102 203 96 210 Z"
                fill={lipCol} opacity={applyZones.lips ? 0.95 : 0.35}/>
          {/* Lip highlight */}
          <ellipse cx="113" cy="218" rx="8" ry="2.5"
                   fill="white" opacity={applyZones.lips ? 0.3 : 0}
                   filter="url(#fmSoft)"/>

          {/* ── Zone labels (only for active zones) ───────────────── */}
          {applyZones.brows && (
            <text x="86" y="96" textAnchor="middle" fontSize="7" fill={browLabelCol}
                  fontFamily="DM Sans, sans-serif" fontWeight="700">BROW</text>
          )}
          {applyZones.eyes && (
            <text x="86" y="119" textAnchor="middle" fontSize="6.5" fill={eyeLabelCol}
                  fontFamily="DM Sans, sans-serif" fontWeight="700" opacity="0.8">EYE</text>
          )}
          {applyZones.blush && (
            <text x="58" y="194" textAnchor="middle" fontSize="6.5" fill={blushLabelCol}
                  fontFamily="DM Sans, sans-serif" fontWeight="700" opacity="0.7">BLUSH</text>
          )}
          {applyZones.lips && (
            <text x="120" y="222" textAnchor="middle" fontSize="6.5" fill={lipLabelCol}
                  fontFamily="DM Sans, sans-serif" fontWeight="700" opacity="0.8">LIP</text>
          )}
          {applyZones.highlight && (
            <text x="162" y="163" textAnchor="middle" fontSize="5.5" fill="#8f7252"
                  fontFamily="DM Sans, sans-serif" fontWeight="700" opacity="0.7">HL</text>
          )}
        </svg>

        {/* ── Active zone legend ───────────────────────────────────── */}
        <div className="mt-2 flex flex-wrap gap-2 justify-center">
          {[
            { zone: "skin",      label: "Base",      colour: palette.skin      },
            { zone: "blush",     label: "Blush",     colour: palette.blush     },
            { zone: "eyes",      label: "Eye",       colour: palette.eye       },
            { zone: "brows",     label: "Brow",      colour: palette.eye       },
            { zone: "lips",      label: "Lip",       colour: palette.lip       },
            { zone: "contour",   label: "Contour",   colour: palette.bronze    },
            { zone: "highlight", label: "Highlight", colour: palette.highlight },
          ]
            .filter(({ zone }) => applyZones[zone])
            .map(({ label, colour }) => (
              <div key={label} className="flex items-center gap-1">
                <div
                  className="w-2.5 h-2.5 rounded-full border border-white shadow-sm"
                  style={{ background: colour || "#e3d5c5" }}
                />
                <span className="text-[10px] text-nude-500 font-sans">{label}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
