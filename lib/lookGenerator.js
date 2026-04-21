/**
 * Look Generator Engine
 * Builds a step-by-step makeup routine using only products in the user's inventory,
 * with fallback suggestions for missing categories.
 */

export function generateLook(inventory, profile, occasion, intensity, timeAvail) {
  const byCategory = groupByCategory(inventory);
  const pick = (cat) => byCategory[cat]?.[0] ?? null;
  const has = (cat) => !!byCategory[cat]?.length;

  const intensityDots = intensity.dots ?? 3;
  const isGlam = intensityDots >= 4;
  const isNatural = intensityDots <= 2;
  const isWork = occasion.includes("Work") || occasion.includes("Professional");
  const isDate = occasion.includes("Date");
  const isParty = occasion.includes("Party") || occasion.includes("Event") || occasion.includes("Special");

  const steps = [];
  const missing = [];

  // ── Skin Prep ─────────────────────────────────────────────────────────────
  if (has("Skincare Prep")) {
    steps.push({
      order: 1,
      category: "Skincare Prep",
      product: pick("Skincare Prep"),
      tip: "Apply to clean skin. Let absorb 60 seconds before any makeup.",
    });
  }

  if (has("Primer")) {
    steps.push({
      order: 2,
      category: "Primer",
      product: pick("Primer"),
      tip: "Dot over T-zone and blend outward. Extends foundation wear significantly.",
    });
  } else if (!isNatural) {
    missing.push({
      category: "Primer",
      reason: "Extends foundation wear 2–3× longer",
      priority: "medium",
    });
  }

  // ── Base ──────────────────────────────────────────────────────────────────
  if (has("Color Corrector") && !isNatural) {
    steps.push({
      order: 3,
      category: "Color Corrector",
      product: pick("Color Corrector"),
      tip: "Apply only where needed — under eyes, redness spots. Blend edges fully.",
    });
  }

  if (has("Foundation")) {
    steps.push({
      order: 4,
      category: "Foundation",
      product: pick("Foundation"),
      coverage: isNatural ? "Light" : isGlam ? "Full" : "Medium",
      tip: isNatural
        ? "Apply sparingly with fingers or damp sponge for a skin-like finish."
        : isGlam
        ? "Build in thin layers with damp sponge using pressing motions for full coverage."
        : "Blend with damp sponge from center outward. Let skin show through slightly.",
    });
  } else {
    missing.push({ category: "Foundation", reason: "Core base product", priority: "high" });
    steps.push({
      order: 4,
      category: "Foundation",
      product: null,
      tip: "Skip or substitute with tinted moisturizer if available.",
    });
  }

  if (has("Concealer")) {
    steps.push({
      order: 5,
      category: "Concealer",
      product: pick("Concealer"),
      tip: "Apply after foundation. Inverted triangle under eyes. Blend with ring finger — the lightest pressure.",
    });
  } else if (!isNatural) {
    missing.push({ category: "Concealer", reason: "Brightens under eyes & spots", priority: "medium" });
  }

  // ── Sculpt ────────────────────────────────────────────────────────────────
  if (has("Contour") && !isNatural) {
    steps.push({
      order: 6,
      category: "Contour",
      product: pick("Contour"),
      tip: "Hollow of cheeks, temples, and along jawline. Blend thoroughly — no harsh lines.",
    });
  }

  if (has("Bronzer")) {
    steps.push({
      order: 7,
      category: "Bronzer",
      product: pick("Bronzer"),
      tip: "3-position: forehead, cheeks, jaw. Mimic where the sun would naturally hit.",
    });
  }

  // ── Cheek Color ───────────────────────────────────────────────────────────
  if (has("Blush")) {
    steps.push({
      order: 8,
      category: "Blush",
      product: pick("Blush"),
      intensity: isNatural ? "Sheer" : isGlam ? "Bold" : "Medium",
      tip: isGlam
        ? "Layer blush sweeping up toward temples for a lifted, editorial effect."
        : "Smile lightly, apply to apples of cheeks, blend upward toward temples.",
    });
  } else {
    missing.push({ category: "Blush", reason: "Adds life and dimension to the face", priority: "medium" });
  }

  if (has("Highlighter") && !isNatural) {
    steps.push({
      order: 9,
      category: "Highlighter",
      product: pick("Highlighter"),
      tip: "Inner corner of eyes, cupid's bow, bridge of nose, top of cheekbones.",
    });
  }

  // ── Eyes ──────────────────────────────────────────────────────────────────
  if (has("Eye Primer")) {
    steps.push({
      order: 10,
      category: "Eye Primer",
      product: pick("Eye Primer"),
      tip: "Blend thin layer from lash line to brow bone. Prevents creasing and boosts pigment.",
    });
  }

  if (has("Eyeshadow")) {
    steps.push({
      order: 11,
      category: "Eyeshadow",
      product: pick("Eyeshadow"),
      tip: isNatural
        ? "Single shade wash across the lid — just enough to define without colour."
        : isGlam
        ? "Dark shade in outer V, mid shade across lid, light shade on inner corner and brow bone."
        : "Transition shade in crease, main shade on lid, light shade on inner corner.",
    });
  } else if (isGlam || isParty) {
    missing.push({ category: "Eyeshadow", reason: "Essential for dramatic looks", priority: "high" });
  }

  if (has("Eyeliner")) {
    steps.push({
      order: 12,
      category: "Eyeliner",
      product: pick("Eyeliner"),
      tip: isNatural
        ? "Tight-line the upper waterline only for invisible definition."
        : isGlam
        ? "Full liner on upper lid with a flick at the outer corner."
        : "Thin line close to the upper lash line.",
    });
  }

  if (has("Eyebrow")) {
    steps.push({
      order: 13,
      category: "Eyebrow",
      product: pick("Eyebrow"),
      tip: "Fill sparse areas with light, hair-like strokes. Always brush through after to blend.",
    });
  } else {
    missing.push({ category: "Eyebrow", reason: "Frames the entire face — high impact", priority: "high" });
  }

  if (has("Mascara")) {
    steps.push({
      order: 14,
      category: "Mascara",
      product: pick("Mascara"),
      tip: isGlam
        ? "Three coats, wiggling wand at root each time. Let each coat dry before the next."
        : "One to two coats focusing on the roots to lift the lashes.",
    });
  } else {
    missing.push({ category: "Mascara", reason: "Opens and defines eyes — essential", priority: "high" });
  }

  // ── Lips ──────────────────────────────────────────────────────────────────
  if (has("Lip Liner")) {
    steps.push({
      order: 15,
      category: "Lip Liner",
      product: pick("Lip Liner"),
      tip: "Outline lips then fill in entirely — this is the single best trick for long-lasting lip colour.",
    });
  }

  if (has("Lipstick")) {
    steps.push({
      order: 16,
      category: "Lipstick",
      product: pick("Lipstick"),
      tip: isNatural
        ? "Blot once with a tissue for a natural stained effect."
        : isGlam
        ? "Apply, blot, dust with powder, reapply — bulletproof longevity."
        : "Apply and blot lightly for comfortable wear.",
    });
  } else if (has("Lip Gloss")) {
    steps.push({
      order: 16,
      category: "Lip Gloss",
      product: pick("Lip Gloss"),
      tip: "Apply to the center of the lip and press together to spread evenly.",
    });
  } else {
    missing.push({ category: "Lipstick", reason: "Completes any look", priority: "medium" });
  }

  // ── Set ───────────────────────────────────────────────────────────────────
  if (has("Setting Powder")) {
    steps.push({
      order: 17,
      category: "Setting Powder",
      product: pick("Setting Powder"),
      tip: isGlam
        ? "Bake under eyes: apply generously, let sit 5 minutes, then dust away for zero-crease finish."
        : "Light dusting over T-zone to control shine without masking skin.",
    });
  }

  if (has("Setting Spray")) {
    steps.push({
      order: 18,
      category: "Setting Spray",
      product: pick("Setting Spray"),
      tip: "Hold 8 inches from face. Mist in an X pattern then a T pattern. Let dry naturally — never rub.",
    });
  } else if (!isNatural) {
    missing.push({ category: "Setting Spray", reason: "Locks the look for hours", priority: "low" });
  }

  // ── Harmony Analysis ──────────────────────────────────────────────────────
  const analysis = buildHarmonyAnalysis(profile, occasion, isWork, isDate, isGlam);

  const productSteps = steps.filter((s) => s.product);
  const estimatedMinutes = productSteps.length * (isGlam ? 4 : isNatural ? 1.5 : 2.5);

  return {
    steps,
    missing,
    analysis,
    occasion,
    intensity,
    estimatedMinutes: Math.round(estimatedMinutes),
    productCount: productSteps.length,
  };
}

