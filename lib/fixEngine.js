/**
 * Fix My Makeup Engine
 * Diagnoses makeup problems and returns correction steps
 * with relevant products from the user's inventory.
 */

function groupByCategory(inventory) {
  return inventory.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});
}

const DIAGNOSES = [
  {
    keywords: ["orange", "too warm", "too yellow"],
    diagnosis:
      "Your foundation or bronzer has a warmer undertone than your skin, or bronzer is applied too heavily.",
    steps: [
      "Check your foundation undertone in natural light — hold the product near your jaw outdoors to compare.",
      "If bronzer is the culprit, apply with a much lighter hand, building slowly, and only where the sun would naturally hit.",
      "Dust a cool-toned (pink-tinted) setting powder lightly over the face to neutralise excess warmth.",
      "Apply a slightly cool-toned concealer under your foundation to counterbalance the warmth before it builds.",
    ],
    productCategories: ["Setting Powder", "Concealer", "Color Corrector"],
    tip: "Look for foundations marked 'C' (cool) or 'N' (neutral) in the shade range. Warm-marked shades lean golden-orange.",
  },
  {
    keywords: ["too dark", "foundation dark", "mask", "darker than"],
    diagnosis:
      "The foundation shade is too deep, creating a visible mask effect at the jaw or hairline.",
    steps: [
      "Blend foundation all the way down the neck and onto the décolletage to avoid a harsh cutoff line.",
      "Mix a pea-sized amount of moisturiser into your foundation to sheeren the coverage and lighten it slightly.",
      "Apply a slightly brighter concealer on high points (centre of forehead, bridge of nose, cheekbones) to counterbalance.",
      "Use a translucent setting powder to unify tones across the face.",
    ],
    productCategories: ["Concealer", "Setting Powder", "Primer"],
    tip: "The correct foundation shade disappears at the jaw completely. Test in natural daylight — never fluorescent store lighting.",
  },
  {
    keywords: ["flat", "dull", "lifeless", "boring", "no dimension", "one-dimensional"],
    diagnosis:
      "The look lacks dimension — likely missing highlight contrast, blush placement is too low, or both are too subtle.",
    steps: [
      "Reapply blush higher on the cheekbones, sweeping toward the temples — this lifts the entire face visually.",
      "Add highlighter to the very top of the cheekbones (not the whole cheek), inner corners of eyes, bridge of the nose, and Cupid's bow.",
      "Deepen the outer corners of the eyes slightly for depth — even a mid-toned shadow makes a significant difference.",
      "A small amount of bronzer swept just under the cheekbone creates shadow that makes the highlighting areas pop more.",
    ],
    productCategories: ["Blush", "Highlighter", "Bronzer", "Eyeshadow"],
    tip: "Dimension is contrast: areas catching light advance visually, shadowed areas recede. You need both to create structure.",
  },
  {
    keywords: ["crease", "eyeshadow crease", "fold", "eye crease"],
    diagnosis:
      "Eyeshadow is creasing due to oily lids, absence of a primer base, or excessive product layering.",
    steps: [
      "Set your eyelids with translucent powder before applying any eyeshadow — this absorbs oil and creates grip.",
      "Use an eye primer or a thin layer of concealer as a base on the lids before shadow application.",
      "Pat eyeshadow onto the lid rather than sweeping — pressing locks pigment in place more effectively.",
      "Avoid applying eyeshadow directly over moisturiser or skincare — let skincare fully absorb first.",
    ],
    productCategories: ["Eye Primer", "Setting Powder", "Concealer"],
    tip: "Oily skin transfers oil from the brow bone down into the crease area throughout the day — primer is non-negotiable for this skin type.",
  },
  {
    keywords: ["cakey", "heavy", "thick", "chunky", "over applied", "cake"],
    diagnosis:
      "Too much product has been applied in a single heavy layer, or products were applied over inadequately moisturised skin.",
    steps: [
      "Dampen a clean beauty sponge, squeeze out the water, then press (never drag) it over the makeup — this removes excess and melds layers together.",
      "Mist setting spray over the face and gently press with a tissue to lift excess product without disturbing the look.",
      "Going forward: apply base in thin layers building up, rather than one heavy initial coat.",
      "Ensure skin is properly moisturised before application — dry patches underneath cause product to cling unevenly.",
    ],
    productCategories: ["Setting Spray", "Setting Powder"],
    tip: "Damp application tools (sponges, damp brushes) always produce a less cakey result than dry brushes for foundation and concealer.",
  },
  {
    keywords: ["feather", "bleed", "lip bleed", "bleeding", "lipstick bleed"],
    diagnosis:
      "Lip product is migrating beyond the lip line, usually due to absence of lip liner or moisturiser on the lip border.",
    steps: [
      "Apply lip liner first — line slightly inside or exactly on the natural border, then fill the entire lip with liner as a base.",
      "Press a small amount of concealer or foundation around the outer edge of the lips to create a barrier before applying colour.",
      "Blot lipstick with a tissue after the first application, then reapply — this removes oils that cause migration.",
      "Avoid applying moisturiser directly to the lips before lipstick; apply it 10 minutes earlier so it fully absorbs.",
    ],
    productCategories: ["Lip Liner", "Concealer", "Setting Powder"],
    tip: "Lip liner is the most effective anti-feathering product available — more reliable than any lipstick formula.",
  },
  {
    keywords: ["patchy blush", "blush patchy", "uneven blush", "blush uneven"],
    diagnosis:
      "Blush is applying unevenly, usually due to a dry or powdery base, or the brush holding too much product.",
    steps: [
      "Tap your blush brush on the back of your hand to remove excess before applying to the face.",
      "Apply blush in light circular motions rather than a single sweep — this builds colour more evenly.",
      "If your base is very matte and powdery, lightly mist the face with setting spray before blush application.",
      "Cream blushes blend more evenly over foundation — consider pressing with fingertips for seamless placement.",
    ],
    productCategories: ["Blush", "Setting Spray"],
    tip: "The secret to natural-looking blush is applying less than you think you need, then building slowly.",
  },
  {
    keywords: ["mascara smudge", "raccoon", "panda", "mascara under", "smudge"],
    diagnosis:
      "Mascara is transferring under the eyes, caused by oily skin, an incompatible formula, or not letting it dry fully.",
    steps: [
      "Let each coat of mascara dry completely before blinking or looking down.",
      "Apply translucent powder under the eyes before mascara application — it catches any fallout.",
      "Use a waterproof mascara formula if smudging is a recurring issue with your skin type.",
      "After mascara dries, set the under-eye area with a light dusting of powder to absorb oil.",
    ],
    productCategories: ["Setting Powder", "Mascara", "Concealer"],
    tip: "The under-eye area collects more oil than most of the face — a light powder there before and after mascara makes a dramatic difference.",
  },
  {
    keywords: ["oxidize", "oxidise", "darker later", "changes colour", "gets darker"],
    diagnosis:
      "Your foundation is oxidising — reacting with skin oils and oxygen to become noticeably warmer or darker after 30–60 minutes.",
    steps: [
      "Try going one shade lighter in the same foundation — the oxidised result will land closer to your natural tone.",
      "Apply a colour-correcting primer (green for redness, lavender for sallowness) before foundation to alter how it reads.",
      "Use a silicone-based primer under foundation — it creates a barrier that reduces oil contact with the formula.",
      "Setting spray immediately after application can slow the oxidation process.",
    ],
    productCategories: ["Primer", "Color Corrector", "Setting Spray", "Foundation"],
    tip: "Oxidation is formula-specific — switching foundation brand often resolves the issue entirely if the above steps don't help.",
  },
];

