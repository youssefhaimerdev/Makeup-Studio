/**
 * Look Classifier
 * Given a generated look's occasion, intensity, products, and profile,
 * returns:
 *   - trend name  ("Soft Glam", "Clean Girl", "Dark Feminine", …)
 *   - aesthetic   array of style tags (["Warm", "Polished", "Feminine"])
 *   - palette     { skin, blush, eye, lip, brow, base } hex colours
 *   - moodDesc    one-liner vibe description
 *   - applyZones  which face zones are emphasised in this look
 */

// ── Default palette colours by category + intensity ───────────────────────
// Used when a product has no shadeHex stored
const CATEGORY_DEFAULTS = {
  // Base
  Foundation: { low: "#e8c9a8", mid: "#d4a97a", high: "#c08040" },
  Concealer:  { low: "#f0dcc0", mid: "#e8c9a8", high: "#d4a97a" },

  // Cheeks
  Blush:       { low: "#f8c0b0", mid: "#f09080", high: "#d06050" },
  "Blush Stick":{ low: "#f8c0b0", mid: "#f09080", high: "#d06050" },
  "Cream Blush":{ low: "#f8c0b0", mid: "#e88070", high: "#c85040" },
  Bronzer:     { low: "#c8a070", mid: "#b08040", high: "#906030" },
  "Cream Bronzer": { low: "#c8a070", mid: "#b08040", high: "#906030" },
  Contour:     { low: "#b09070", mid: "#907050", high: "#705040" },
  Highlighter: { low: "#f8f0d8", mid: "#f0d890", high: "#e0b040" },

  // Eyes
  Eyeshadow:      { low: "#d4bfa5", mid: "#b87aaa", high: "#4a2142" },
  Eyeliner:       { low: "#606060", mid: "#303030", high: "#100808" },
  Mascara:        { low: "#404040", mid: "#202020", high: "#080808" },
  "Loose Pigment":{ low: "#c090c0", mid: "#8050a0", high: "#402060" },
  Glitter:        { low: "#f0d880", mid: "#d0a840", high: "#a07820" },

  // Brows
  Eyebrow:             { low: "#806040", mid: "#604020", high: "#302010" },
  "Brow Lamination Gel":{ low: "#c0a880", mid: "#a08060", high: "#806040" },

  // Lips
  Lipstick:  { low: "#e09090", mid: "#c05060", high: "#900030" },
  "Lip Gloss":{ low: "#f8c0d0", mid: "#f080a0", high: "#d04080" },
  "Lip Oil": { low: "#f8d8d0", mid: "#f0b0a8", high: "#d07060" },
  "Lip Stain":{ low: "#d08080", mid: "#b04060", high: "#802040" },
  "Lip Topper": { low: "#f8d0e8", mid: "#e090c0", high: "#c04090" },
  "Lip Plumper": { low: "#f8c0c0", mid: "#f08080", high: "#e04050" },
  "Lip Liner": { low: "#c07070", mid: "#a04050", high: "#801030" },
};

function productColour(product, intensityDots) {
  if (!product) return null;
  if (product.shadeHex && product.shadeHex.length >= 4) return product.shadeHex;
  const defaults = CATEGORY_DEFAULTS[product.category];
  if (!defaults) return null;
  if (intensityDots <= 2) return defaults.low;
  if (intensityDots <= 3) return defaults.mid;
  return defaults.high;
}

// ── Trend classifier ──────────────────────────────────────────────────────
const TREND_RULES = [
  {
    id: "clean-girl",
    name: "Clean Girl",
    moodDesc: "Glassy skin, brushed brows, and effortless freshness.",
    aesthetic: ["Minimal", "Dewy", "Natural"],
    match: ({ intensityDots, occasion }) =>
      intensityDots <= 2 && (occasion.includes("Everyday") || occasion.includes("School")),
  },
  {
    id: "no-makeup",
    name: "No-Makeup Makeup",
    moodDesc: "Skin that looks like skin — perfected and barely-there.",
    aesthetic: ["Natural", "Effortless", "Fresh"],
    match: ({ intensityDots, occasion }) =>
      intensityDots <= 2 && occasion.includes("Natural"),
  },
  {
    id: "old-money",
    name: "Old Money",
    moodDesc: "Quiet luxury — understated, refined, intentionally effortless.",
    aesthetic: ["Quiet Luxury", "Refined", "Elegant"],
    match: ({ intensityDots, occasion }) =>
      intensityDots <= 2 && (occasion.includes("Work") || occasion.includes("Professional")),
  },
  {
    id: "soft-glam",
    name: "Soft Glam",
    moodDesc: "Warm, polished, and always flattering. The classic elevated look.",
    aesthetic: ["Warm", "Polished", "Feminine"],
    match: ({ intensityDots, occasion }) =>
      intensityDots === 3 && (occasion.includes("Date") || occasion.includes("Everyday")),
  },
  {
    id: "business-chic",
    name: "Business Chic",
    moodDesc: "Sharp, confident, and put-together without trying too hard.",
    aesthetic: ["Polished", "Professional", "Sharp"],
    match: ({ intensityDots, occasion }) =>
      intensityDots === 3 && occasion.includes("Work"),
  },
  {
    id: "romantic-glam",
    name: "Romantic Glam",
    moodDesc: "Warm candlelit finish with a statement lip and soft eyes.",
    aesthetic: ["Romantic", "Feminine", "Warm"],
    match: ({ intensityDots, occasion }) =>
      intensityDots === 4 && occasion.includes("Date"),
  },
  {
    id: "y2k-glam",
    name: "Y2K Glam",
    moodDesc: "Glossy lids, frosty pinks, and playful nostalgia.",
    aesthetic: ["Playful", "Shiny", "Retro"],
    match: ({ intensityDots, hasGlitter, occasion }) =>
      (intensityDots >= 4 || hasGlitter) && occasion.includes("Party"),
  },
  {
    id: "dark-feminine",
    name: "Dark Feminine",
    moodDesc: "Deep berries, smokey liner, sculpted skin. Magnetic and moody.",
    aesthetic: ["Bold", "Moody", "Sultry"],
    match: ({ intensityDots, occasion }) =>
      intensityDots >= 4 && (occasion.includes("Party") || occasion.includes("Special") || occasion.includes("Event")),
  },
  {
    id: "editorial",
    name: "Editorial",
    moodDesc: "Avant-garde and intentional. This look makes a statement.",
    aesthetic: ["Artistic", "Bold", "Avant-Garde"],
    match: ({ occasion }) => occasion.includes("Editorial"),
  },
  {
    id: "everyday-glam",
    name: "Everyday Glam",
    moodDesc: "Elevated daily makeup — defined but never overdone.",
    aesthetic: ["Polished", "Wearable", "Defined"],
    match: ({ intensityDots }) => intensityDots === 3,
  },
  {
    id: "full-glam",
    name: "Full Glam",
    moodDesc: "All-out, head-turning glamour. Every zone is perfected.",
    aesthetic: ["Dramatic", "Glam", "Bold"],
    match: ({ intensityDots }) => intensityDots >= 4,
  },
];

