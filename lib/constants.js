// ── Product categories ──────────────────────────────────────────────────────
export const CATEGORIES = [
  // Base & Skin
  "Foundation",
  "BB Cream",
  "CC Cream",
  "Skin Tint",
  "Tinted Moisturiser",
  "Concealer",
  "Color Corrector",
  "Primer",
  "Pore Primer",
  "SPF / Sunscreen",
  // Set & Finish
  "Setting Powder",
  "Setting Spray",
  "Setting Mousse",
  "Face Mist",
  // Sculpt & Colour
  "Contour",
  "Bronzer",
  "Cream Bronzer",
  "Blush",
  "Blush Stick",
  "Cream Blush",
  "Highlighter",
  "Body Highlighter",
  "Colour Grading Powder",
  // Eyes
  "Eyeshadow",
  "Loose Pigment",
  "Glitter",
  "Eyeliner",
  "Eye Primer",
  "Mascara",
  "Lash Serum",
  "Lash Glue",
  // Brows
  "Eyebrow",
  "Brow Lamination Gel",
  "Brow Soap",
  // Lips
  "Lipstick",
  "Lip Gloss",
  "Lip Oil",
  "Lip Plumper",
  "Lip Stain",
  "Lip Topper",
  "Lip Liner",
  // Skincare Prep
  "Skincare Prep",
];

// Category groups for organised display in the form
export const CATEGORY_GROUPS = [
  { label: "Base & Skin",     cats: ["Foundation","BB Cream","CC Cream","Skin Tint","Tinted Moisturiser","Concealer","Color Corrector","Primer","Pore Primer","SPF / Sunscreen"] },
  { label: "Set & Finish",    cats: ["Setting Powder","Setting Spray","Setting Mousse","Face Mist"] },
  { label: "Sculpt & Colour", cats: ["Contour","Bronzer","Cream Bronzer","Blush","Blush Stick","Cream Blush","Highlighter","Body Highlighter","Colour Grading Powder"] },
  { label: "Eyes",            cats: ["Eyeshadow","Loose Pigment","Glitter","Eyeliner","Eye Primer","Mascara","Lash Serum","Lash Glue"] },
  { label: "Brows",           cats: ["Eyebrow","Brow Lamination Gel","Brow Soap"] },
  { label: "Lips",            cats: ["Lipstick","Lip Gloss","Lip Oil","Lip Plumper","Lip Stain","Lip Topper","Lip Liner"] },
  { label: "Skincare Prep",   cats: ["Skincare Prep"] },
];

// ── Product attributes ──────────────────────────────────────────────────────
export const FINISHES = [
  { id: "matte",    label: "Matte",    swatch: "#c4a882" },
  { id: "satin",    label: "Satin",    swatch: "#d4bfa5" },
  { id: "dewy",     label: "Dewy",     swatch: "#e8d5c0" },
  { id: "shimmer",  label: "Shimmer",  swatch: "#e8c880" },
  { id: "glitter",  label: "Glitter",  swatch: "#f0d060" },
  { id: "metallic", label: "Metallic", swatch: "#c0a840" },
  { id: "natural",  label: "Natural",  swatch: "#c8b090" },
];

export const FORMULAS = [
  "Powder", "Liquid", "Cream", "Stick",
  "Gel", "Mousse", "Balm", "Oil", "Pencil", "Foam",
];

export const COVERAGES = [
  { id: "sheer",  label: "Sheer",  desc: "Barely there" },
  { id: "light",  label: "Light",  desc: "Skin shows through" },
  { id: "medium", label: "Medium", desc: "Buildable" },
  { id: "full",   label: "Full",   desc: "High coverage" },
];

// Months until expiry — for PAO (Period After Opening)
export const EXPIRY_PERIODS = [
  { months: 3,  label: "3 months",  color: "#ef4444" },
  { months: 6,  label: "6 months",  color: "#f97316" },
  { months: 12, label: "12 months", color: "#eab308" },
  { months: 18, label: "18 months", color: "#22c55e" },
  { months: 24, label: "24 months", color: "#16a34a" },
  { months: 36, label: "36 months", color: "#14532d" },
];

