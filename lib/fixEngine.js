/**
 * Fix My Makeup Engine
 * Diagnoses makeup problems and returns correction steps
 * with relevant products from the user's inventory.
 * 21 total diagnoses covering the most common real-world problems.
 */

function groupByCategory(inventory) {
  return inventory.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});
}

const DIAGNOSES = [

  // ── BASE & SKIN ────────────────────────────────────────────────────────

  {
    id: "orange",
    zone: "Base",
    keywords: ["orange", "too warm", "too yellow", "looks warm"],
    diagnosis:
      "Your foundation or bronzer has a warmer undertone than your skin, or bronzer is applied too heavily in unnatural areas.",
    steps: [
      "Check your foundation undertone in natural daylight — hold the product near your jaw outdoors. Warm foundations carry golden-orange pigment that reads orange on neutral or cool skin.",
      "If bronzer is the culprit, apply only where the sun would naturally hit: the forehead, the high points of the cheeks, and the nose. Never all over the face.",
      "Dust a very light layer of pink-tinted or cool setting powder over the face to neutralise excess warmth without adding coverage.",
      "A lavender-toned colour corrector pressed lightly over the base before powder can counteract yellow-orange casts.",
    ],
    productCategories: ["Setting Powder", "Concealer", "Color Corrector"],
    tip: "Foundations marked 'C' (cool) or 'N' (neutral) in the shade code resist the orange shift that 'W' (warm) shades produce on cooler-toned skin.",
  },

  {
    id: "too-dark",
    zone: "Base",
    keywords: ["too dark", "foundation dark", "mask", "darker than", "lighter than skin"],
    diagnosis:
      "The foundation shade is too deep for your skin tone, creating a visible mask line at the jaw or hairline.",
    steps: [
      "Blend foundation all the way down the neck and onto the décolletage — this eliminates the harsh cutoff line even if the shade isn't perfect.",
      "Mix a small amount of lightweight moisturiser or SPF into the foundation before application to sheer it out and lighten it by half a shade.",
      "Apply a brighter concealer on the centre of the forehead, nose bridge, and under the eyes to pull attention away from the depth mismatch.",
      "Set with a translucent powder to unify the surface tone across the face.",
    ],
    productCategories: ["Concealer", "Setting Powder", "Primer"],
    tip: "The correct foundation shade disappears completely at the jaw in natural light. Test outside, never under fluorescent store lighting.",
  },

  {
    id: "separated",
    zone: "Base",
    keywords: ["separated", "separation", "cracks", "sliding off", "foundation sliding", "midday", "noon", "by noon", "wears off", "doesn't last", "shiny by noon", "skin shiny", "oily by"],
    diagnosis:
      "Foundation is separating, sliding, or breaking down due to excess oil production, missing primer, or a formula that conflicts with your skin type.",
    steps: [
      "Apply a mattifying or pore-filling primer on the T-zone before foundation — this creates a grip layer that delays oil breakthrough significantly.",
      "Set immediately after foundation with a pressed or loose setting powder, pressing (not sweeping) into the skin.",
      "Carry blotting papers or a pressed powder for midday touch-ups — blot first, then lightly press powder on top, never powder over shine directly.",
      "Switch to a foundation formula designed for oily skin — these have lower oil content and higher silica levels that absorb sebum throughout the day.",
    ],
    productCategories: ["Primer", "Setting Powder", "Setting Spray"],
    tip: "Setting spray applied in an X-then-T pattern after powder locks everything together and reduces midday breakdown more than powder alone.",
  },

  {
    id: "ashy-powder",
    zone: "Base",
    keywords: ["ashy powder", "powder ashy", "setting powder ashy", "looks grey", "grey powder", "washed out powder", "powder too light", "flashback", "white cast"],
    diagnosis:
      "Setting powder is too light or contains high levels of silica that create a grey/white cast — particularly visible in flash photography or on deeper skin tones.",
    steps: [
      "Switch to a translucent powder that is specifically labelled 'for deeper skin tones' or a banana/yellow-toned powder — these don't leave a white cast.",
      "Apply powder only where truly needed (T-zone and under eyes) rather than all over — less powder means less chance of ashy buildup.",
      "Use a damp beauty sponge to press powder into the skin rather than a dry brush — dampening removes the flashback-causing silica excess.",
      "Try a finely milled pressed powder instead of loose — it's easier to control the amount applied.",
    ],
    productCategories: ["Setting Powder", "Setting Spray"],
    tip: "The worst offenders for white cast are high-silica translucent powders. If you're on camera or in flash photography, a light sweep of setting spray after powder eliminates the effect.",
  },

  // ── CONCEALER ──────────────────────────────────────────────────────────

  {
    id: "grey-concealer",
    zone: "Concealer",
    keywords: ["concealer grey", "grey concealer", "ashy concealer", "concealer ashy", "concealer too light", "under eye grey", "concealer dark circles worse"],
    diagnosis:
      "The concealer shade is too light or has a pink/white undertone that conflicts with the blue-grey undertone of dark circles, making them look more grey rather than brightened.",
    steps: [
      "Use a peach or salmon colour corrector under your concealer first — this neutralises the blue-grey pigment in dark circles before concealer goes on top.",
      "Choose a concealer that is only 1–2 shades lighter than your foundation, not dramatically lighter — the brightening comes from the colour corrector, not the concealer lightness.",
      "Set the under-eye concealer with a finely milled yellow or peach-toned powder rather than a cool translucent powder, which amplifies grey tones.",
      "Blend concealer with a damp sponge using pressing motions — dragging activates the greying effect.",
    ],
    productCategories: ["Color Corrector", "Concealer", "Setting Powder"],
    tip: "The rule: colour correct first to neutralise, then conceal to cover. Skipping the corrector means your concealer has to fight the undertone alone — and it usually loses.",
  },

  {
    id: "concealer-crease",
    zone: "Concealer",
    keywords: ["concealer crease", "concealer folding", "under eye crease", "creasing under eye"],
    diagnosis:
      "Concealer is settling into fine lines under the eyes, usually due to a formula that is too thick, too dry, or too much product applied.",
    steps: [
      "Use less concealer — apply in a thin layer using a damp sponge, pat rather than drag.",
      "Let each layer of skincare fully absorb before applying concealer — eye cream in particular causes concealer to slide and crease when not fully set.",
      "Set with a very light dusting of finely milled powder — just enough to set, not enough to build coverage.",
      "Avoid full-coverage or dry-formula concealers under the eye — this area moves constantly, so a flexible, hydrating formula holds up better.",
    ],
    productCategories: ["Concealer", "Setting Powder", "Eye Primer"],
    tip: "The 'baking' technique — applying powder heavily and letting it sit — actually worsens creasing in older skin or drier skin types. A light press is more effective.",
  },

  // ── EYES ───────────────────────────────────────────────────────────────

  {
    id: "no-payoff",
    zone: "Eyes",
    keywords: ["no payoff", "eyeshadow no payoff", "shadow faint", "can't see shadow", "shadow invisible", "shadow light", "eyeshadow doesn't show", "shadow not showing"],
    diagnosis:
      "Eyeshadow pigment is not transferring properly to the lid, usually due to oily lids, no primer base, or application technique — sweeping instead of packing.",
    steps: [
      "Apply an eye primer or a thin layer of concealer over the entire eyelid before any shadow — this creates a sticky base for the pigment to grip.",
      "Switch your technique: pack the shadow with a flat brush using light pressing motions, then blend edges with a fluffy brush. Swiping back and forth picks up pigment and moves it around without depositing.",
      "Set the primer with a translucent powder before shadow — this gives an extra layer of grip and reduces oil transfer from the lid.",
      "Dampen your flat shader brush slightly before dipping into the shadow — a damp brush dramatically increases colour payoff for any shadow formula.",
    ],
    productCategories: ["Eye Primer", "Setting Powder", "Eyeshadow"],
    tip: "The order that almost always fixes low payoff: primer → powder base → pack shadow wet with flat brush → blend edges dry with fluffy brush.",
  },

  {
    id: "clumpy-mascara",
    zone: "Eyes",
    keywords: ["clump", "clumpy mascara", "lashes clump", "mascara clumps", "lashes stick together", "spider lashes", "glob"],
    diagnosis:
      "Mascara is clumping due to too much product on the wand, applying over not-yet-dry coats, or a formula that has started to dry out inside the tube.",
    steps: [
      "Wipe excess mascara from the wand on a tissue before each application — most clumping comes from too much product on the brush, not the formula itself.",
      "Wait 20–30 seconds between each coat of mascara — applying over a wet coat always creates clumps as the two wet layers merge.",
      "Use a clean mascara wand or lash comb immediately after application to separate any stuck lashes while the mascara is still slightly wet.",
      "Apply the first coat in a zigzag motion at the roots to add volume, then brush straight up through the tips — this separates rather than globs.",
    ],
    productCategories: ["Mascara"],
    tip: "If your mascara tube is more than 3 months old, the formula begins to dry and thicken — this is the most common cause of persistent clumping regardless of technique.",
  },

  {
    id: "drawn-brows",
    zone: "Eyes",
    keywords: ["drawn on brow", "drawn brows", "brows look fake", "brows unnatural", "brows too harsh", "brows blocky", "brows too dark", "brow look fake", "harsh brows"],
    diagnosis:
      "Brows look harsh or artificial because the product is too dark, too heavily applied, or applied in solid block strokes rather than hair-like flicks.",
    steps: [
      "Choose a brow product one to two shades lighter than your actual hair — matching exactly reads too solid against the skin.",
      "Use a fine-tipped pencil or micro-blade brow pen to draw short, hair-like strokes in the direction of natural growth — never solid lines or fills.",
      "After any pencil or powder application, brush through the brows with a clean spoolie to break up the product and blend it into natural hairs.",
      "Apply product only to sparse areas, not over areas where you already have hair — you're filling gaps, not drawing an entirely new brow.",
    ],
    productCategories: ["Eyebrow", "Brow Lamination Gel", "Brow Soap"],
    tip: "The biggest brow mistake is going too dark. A brow that's too light can always be deepened; a brow that's too dark reads artificial no matter how good the technique.",
  },

  // ── CONTOURING & SCULPTING ─────────────────────────────────────────────

  {
    id: "muddy-contour",
    zone: "Contour",
    keywords: ["muddy contour", "contour muddy", "contour dirty", "contour grey", "contour looks wrong", "contour stripe", "harsh contour", "contour too dark"],
    diagnosis:
      "Contour reads as a muddy or dirty stripe rather than natural shadow — usually from the wrong shade (too grey, too dark, or wrong undertone) or poor blending.",
    steps: [
      "The correct contour shade should be 2–3 shades deeper than your foundation with a neutral-to-warm undertone — grey or cool-toned contour reads as dirt or shadow, not natural depth.",
      "Blend the contour product in small circular motions moving upward toward the temples, not in a single downward swipe — the stripe effect comes from a single unblended line.",
      "If you've over-applied, press a damp sponge lightly over the area — this sheers and blends without removing the effect entirely.",
      "Build contour in very thin layers — it's significantly easier to add than to remove.",
    ],
    productCategories: ["Contour", "Bronzer", "Setting Spray"],
    tip: "Bronzer and contour are not the same product. Bronzer adds warmth and sun-kiss. Contour creates shadow. Use the wrong one for the wrong purpose and the result always reads off.",
  },

  {
    id: "dirty-bronzer",
    zone: "Contour",
    keywords: ["bronzer dirty", "dirty bronzer", "bronzer muddy", "bronzer wrong", "bronzer too dark", "bronzer looks bad", "bronzer orange"],
    diagnosis:
      "Bronzer is reading as muddy, orange, or dirty rather than sun-kissed — caused by placement in the wrong areas, too much product, or a shade that doesn't suit your undertone.",
    steps: [
      "Bronzer belongs only in the '3 position' — a loose figure 3 from the forehead, sweeping the outer cheeks, and finishing at the jaw. Never in the hollow of the cheeks (that's contour) or on the nose tip.",
      "Use a large, fluffy, dome-shaped brush and very light circular motions — dense, stiff brushes pack too much product and create harsh edges.",
      "Tap excess product off your brush before applying — the amount that seems 'not enough' is almost always closer to the correct amount.",
      "For warm undertones, choose a bronzer with golden pigment. For cool undertones, choose a bronzer with a taupe or neutral base. Orange-toned bronzers clash with cool and neutral skin.",
    ],
    productCategories: ["Bronzer", "Cream Bronzer", "Setting Spray"],
    tip: "If you can see a clear edge where your bronzer ends, you've used too much or blended too little. The goal is 'where does it start?' not 'where does it stop?'",
  },

  // ── HIGHLIGHTER ────────────────────────────────────────────────────────

  {
    id: "chalky-highlight",
    zone: "Highlight",
    keywords: ["chalky highlight", "highlight chalky", "highlight not glowy", "highlight powdery", "highlight looks white", "highlight ashy", "highlight flat", "highlight not glowing", "highlight dull"],
    diagnosis:
      "Highlighter looks chalky, powdery, or flat rather than glowing — caused by a formula with too much white filler, wrong placement, or dry skin underneath absorbing the product.",
    steps: [
      "Apply highlighter only to the highest, most prominent points where light physically hits: the very top of the cheekbones, the inner corner of the eyes, the bridge of the nose, and the cupid's bow. Wider placement dilutes the glow and reads as shimmer, not highlight.",
      "Press the highlighter with your ring finger instead of a brush — body heat melts the product into the skin for a lit-from-within effect that brushes can't replicate.",
      "If your skin is dry, apply a drop of face oil or illuminating primer to the cheekbones before highlighter — dry skin absorbs the shimmer and kills the glow.",
      "Try a liquid or cream highlighter formula rather than powder — these fuse with the skin rather than sitting on top of it.",
    ],
    productCategories: ["Highlighter", "Setting Spray", "Primer"],
    tip: "A small amount of highlighter pressed precisely reads more luxurious than a large amount swept broadly. Less surface area, more intensity.",
  },

  // ── LIPS ───────────────────────────────────────────────────────────────

  {
    id: "harsh-liner",
    zone: "Lips",
    keywords: ["harsh liner", "lip liner harsh", "liner too obvious", "liner visible", "liner looks fake", "liner dark", "liner too dark", "outlined lips"],
    diagnosis:
      "Lip liner is showing as a harsh, visible border rather than blending naturally — from a shade too dark, not filling in the lip, or liner applied over dry lips.",
    steps: [
      "Choose a lip liner that matches your lipstick shade exactly, or matches your natural lip colour — a liner darker than the lipstick always shows as a border.",
      "After lining, fill the entire lip with the liner before applying lipstick — when liner extends over the whole lip, there's no visible border between liner and colour.",
      "Blend the inner edge of the liner inward with a lip brush or fingertip — this feathers the edge so there's no sharp transition.",
      "Avoid applying liner over dry, chapped lips — the liner clings to dry patches and reads uneven.",
    ],
    productCategories: ["Lip Liner", "Lipstick", "Concealer"],
    tip: "The 'my-lips-but-better' approach: a lip liner matching your natural lip colour, filled in all over, with a sheer lipstick on top. Zero harshness, maximum longevity.",
  },

  // ── COLOUR CORRECTOR ───────────────────────────────────────────────────

  {
    id: "corrector-showing",
    zone: "Base",
    keywords: ["colour corrector showing", "color corrector showing", "corrector visible", "green showing through", "peach showing", "corrector too much", "corrector orange", "can see corrector"],
    diagnosis:
      "The colour corrector is visible through the foundation, usually from too much product, not enough foundation coverage on top, or a corrector shade that's too saturated.",
    steps: [
      "Apply colour corrector in the thinnest possible layer — it needs only enough pigment to neutralise, not to cover. One thin press with a fingertip is almost always sufficient.",
      "Let the corrector fully dry before applying foundation on top — 30 to 60 seconds. Applying foundation over a wet corrector moves and activates it.",
      "Build foundation in thin layers over the corrected area rather than applying one heavy coat — multiple thin layers hide the corrector more effectively without disturbing it.",
      "If green corrector is showing, it means too much was applied. Remove gently with a damp sponge and start again with a smaller amount.",
    ],
    productCategories: ["Color Corrector", "Foundation", "Concealer"],
    tip: "Green corrector should be completely invisible under foundation. If you can still see it at all after application, you've applied too much. The neutralising happens with a microscopic amount.",
  },

  // ── CONTINUED: BASE & SKIN ─────────────────────────────────────────────

  {
    id: "flat",
    zone: "Base",
    keywords: ["flat", "dull", "lifeless", "boring", "no dimension", "one-dimensional", "no depth"],
    diagnosis:
      "The look lacks dimension — likely missing highlight contrast, blush is placed too low, or all products have the same finish with no variation.",
    steps: [
      "Reapply blush higher on the cheekbones, sweeping toward the temples — this lifts the face visually. Blush on the apples of the cheeks reads flat because it adds colour without direction.",
      "Add highlighter only to the very top of the cheekbones, inner corners of the eyes, bridge of the nose, and cupid's bow — precision creates glow, broad application creates shimmer.",
      "Deepen the outer corners of the eyes with a mid-tone shadow even if doing a 'no-makeup' look — shadow creates depth that stops everything reading as one flat surface.",
      "A subtle bronze sweep just under the cheekbones creates shadow contrast that makes the highlights above read more dramatically.",
    ],
    productCategories: ["Blush", "Highlighter", "Bronzer", "Eyeshadow"],
    tip: "Dimension is contrast: where light advances and where shadow recedes. Every flattering look has both, even minimal ones.",
  },

  {
    id: "cakey",
    zone: "Base",
    keywords: ["cakey", "heavy", "thick", "chunky", "over applied", "cake", "too much makeup"],
    diagnosis:
      "Too much product has been layered without proper blending, or makeup was applied over dry, unprepped skin that caused product to cling unevenly.",
    steps: [
      "Dampen a clean beauty sponge, squeeze out all water, then press (never drag) it over the face — this removes excess product and melds layers together for a skin-like finish.",
      "Mist setting spray over the face and immediately press a tissue gently over the surface — this lifts excess powder and product without disturbing coverage.",
      "Going forward: apply all base products in multiple thin layers rather than one heavy coat. The finish of three thin layers is always better than one thick one.",
      "If skin is dry underneath, no amount of technique fixes the cakiness — remove everything, moisturise thoroughly, wait 5 minutes, then reapply.",
    ],
    productCategories: ["Setting Spray", "Setting Powder"],
    tip: "Damp sponges always produce a less cakey result than dry brushes for foundation. The dampness sheers and presses simultaneously.",
  },

  {
    id: "crease",
    zone: "Eyes",
    keywords: ["crease", "eyeshadow crease", "fold", "eye crease"],
    diagnosis:
      "Eyeshadow is settling into the crease line due to oily lids, no primer, or product applied too heavily in one layer.",
    steps: [
      "Set eyelids with a light layer of translucent powder before any eyeshadow — this absorbs oil and creates a grippy surface for pigment.",
      "Apply an eye primer or thin layer of concealer over the lid and blend fully before shadow application.",
      "Pack shadow with a flat brush using pressing motions — swiping moves product into the crease; pressing deposits it on the lid.",
      "Avoid applying shadow directly over any unabsorbed skincare or moisturiser on the lid.",
    ],
    productCategories: ["Eye Primer", "Setting Powder", "Concealer"],
    tip: "Oily eyelids transfer oil upward throughout the day into the crease — primer is non-negotiable for oily skin types and absolutely worth the extra 30 seconds.",
  },

  {
    id: "feathering",
    zone: "Lips",
    keywords: ["feather", "bleed", "lip bleed", "bleeding", "lipstick bleed", "lip feather"],
    diagnosis:
      "Lip product is migrating beyond the lip line due to missing lip liner, excess moisture on the lip border, or a very emollient formula.",
    steps: [
      "Apply lip liner first, outlining then filling the entire lip — when liner covers the whole lip, there is no border for the lipstick to migrate across.",
      "Press a thin layer of concealer or foundation around the outer lip edge before liner — this creates a physical barrier and also defines the shape more sharply.",
      "Blot lipstick with a tissue after the first coat, then reapply — the first coat sets, the second coat lasts.",
      "Avoid applying lip balm or moisturiser immediately before lipstick — apply at least 10 minutes before so it absorbs.",
    ],
    productCategories: ["Lip Liner", "Concealer", "Setting Powder"],
    tip: "Lip liner filled over the entire lip is the single most reliable anti-feathering technique. More effective than any lipstick formula claim.",
  },

  {
    id: "smudge",
    zone: "Eyes",
    keywords: ["mascara smudge", "raccoon", "panda", "mascara under", "smudge", "mascara smear"],
    diagnosis:
      "Mascara is transferring under the eyes due to oily skin, lens contact (glasses wearers), formula incompatibility, or insufficient drying time between coats.",
    steps: [
      "Apply translucent powder under the eyes before mascara — this catches any fallout and creates a dry barrier against transfer.",
      "Wait for each coat to dry fully — 20 to 30 seconds — before applying the next coat or blinking repeatedly.",
      "Switch to a waterproof mascara formula if smudging happens daily — particularly important for oily skin types and glasses wearers.",
      "After mascara has dried, lightly set the under-eye area with a pressed powder to absorb oil throughout the day.",
    ],
    productCategories: ["Setting Powder", "Mascara", "Concealer"],
    tip: "The under-eye area accumulates more oil than almost anywhere on the face — a preemptive powder layer before mascara is the most effective preventative step.",
  },

  {
    id: "blush-patchy",
    zone: "Cheeks",
    keywords: ["patchy blush", "blush patchy", "uneven blush", "blush uneven", "blotchy blush"],
    diagnosis:
      "Blush is applying unevenly due to excess product on the brush, a dry or powdery base, or applying over a surface that hasn't fully set.",
    steps: [
      "Tap the brush firmly on the back of your hand before application — almost all patchiness comes from too much product on the brush, not the blush itself.",
      "Apply in light, circular swirling motions building slowly, rather than a single directional sweep.",
      "If your foundation base is very matte and powdery, mist lightly with setting spray before blush — this rehydrates the surface so powder blush applies smoothly.",
      "Cream blush applied with fingertips blends more seamlessly on most skin types than powder blush — press and blend with a circular motion.",
    ],
    productCategories: ["Blush", "Setting Spray"],
    tip: "The secret to natural-looking blush is always 'apply less than you think, build slowly'. A heavy-handed first sweep is far harder to fix than starting light.",
  },

  {
    id: "oxidise",
    zone: "Base",
    keywords: ["oxidize", "oxidise", "darker later", "changes colour", "gets darker", "darker after"],
    diagnosis:
      "Foundation is oxidising — reacting with skin oils and air to become noticeably warmer or darker 30 to 60 minutes after application.",
    steps: [
      "Go one shade lighter in the same foundation — the oxidised result will then land closer to your actual tone.",
      "Apply a silicone-based primer before foundation — it creates a barrier between skin oils and the formula, slowing the oxidation reaction.",
      "Use a colour-correcting primer (lavender for yellow-orange cast, green for redness) to counteract the direction the foundation shifts.",
      "Applying setting spray immediately after foundation and again after powder slows the oxidation process by reducing oxygen contact.",
    ],
    productCategories: ["Primer", "Color Corrector", "Setting Spray", "Foundation"],
    tip: "Oxidation is formula-specific rather than application-specific. If the above steps don't resolve it, switching foundation brand is often the most effective fix.",
  },

];

