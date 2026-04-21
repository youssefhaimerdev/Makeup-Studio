/**
 * Smart Pairings Engine
 * Generates color harmony and product combination suggestions
 * based on the user's inventory and skin profile.
 */

function groupByCategory(inventory) {
  return inventory.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});
}

export function getPairings(inventory, profile) {
  const byCategory = groupByCategory(inventory);
  const has = (cat) => !!byCategory[cat]?.length;
  const get = (cat) => byCategory[cat]?.[0] ?? null;

  const suggestions = [];
  const ut = profile?.undertone ?? "Neutral";

  // ── Colour harmony pairings ───────────────────────────────────────────────
  if (has("Blush") && has("Lipstick")) {
    suggestions.push({
      type: "Harmony",
      icon: "💄",
      title: "Blush × Lip Harmony",
      desc: `Blush and lipstick in the same colour family (both peachy, both rosy, both berry) create instant cohesion — they don't need to match exactly. With your ${ut} undertone, look for ${
        ut === "Warm" ? "peachy-terracotta or warm nude" : ut === "Cool" ? "pink-rose or cool mauve" : "rose or neutral pink"
      } shades in both.`,
      products: [get("Blush"), get("Lipstick")].filter(Boolean),
    });
  }

  if (has("Eyeshadow") && has("Blush")) {
    suggestions.push({
      type: "Balance",
      icon: "✦",
      title: "Eye × Cheek Balance",
      desc: "The rule of three: bold eyes pair with sheer blush and a neutral lip. Bold blush works with understated eyes and a defined lip. Avoid letting both eyes and cheeks compete — one should lead, the others support.",
      products: [get("Eyeshadow"), get("Blush")].filter(Boolean),
    });
  }

  if (has("Foundation") && has("Concealer")) {
    suggestions.push({
      type: "Technique",
      icon: "🎨",
      title: "Foundation → Concealer Order",
      desc: "Apply concealer after foundation, not before. Foundation covers most imperfections first, so you use far less concealer and the result is more natural. Spot-treat only what foundation didn't fully cover.",
      products: [get("Foundation"), get("Concealer")].filter(Boolean),
    });
  }

  if (has("Highlighter") && has("Bronzer")) {
    suggestions.push({
      type: "Sculpt",
      icon: "✨",
      title: "Highlight × Bronzer Sculpt",
      desc: "Place bronzer where shadow falls naturally: hollow under cheekbones, temples, along the jawline. Place highlighter where light catches: top of cheekbones, brow bone, bridge of nose, Cupid's bow. The contrast between the two creates three-dimensional structure.",
      products: [get("Highlighter"), get("Bronzer")].filter(Boolean),
    });
  }

  if (has("Primer") && has("Setting Spray")) {
    suggestions.push({
      type: "Technique",
      icon: "🔒",
      title: "Primer + Setting Spray Sandwich",
      desc: "Primer before foundation and setting spray after creates a 'makeup sandwich' that dramatically extends wear. The spray locks everything in and removes any powdery cast, returning skin-like finish.",
      products: [get("Primer"), get("Setting Spray")].filter(Boolean),
    });
  }

  if (has("Eyebrow") && has("Mascara")) {
    suggestions.push({
      type: "Technique",
      icon: "👁",
      title: "Brow + Lash Framing",
      desc: "Defined brows and lifted lashes frame the eye completely. Apply brow product first to set the shape, then mascara. This pair alone (without any eyeshadow) creates a polished, wide-awake look.",
      products: [get("Eyebrow"), get("Mascara")].filter(Boolean),
    });
  }

  if (has("Contour") && has("Blush")) {
    suggestions.push({
      type: "Sculpt",
      icon: "🌟",
      title: "Contour + Blush Placement",
      desc: "Contour lives just below the cheekbone, blush sits just above it. Applied correctly they work together to create the illusion of prominent, lifted cheekbones. Never let them blend into each other — keep them in distinct zones.",
      products: [get("Contour"), get("Blush")].filter(Boolean),
    });
  }

  // ── Profile-specific suggestions ─────────────────────────────────────────
  if (profile?.skinType === "Oily") {
    suggestions.push({
      type: "Skin Type",
      icon: "💧",
      title: "Oily Skin Strategy",
      desc: "For oily skin: matte primer on the T-zone, pressed powder foundation or powder setting bake under eyes, and setting spray as a final lock. Avoid cream products directly on areas that get shiny.",
      products: [...(byCategory["Primer"] ?? []), ...(byCategory["Setting Powder"] ?? [])].slice(0, 2),
    });
  }

  if (profile?.skinType === "Dry") {
    suggestions.push({
      type: "Skin Type",
      icon: "🌸",
      title: "Dry Skin Strategy",
      desc: "For dry skin: hydrating primer creates a smooth base, cream or liquid formulas blend more naturally than powder, and setting spray prevents that powdery look. Avoid baking and heavy setting powder.",
      products: [...(byCategory["Primer"] ?? []), ...(byCategory["Setting Spray"] ?? [])].slice(0, 2),
    });
  }

  // ── Gap warnings ──────────────────────────────────────────────────────────
  const essentials = ["Foundation", "Mascara", "Eyebrow", "Blush"];
  essentials.forEach((cat) => {
    if (!has(cat)) {
      suggestions.push({
        type: "Gap",
        icon: "⚠",
        title: `Missing: ${cat}`,
        desc: {
          Foundation: "Foundation is the single most impactful base product — it evens tone and creates a canvas. Even a BB cream counts.",
          Mascara: "Mascara opens and defines eyes dramatically. It's one of the highest-impact products for the least effort.",
          Eyebrow: "Brows frame the entire face. Even a clear gel to groom them elevates any look without adding colour.",
          Blush: "Blush is the most underrated product. It adds life, warmth, and dimension — a look without it can appear flat.",
        }[cat],
        products: [],
      });
    }
  });

  return suggestions;
}

export function getInventoryStats(inventory) {
  const covered = [...new Set(inventory.map((p) => p.category))];
  const essential = ["Foundation", "Concealer", "Mascara", "Eyebrow", "Blush", "Lipstick", "Setting Powder", "Primer"];
  const missing = essential.filter((cat) => !covered.includes(cat));
  const duplicates = Object.entries(
    inventory.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1;
      return acc;
    }, {})
  )
    .filter(([, count]) => count > 1)
    .map(([cat, count]) => ({ category: cat, count }));

  return { covered, missing, duplicates, total: inventory.length };
}
