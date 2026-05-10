/**
 * Inventory Matcher
 * For each preset look, calculates how much of it the user can replicate
 * using their existing products. Returns a match score, covered categories,
 * missing categories, and which actual products fill each requirement.
 */

// Category aliases — these product types can substitute for each other
const SUBSTITUTES = {
  "Foundation":    ["BB Cream", "CC Cream", "Skin Tint", "Tinted Moisturiser"],
  "BB Cream":      ["Foundation", "CC Cream", "Skin Tint", "Tinted Moisturiser"],
  "CC Cream":      ["Foundation", "BB Cream", "Skin Tint", "Tinted Moisturiser"],
  "Skin Tint":     ["Foundation", "BB Cream", "CC Cream", "Tinted Moisturiser"],
  "Blush":         ["Blush Stick", "Cream Blush"],
  "Blush Stick":   ["Blush", "Cream Blush"],
  "Cream Blush":   ["Blush", "Blush Stick"],
  "Bronzer":       ["Cream Bronzer", "Contour"],
  "Cream Bronzer": ["Bronzer", "Contour"],
  "Contour":       ["Bronzer", "Cream Bronzer"],
  "Lipstick":      ["Lip Stain", "Lip Gloss"],
  "Lip Gloss":     ["Lip Oil", "Lip Topper", "Lipstick"],
  "Lip Oil":       ["Lip Gloss", "Lip Topper"],
  "Eyeshadow":     ["Loose Pigment", "Glitter"],
  "Eyebrow":       ["Brow Lamination Gel", "Brow Soap"],
};

function groupByCategory(inventory) {
  const byCategory = {};
  inventory.forEach(p => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });
  return byCategory;
}

/**
 * Find which product(s) in inventory satisfy a required category,
 * including via substitutes.
 */
function findCoverage(requiredCat, byCategory) {
  // Direct match
  if (byCategory[requiredCat]?.length) {
    return { covered: true, via: requiredCat, product: byCategory[requiredCat][0], substitute: false };
  }
  // Substitute match
  const subs = SUBSTITUTES[requiredCat] || [];
  for (const sub of subs) {
    if (byCategory[sub]?.length) {
      return { covered: true, via: sub, product: byCategory[sub][0], substitute: true };
    }
  }
  return { covered: false, via: null, product: null, substitute: false };
}

/**
 * Main match function.
 * @param {Object} look - preset look from LIBRARY_LOOKS
 * @param {Array}  inventory - user's product inventory
 * @returns {Object} match result
 */
export function matchLookToInventory(look, inventory) {
  const byCategory = groupByCategory(inventory);
  const { required = [], optional = [] } = look;

  const requiredResults = required.map(cat => ({
    category:  cat,
    ...findCoverage(cat, byCategory),
    isRequired: true,
  }));

  const optionalResults = optional.map(cat => ({
    category:  cat,
    ...findCoverage(cat, byCategory),
    isRequired: false,
  }));

  const coveredRequired = requiredResults.filter(r => r.covered).length;
  const coveredOptional = optionalResults.filter(r => r.covered).length;

  // Score: required items worth 80%, optional worth 20%
  const reqScore = required.length > 0 ? (coveredRequired / required.length) * 80 : 80;
  const optScore = optional.length > 0 ? (coveredOptional / optional.length) * 20 : 20;
  const score    = Math.round(reqScore + optScore);

  const missingRequired = requiredResults.filter(r => !r.covered).map(r => r.category);
  const missingOptional = optionalResults.filter(r => !r.covered).map(r => r.category);

  // Readiness level
  let readiness;
  if (score === 100)       readiness = "perfect";   // can do it fully
  else if (score >= 80)    readiness = "ready";     // can do it with minor gaps
  else if (score >= 50)    readiness = "partial";   // can approximate
  else                     readiness = "missing";   // significant gaps

  return {
    score,
    readiness,
    coveredRequired,
    totalRequired:  required.length,
    coveredOptional,
    totalOptional:  optional.length,
    requiredResults,
    optionalResults,
    missingRequired,
    missingOptional,
  };
}

/**
 * Batch match all looks in the library.
 * Returns a map of lookId → match result.
 */
export function matchAllLooks(looks, inventory) {
  const results = {};
  looks.forEach(look => {
    results[look.id] = matchLookToInventory(look, inventory);
  });
  return results;
}

/** Readiness badge metadata */
export const READINESS_META = {
  perfect:  { label: "Ready to go",   colour: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a" },
  ready:    { label: "Almost ready",  colour: "#e11d48", bg: "#fff1f2", border: "#fecdd3", dot: "#fb7185" },
  partial:  { label: "Partial match", colour: "#d97706", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b" },
  missing:  { label: "Need products", colour: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", dot: "#9ca3af" },
};