const DEFAULT_DIAGNOSIS = {
  id: "default",
  zone: "General",
  diagnosis:
    "This is a common makeup challenge. The most frequent root causes are undertone mismatch, incomplete blending, or insufficient skin prep.",
  steps: [
    "Ensure skin is moisturised but not greasy before any makeup application — the prep stage affects every product applied on top.",
    "Verify that undertones in your foundation, blush, and bronzer align with each other and with your natural skin undertone.",
    "Blend every product edge thoroughly — unblended transitions are the most common cause of makeup looking 'off'.",
    "Assess your makeup in natural daylight rather than bathroom lighting, which significantly distorts colour and coverage.",
  ],
  productCategories: [],
  tip: "Describe the specific product or area causing the issue — the more specific you are, the more targeted the diagnosis.",
};

// ── Profile note generator ─────────────────────────────────────────────────
function buildProfileNote(p, profile) {
  const concerns = profile?.skinConcerns || [];
  const glasses  = profile?.wearsGlasses;
  const eyeCol   = profile?.eyeColour;
  const ut       = profile?.undertone;
  const skinType = profile?.skinType;

  if (skinType === "Oily" && (p.includes("crease") || p.includes("smudge") || p.includes("oxidize") || p.includes("oxidise") || p.includes("separated") || p.includes("midday") || p.includes("shiny"))) {
    return "Your oily skin type is a direct contributor here. Mattifying primer, pressed setting powder, and blotting papers in your bag are the three most effective combos for oily skin longevity.";
  }
  if (skinType === "Dry" && (p.includes("cakey") || p.includes("patch") || p.includes("crease") || p.includes("flak"))) {
    return "Dry skin underneath any makeup makes texture issues significantly worse. Ensure your hydrating serum is fully absorbed (minimum 2 minutes) before any base product.";
  }
  if (ut && (p.includes("orange") || p.includes("warm") || p.includes("cool") || p.includes("ashy") || p.includes("grey"))) {
    const rangeMap = {
      Warm: "golden, peach, and warm beige",
      Cool: "pink, rose, and cool-neutral beige",
      Neutral: "neutral-coded (N) beige",
      Olive: "warm-neutral or olive-friendly beige",
    };
    return `With your ${ut} undertone, look for foundation and powder in the ${rangeMap[ut] || "neutral"} range — shade codes matter as much as the depth.`;
  }
  if (concerns.includes("dry_patches") && (p.includes("cakey") || p.includes("patch") || p.includes("flak"))) {
    return "Your dry patches concern is directly relevant — ensure your moisturiser is fully absorbed and apply foundation with a damp sponge over those areas only.";
  }
  if (concerns.includes("large_pores") && (p.includes("cakey") || p.includes("heavy") || p.includes("pore") || p.includes("separated"))) {
    return "With large pores, a silicone pore-filling primer before foundation prevents product from settling into pores and separating throughout the day.";
  }
  if (concerns.includes("acne") && (p.includes("cakey") || p.includes("texture") || p.includes("blemish") || p.includes("patch"))) {
    return "Over active breakouts, build coverage in extremely thin layers — thick product settles into textured areas and emphasises them rather than concealing.";
  }
  if (concerns.includes("redness") && (p.includes("red") || p.includes("pink") || p.includes("flush") || p.includes("corrector"))) {
    return "With your redness concern, a green colour corrector pressed (not rubbed) over red areas before foundation neutralises the flush at the source — invisible under foundation when used sparingly.";
  }
  if (concerns.includes("dark_circles") && (p.includes("concealer") || p.includes("grey") || p.includes("ashy") || p.includes("dark circle"))) {
    return "For dark circles, a peach or salmon corrector applied before concealer neutralises the blue-grey undertone. Without this step, even the best concealer reads ashy.";
  }
  if (glasses && (p.includes("eye") || p.includes("shadow") || p.includes("liner") || p.includes("mascara") || p.includes("brow"))) {
    return "As a glasses wearer, your lenses magnify precision errors — blending matters more than intensity. Use waterproof formulas to prevent smudging under the lens frame.";
  }
  if (eyeCol && (p.includes("eye") || p.includes("shadow") || p.includes("colour") || p.includes("color") || p.includes("payoff"))) {
    const eyeHints = {
      brown:      "For brown eyes, purple, copper, and green shadows create the most contrast and make the iris appear more vibrant.",
      dark_brown: "Dark brown eyes benefit from gold, bronze, and terracotta — these warm tones make the eyes glow rather than disappear.",
      hazel:      "For hazel eyes, purple shadows bring out the green component; warm browns intensify the hazel tones.",
      green:      "For green eyes, avoid matching green shadows which mute the iris. Reddish-brown, copper, and terracotta create flattering contrast.",
      blue:       "Warm tones — bronze, copper, warm brown — contrast beautifully with blue eyes. Avoid cool blue-on-blue pairings.",
      grey:       "Purple and mauve shadows deepen grey eyes. Charcoal liner intensifies them. Pink brightens.",
      amber:      "Deep purple, navy, and forest green complement amber's warmth by contrast. Avoid orange shadows which blend into the iris.",
    };
    if (eyeHints[eyeCol]) return eyeHints[eyeCol];
  }
  return null;
}

// ── Main export ────────────────────────────────────────────────────────────
export function diagnoseMakeup(problem, inventory, profile) {
  const p            = problem.toLowerCase();
  const byCategory   = groupByCategory(inventory);

  const match    = DIAGNOSES.find(d => d.keywords.some(kw => p.includes(kw)));
  const diagnosis = match ?? DEFAULT_DIAGNOSIS;

  const relevantProducts = diagnosis.productCategories
    .flatMap(cat => byCategory[cat] ?? [])
    .slice(0, 4);

  const profileNote = buildProfileNote(p, profile);

  return {
    zone:     diagnosis.zone || "General",
    diagnosis: diagnosis.diagnosis,
    steps:    diagnosis.steps,
    products: relevantProducts,
    tip:      diagnosis.tip,
    profileNote,
  };
}