// ── Brand autocomplete list ──────────────────────────────────────────────────
export const BRANDS = [
  // Luxury
  "Charlotte Tilbury","Chanel","Dior","YSL (Yves Saint Laurent)","Armani Beauty",
  "Tom Ford Beauty","Givenchy","Guerlain","Lancôme","Sisley","La Mer","NARS",
  "Pat McGrath Labs","Hourglass","Clé de Peau","Valentino Beauty","Burberry Beauty",
  // Mid-range
  "MAC Cosmetics","Urban Decay","Too Faced","Tarte","Benefit","Smashbox",
  "Bobbi Brown","Laura Mercier","IT Cosmetics","Bare Minerals","BECCA",
  "Clinique","Origins","Estée Lauder","Shiseido","NARS","Laura Geller",
  // Drugstore
  "Maybelline","L'Oréal Paris","Revlon","CoverGirl","Rimmel London",
  "NYX Professional","e.l.f. Cosmetics","Wet n Wild","Catrice","essence",
  "Milani","Flower Beauty","Hard Candy","LA Girl","ULTA Beauty",
  // K-beauty & J-beauty
  "Innisfree","ETUDE HOUSE","3CE","Laneige","CLIO","Missha","ROMAND",
  "Peripera","Fenty Beauty","Rare Beauty","Milk Makeup","Glossier",
  // Newer / cult
  "Rare Beauty","Fenty Beauty","Milk Makeup","Glossier","Tower 28",
  "Ilia","Kosas","Saie","RMS Beauty","Haus Labs","Jones Road",
  "Westman Atelier","Merit","Ami Colé","Danessa Myricks","Kulfi Beauty",
  // Tools / Lashes
  "Ardell","Kiss","Velour Lashes","Lilly Lashes","Eylure",
].sort();

// ── Skin profile constants ───────────────────────────────────────────────────
export const SKIN_TONES = [
  { id: "fair",         label: "Fair",      hex: "#f5e6d3" },
  { id: "light",        label: "Light",     hex: "#ecd5b5" },
  { id: "light-medium", label: "Lt. Med.",  hex: "#d4a97a" },
  { id: "medium",       label: "Medium",    hex: "#c08040" },
  { id: "medium-deep",  label: "Med. Deep", hex: "#a0622a" },
  { id: "deep",         label: "Deep",      hex: "#6b3a1f" },
  { id: "rich",         label: "Rich",      hex: "#3d1f0d" },
];

export const UNDERTONES = [
  { id: "Warm",    desc: "Golden/peachy veins" },
  { id: "Cool",    desc: "Blue/pink veins" },
  { id: "Neutral", desc: "Mix of both" },
  { id: "Olive",   desc: "Greenish veins" },
];

export const SKIN_TYPES  = ["Normal","Oily","Dry","Combination","Sensitive"];

export const FACE_SHAPES = [
  { id: "oval",    label: "Oval",    desc: "Balanced, slightly wider forehead" },
  { id: "round",   label: "Round",   desc: "Equal width & length, soft angles" },
  { id: "square",  label: "Square",  desc: "Strong jaw, wide forehead" },
  { id: "heart",   label: "Heart",   desc: "Wide forehead, narrow chin" },
  { id: "oblong",  label: "Oblong",  desc: "Longer than wide, sharp chin" },
  { id: "diamond", label: "Diamond", desc: "Narrow forehead & chin, wide cheeks" },
];

// ── Look generation constants ────────────────────────────────────────────────
export const OCCASIONS = [
  "Everyday",
  "Work / Professional",
  "Date Night",
  "Party / Event",
  "Special Occasion",
  "School / College",
  "Natural / No-Makeup",
  "Editorial / Artistic",
];

export const INTENSITIES = [
  { id: "sheer",    label: "Sheer & Minimal", dots: 1 },
  { id: "natural",  label: "Natural Glow",    dots: 2 },
  { id: "polished", label: "Polished",         dots: 3 },
  { id: "bold",     label: "Bold & Defined",  dots: 4 },
  { id: "glam",     label: "Full Glam",        dots: 5 },
];

export const TIME_OPTIONS = ["5 min","10 min","15 min","30 min","45+ min"];