function groupByCategory(inventory) {
  return inventory.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});
}

function buildHarmonyAnalysis(profile, occasion, isWork, isDate, isGlam) {
  const notes = [];
  const ut = profile?.undertone;

  if (ut === "Warm") {
    notes.push("Warm undertone: Golden and peachy tones harmonise naturally with your skin. Avoid stark cool pinks or ashy bronzers.");
  } else if (ut === "Cool") {
    notes.push("Cool undertone: Pink-based blushes and mauve lip shades will complement your natural colouring. Avoid heavy orange bronzers.");
  } else if (ut === "Neutral") {
    notes.push("Neutral undertone: You have maximum flexibility — both warm and cool tones work. You can mix product families freely.");
  } else if (ut === "Olive") {
    notes.push("Olive undertone: Warm terracotta blushes and bronzy highlights flatter most. Avoid stark pinks or overly pale highlighters.");
  }

  if (isWork) {
    notes.push("Professional setting: Sharp but understated eye definition reads polished. Keep lips neutral for a cohesive corporate look.");
  }
  if (isDate) {
    notes.push("Date look: Choose one hero element — either a bold lip or defined eyes, not both simultaneously — for an effortlessly intentional finish.");
  }
  if (isGlam) {
    notes.push("Full glam: Layer products for maximum impact, but blend every edge — even heavy makeup should feel seamless, never muddy.");
  }

  if (profile?.faceShape === "round") {
    notes.push("Round face: Sweep blush diagonally toward temples rather than on the apples. This lifts the face and adds length visually.");
  } else if (profile?.faceShape === "square") {
    notes.push("Square face: Soften the jawline with contour at the jaw corners. Apply blush high and inward to balance strong angles.");
  } else if (profile?.faceShape === "heart") {
    notes.push("Heart face: Apply blush in the middle of the cheeks — avoid sweeping too high, which amplifies the wide forehead.");
  }

  return notes;
}
