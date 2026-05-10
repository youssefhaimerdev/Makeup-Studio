/**
 * Look Generator Engine
 * Builds a step-by-step makeup routine using only products in the user's inventory,
 * with fallback suggestions for missing categories.
 */

import { classifyLook } from "./lookClassifier";

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

  const baseResult = {
    steps,
    missing,
    analysis,
    occasion,
    intensity,
    estimatedMinutes: Math.round(estimatedMinutes),
    productCount: productSteps.length,
  };

  // Classify look → trend name, palette, aesthetic tags, face zones
  const classification = classifyLook(baseResult, profile);

  return { ...baseResult, ...classification };
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
  const ut       = profile?.undertone;
  const concerns = profile?.skinConcerns || [];
  const eyeCol   = profile?.eyeColour;
  const hairCol  = profile?.hairColour;
  const glasses  = profile?.wearsGlasses;

  // ── Undertone ────────────────────────────────────────────────────────────
  if (ut === "Warm") {
    notes.push("Warm undertone: Golden and peachy tones harmonise naturally. Avoid stark cool pinks or ashy bronzers.");
  } else if (ut === "Cool") {
    notes.push("Cool undertone: Pink-based blushes and mauve lip shades complement your colouring. Avoid heavy orange bronzers.");
  } else if (ut === "Neutral") {
    notes.push("Neutral undertone: Maximum flexibility — both warm and cool tones work. Mix product families freely.");
  } else if (ut === "Olive") {
    notes.push("Olive undertone: Warm terracotta blushes and bronzy highlights flatter most. Avoid stark cool pinks.");
  }

  // ── Occasion ─────────────────────────────────────────────────────────────
  if (isWork) notes.push("Professional setting: Sharp but understated eye definition reads polished. Keep lips neutral.");
  if (isDate) notes.push("Date look: One hero element — bold lip OR defined eyes, not both. Effortlessly intentional.");
  if (isGlam) notes.push("Full glam: Layer for maximum impact, but blend every edge — seamless, never muddy.");

  // ── Face shape ───────────────────────────────────────────────────────────
  if (profile?.faceShape === "round") {
    notes.push("Round face: Sweep blush diagonally toward temples — not on the apples. Adds length visually.");
  } else if (profile?.faceShape === "square") {
    notes.push("Square face: Contour jaw corners to soften. Blush high and inward to balance strong angles.");
  } else if (profile?.faceShape === "heart") {
    notes.push("Heart face: Blush in the middle of the cheeks — sweeping too high amplifies the wide forehead.");
  } else if (profile?.faceShape === "oblong") {
    notes.push("Oblong face: Blush horizontally across cheeks for width. Avoid highlighting down the nose bridge.");
  } else if (profile?.faceShape === "diamond") {
    notes.push("Diamond face: Highlight forehead and chin to add width. Blush on cheek centres, not the high point.");
  }

  // ── Eye colour → shadow harmony ──────────────────────────────────────────
  if (eyeCol) {
    const eyeAdvice = {
      brown:      "Your brown eyes suit almost every shadow. Copper, purple, and teal make them appear most vibrant.",
      dark_brown: "Gold, bronze, and terracotta warm up dark brown eyes. Navy and deep plum create beautiful contrast.",
      hazel:      "Purple shadows pull out the green; olive and khaki intensify the brown tones in hazel eyes.",
      green:      "Reddish and copper tones contrast with green eyes and make them pop. Avoid matching greens — they mute the iris.",
      blue:       "Bronze, copper, and warm terracotta contrast beautifully with blue eyes. Avoid cool blue-on-blue.",
      grey:       "Purple and mauve deepen grey eyes. Pink brightens them. Charcoal liner intensifies the natural hue.",
      amber:      "Deep purple, navy, and forest green complement amber eyes. Avoid orange shadows — too similar to the iris.",
    };
    if (eyeAdvice[eyeCol]) notes.push(`Eye colour tip: ${eyeAdvice[eyeCol]}`);
  }

  // ── Hair colour → brow shade ─────────────────────────────────────────────
  if (hairCol) {
    const browAdvice = {
      black:        "Fill brows with dark brown — pure black can read harsh. Precise strokes give a natural result.",
      dark_brown:   "A shade 1–2 tones lighter than your hair avoids the drawn-on look for brows.",
      medium_brown: "Medium taupe or soft brown is your most flattering brow shade.",
      light_brown:  "Light taupe pencil for brows — a clear brow gel alone can often be enough.",
      dirty_blonde: "Light taupe brow product only. Clear soap brow gel gives a polished effortless finish.",
      blonde:       "Blonde or ash-blonde brow colour — anything darker disconnects brows from hair.",
      platinum:     "Very light taupe or blonde tinted brow gel — keep it soft and natural.",
      red:          "Warm auburn or light brown brow shade to mirror your hair's warmth.",
      auburn:       "Warm medium brown brow pencil mirrors auburn hair naturally.",
      grey:         "Soft taupe or greige brow product — avoid warm browns, which clash with silver hair.",
      coloured:     "Match brow product to your natural root colour, not the dyed shade.",
    };
    if (browAdvice[hairCol]) notes.push(`Brow tip: ${browAdvice[hairCol]}`);
  }

  // ── Glasses ──────────────────────────────────────────────────────────────
  if (glasses) {
    notes.push("Glasses tip: Lenses magnify, so precise blending matters more than intensity. Define brows clearly — frames draw the eye upward.");
  }

  // ── Skin concerns → base adjustments ─────────────────────────────────────
  if (concerns.includes("acne")) {
    notes.push("Acne concern: Build coverage gradually in blemish areas rather than packing on product — it emphasises texture.");
  }
  if (concerns.includes("dark_circles")) {
    notes.push("Dark circles: A peach or salmon colour corrector under concealer neutralises blue-grey shadows most effectively.");
  }
  if (concerns.includes("redness")) {
    notes.push("Redness: A green-tinted primer or CC cream neutralises redness before any base product.");
  }
  if (concerns.includes("large_pores")) {
    notes.push("Large pores: A silicone-based pore primer before foundation creates a smoother canvas.");
  }
  if (concerns.includes("fine_lines")) {
    notes.push("Fine lines: Use setting spray instead of heavy powder — it sets without settling into lines.");
  }
  if (concerns.includes("dry_patches")) {
    notes.push("Dry patches: Let your hydrating serum fully absorb before applying any base product.");
  }
  if (concerns.includes("oiliness")) {
    notes.push("Excess oiliness: A mattifying primer on the T-zone and a light pressed powder extend wear significantly.");
  }
  if (concerns.includes("dullness")) {
    notes.push("Dullness: A luminous primer before foundation adds radiance from underneath — more effective than surface highlighter alone.");
  }

  return notes;
}