// ── Zone emphasis map ─────────────────────────────────────────────────────
// Which zones are visually emphasised based on the look
function getApplyZones(steps, intensityDots) {
  const hasProduct = (cat) => steps.some(s => s.category === cat && s.product);
  return {
    eyes:   hasProduct("Eyeshadow") || hasProduct("Eyeliner"),
    brows:  hasProduct("Eyebrow") || hasProduct("Brow Lamination Gel"),
    blush:  hasProduct("Blush") || hasProduct("Blush Stick") || hasProduct("Cream Blush"),
    lips:   hasProduct("Lipstick") || hasProduct("Lip Gloss") || hasProduct("Lip Oil") || hasProduct("Lip Stain"),
    contour:hasProduct("Contour") || hasProduct("Bronzer") || hasProduct("Cream Bronzer"),
    highlight: hasProduct("Highlighter") && intensityDots >= 3,
    skin:   hasProduct("Foundation") || hasProduct("BB Cream") || hasProduct("CC Cream") || hasProduct("Skin Tint"),
  };
}

// ── Main export ───────────────────────────────────────────────────────────
export function classifyLook(result, profile) {
  const { steps = [], intensity, occasion = "" } = result;
  const intensityDots = intensity?.dots ?? 3;

  const byCategory = {};
  steps.forEach(s => { if (s.product) byCategory[s.category] = s.product; });

  const hasGlitter = !!byCategory["Glitter"] || !!byCategory["Loose Pigment"];

  // ── Find matching trend ───────────────────────────────────────────────
  const trend =
    TREND_RULES.find(r => r.match({ intensityDots, occasion, hasGlitter })) ||
    TREND_RULES[TREND_RULES.length - 1];

  // ── Build palette ─────────────────────────────────────────────────────
  // Priority order per zone: use the first available product in the zone
  const skinProduct  = byCategory["Foundation"] || byCategory["BB Cream"] ||
                       byCategory["CC Cream"]    || byCategory["Skin Tint"] ||
                       byCategory["Tinted Moisturiser"];
  const blushProduct = byCategory["Blush"] || byCategory["Blush Stick"] || byCategory["Cream Blush"];
  const eyeProduct   = byCategory["Eyeshadow"] || byCategory["Loose Pigment"] ||
                       byCategory["Eyeliner"]   || byCategory["Glitter"];
  const lipProduct   = byCategory["Lipstick"]  || byCategory["Lip Gloss"] ||
                       byCategory["Lip Oil"]    || byCategory["Lip Stain"] ||
                       byCategory["Lip Topper"] || byCategory["Lip Plumper"];
  const bronzeProduct= byCategory["Bronzer"]   || byCategory["Cream Bronzer"] ||
                       byCategory["Contour"];
  const hlProduct    = byCategory["Highlighter"] || byCategory["Body Highlighter"];

  const palette = {
    skin:      productColour(skinProduct,   intensityDots) || "#e8c9a8",
    blush:     productColour(blushProduct,  intensityDots) || "#f09080",
    eye:       productColour(eyeProduct,    intensityDots) || "#b87aaa",
    lip:       productColour(lipProduct,    intensityDots) || "#c05060",
    bronze:    productColour(bronzeProduct, intensityDots) || "#b08040",
    highlight: productColour(hlProduct,     intensityDots) || "#f0d890",
  };

  // ── Zone emphasis ─────────────────────────────────────────────────────
  const applyZones = getApplyZones(steps, intensityDots);

  return {
    trendId:   trend.id,
    trendName: trend.name,
    moodDesc:  trend.moodDesc,
    aesthetic: trend.aesthetic,
    palette,
    applyZones,
  };
}