const DEFAULT_DIAGNOSIS = {
  diagnosis:
    "This is a common makeup challenge. The most frequent root causes are undertone mismatch, incomplete blending, or skin prep issues.",
  steps: [
    "Ensure skin is moisturised but not greasy before any makeup application.",
    "Verify that the undertones in your foundation, blush, and bronzer all align with each other.",
    "Blend every product edge thoroughly — unblended transitions are the most common cause of makeup looking 'off'.",
    "Assess your makeup in natural daylight rather than bathroom lighting, which distorts colour significantly.",
  ],
  productCategories: [],
  tip: "Describe the specific product or area causing the issue for a more precise diagnosis.",
};

export function diagnoseMakeup(problem, inventory, profile) {
  const p = problem.toLowerCase();
  const byCategory = groupByCategory(inventory);

  const match = DIAGNOSES.find((d) => d.keywords.some((kw) => p.includes(kw)));
  const diagnosis = match ?? DEFAULT_DIAGNOSIS;

  const relevantProducts = diagnosis.productCategories
    .flatMap((cat) => byCategory[cat] ?? [])
    .slice(0, 4);

  let profileNote = null;
  if (profile?.skinType === "Oily" && (p.includes("crease") || p.includes("smudge") || p.includes("oxidize") || p.includes("oxidise"))) {
    profileNote = `Your oily skin type means this issue will be more pronounced. Primer and setting products are especially important for your routine.`;
  } else if (profile?.undertone && (p.includes("orange") || p.includes("warm") || p.includes("cool") || p.includes("pink"))) {
    profileNote = `With your ${profile.undertone} undertone, look for products in the ${
      profile.undertone === "Warm" ? "golden, peach, and warm beige" : profile.undertone === "Cool" ? "pink, rose, and cool beige" : "neutral beige"
    } range.`;
  }

  return {
    diagnosis: diagnosis.diagnosis,
    steps: diagnosis.steps,
    products: relevantProducts,
    tip: diagnosis.tip,
    profileNote,
  };
}