// ── Essential categories for gap analysis ────────────────────────────────────
export const ESSENTIAL_CATEGORIES = [
  "Foundation","Concealer","Mascara","Eyebrow",
  "Blush","Lipstick","Setting Powder","Primer",
];

// ── Fix My Makeup common problems ────────────────────────────────────────────
export const COMMON_PROBLEMS_BY_ZONE = [
  { zone: "Base",      problems: ["Looks too orange","Foundation too dark","Foundation separated by midday","Setting powder made me look ashy","Makeup looks flat / dull","Makeup looks cakey","Colour corrector is showing through","Foundation oxidizing / gets darker","Skin looks shiny by noon"] },
  { zone: "Concealer", problems: ["Concealer looks grey / ashy","Concealer is creasing"] },
  { zone: "Eyes",      problems: ["Eyeshadow has no payoff","Eyeshadow creasing","Mascara made my lashes clump","Mascara smudging under eyes","Brows look drawn on"] },
  { zone: "Cheeks",    problems: ["Contour looks muddy","Bronzer made me look dirty","Highlight looks chalky not glowy","Blush looks patchy"] },
  { zone: "Lips",      problems: ["Lip liner looks harsh","Lipstick feathering / bleeding"] },
];

export const COMMON_PROBLEMS = COMMON_PROBLEMS_BY_ZONE.flatMap(z => z.problems);

// ── Extended profile constants ───────────────────────────────────────────────

export const SKIN_CONCERNS = [
  { id: "acne",             label: "Acne / Breakouts",       icon: "🔴", desc: "Active blemishes or frequent breakouts" },
  { id: "dark_circles",     label: "Dark Circles",           icon: "🌑", desc: "Under-eye shadowing or discolouration" },
  { id: "hyperpigmentation",label: "Hyperpigmentation",      icon: "🟤", desc: "Dark spots, sun spots, post-acne marks" },
  { id: "redness",          label: "Redness / Rosacea",      icon: "🩸", desc: "Persistent facial flushing or rosacea" },
  { id: "large_pores",      label: "Large Pores",            icon: "⚫", desc: "Visible pores especially on nose/cheeks" },
  { id: "fine_lines",       label: "Fine Lines / Ageing",    icon: "〰", desc: "Wrinkles, loss of firmness" },
  { id: "eczema",           label: "Eczema / Sensitivity",   icon: "🌸", desc: "Reactive, easily irritated skin" },
  { id: "dry_patches",      label: "Dry Patches",            icon: "❄️", desc: "Flaky or rough areas that affect makeup" },
  { id: "oiliness",         label: "Excess Oiliness",        icon: "💧", desc: "Skin gets shiny or greasy within hours" },
  { id: "dullness",         label: "Dullness / Uneven Tone", icon: "☁️", desc: "Lack of radiance or glow" },
];

export const EYE_COLOURS = [
  { id: "brown",      label: "Brown",      hex: "#6b3a2a" },
  { id: "dark_brown", label: "Dark Brown", hex: "#2e1a0e" },
  { id: "hazel",      label: "Hazel",      hex: "#8b6914" },
  { id: "green",      label: "Green",      hex: "#4a7c59" },
  { id: "blue",       label: "Blue",       hex: "#4a7ab5" },
  { id: "grey",       label: "Grey",       hex: "#8898a8" },
  { id: "amber",      label: "Amber",      hex: "#c07830" },
];

export const HAIR_COLOURS = [
  { id: "black",       label: "Black",        hex: "#1a1008" },
  { id: "dark_brown",  label: "Dark Brown",   hex: "#3d2010" },
  { id: "medium_brown",label: "Medium Brown", hex: "#6b3a18" },
  { id: "light_brown", label: "Light Brown",  hex: "#9b6030" },
  { id: "dirty_blonde",label: "Dirty Blonde", hex: "#c49048" },
  { id: "blonde",      label: "Blonde",       hex: "#e8c870" },
  { id: "platinum",    label: "Platinum",     hex: "#f0e8d0" },
  { id: "red",         label: "Red",          hex: "#a83020" },
  { id: "auburn",      label: "Auburn",       hex: "#803020" },
  { id: "grey",        label: "Grey / Silver",hex: "#b0a898" },
  { id: "coloured",    label: "Coloured",     hex: "#b87aaa" },
];
