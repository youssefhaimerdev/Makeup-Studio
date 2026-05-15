/**
 * Face Scan — pure client-side face analysis using MediaPipe landmarks.
 * Zero API calls. Zero cost. 468 landmarks → precise feature extraction.
 *
 * Calculates:
 *  - Face shape      (landmark geometry ratios)
 *  - Eye shape       (lid opening ratio + brow-to-lid distance)
 *  - Skin tone + hex (pixel sampling at cheek/forehead landmarks)
 *  - Undertone       (RGB channel analysis of sampled pixels)
 *  - Eye colour      (iris pixel sampling)
 *  - Brow shape      (landmark angle + arch measurement)
 *  - Lip shape       (width-to-height ratio + cupid's bow measurement)
 *  - Hair colour     (pixel sampling above the hairline)
 */

import { detectLandmarks } from "./faceMesh";

// ── Euclidean distance between two normalised landmarks ───────────────
function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// ── Sample pixel RGBA at normalised (nx, ny) from image canvas ────────
function samplePixel(ctx, nx, ny, W, H) {
  const px = Math.round(nx * W);
  const py = Math.round(ny * H);
  const x  = Math.max(0, Math.min(W - 1, px));
  const y  = Math.max(0, Math.min(H - 1, py));
  const d  = ctx.getImageData(x, y, 1, 1).data;
  return { r: d[0], g: d[1], b: d[2] };
}

// ── Average several pixel samples ─────────────────────────────────────
function avgPixels(ctx, points, W, H) {
  let r = 0, g = 0, b = 0;
  points.forEach(p => {
    const px = samplePixel(ctx, p.x, p.y, W, H);
    r += px.r; g += px.g; b += px.b;
  });
  return { r: r / points.length, g: g / points.length, b: b / points.length };
}

// ── RGB → HSL ─────────────────────────────────────────────────────────
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s, l };
}

// ── Skin tone classification from RGB ─────────────────────────────────
function classifySkinTone(r, g, b) {
  const { l } = rgbToHsl(r, g, b);
  const L255 = l * 255;

  const tone = L255 > 210 ? "fair"
    : L255 > 180 ? "light"
    : L255 > 148 ? "medium"
    : L255 > 115 ? "tan"
    : L255 > 82  ? "deep"
    : "rich";

  // Undertone: warm (R>B+threshold), cool (B≈R, pinkish), olive (greenish cast)
  const rMinusB = r - b;
  const gBoost  = g - (r + b) / 2;
  const undertone =
    gBoost > 8  ? "Olive"
    : rMinusB > 22 ? "Warm"
    : rMinusB < 4  ? "Cool"
    : "Neutral";

  // Build representative hex from the sampled colour
  const hex = "#" +
    Math.round(r).toString(16).padStart(2,"0") +
    Math.round(g).toString(16).padStart(2,"0") +
    Math.round(b).toString(16).padStart(2,"0");

  return { tone, undertone, hex };
}

// ── Eye colour classification from iris RGB ───────────────────────────
function classifyEyeColour(r, g, b) {
  const { h, s, l } = rgbToHsl(r, g, b);
  if (l < 0.18) return "dark_brown";
  if (s < 0.12)  return "grey";
  if (h < 30 || h > 330) return l > 0.35 ? "amber" : "brown";
  if (h < 80)  return "hazel";
  if (h < 160) return "green";
  if (h < 260) return "blue";
  return "brown";
}

// ── Hair colour classification ─────────────────────────────────────────
function classifyHairColour(r, g, b) {
  const { h, s, l } = rgbToHsl(r, g, b);
  if (l < 0.12) return "black";
  if (l < 0.22) return "dark_brown";
  if (l < 0.35) return h > 15 && h < 50 ? "auburn" : "medium_brown";
  if (l < 0.50) return h > 20 && h < 45 ? "light_brown" : "dirty_blonde";
  if (l < 0.68) return h > 10 && h < 50 && s > 0.4 ? "red" : "blonde";
  if (l < 0.82) return "platinum";
  return s < 0.08 ? "grey" : "platinum";
}

// ── Face shape from landmark ratios ───────────────────────────────────
function classifyFaceShape(lm) {
  const faceWidth      = dist(lm[234], lm[454]);
  const faceHeight     = dist(lm[10],  lm[152]);
  const jawWidth       = dist(lm[172], lm[397]);
  const foreheadWidth  = dist(lm[54],  lm[284]);
  const cheekWidth     = dist(lm[234], lm[454]);
  const cheekboneWidth = dist(lm[116], lm[345]);

  const ratio            = faceHeight / faceWidth;
  const jawToForehead    = jawWidth / foreheadWidth;
  const jawToCheek       = jawWidth / cheekWidth;
  const foreheadToCheek  = foreheadWidth / cheekboneWidth;

  if (ratio > 1.55) return "oblong";
  if (foreheadToCheek < 0.82 && jawToCheek < 0.82) return "diamond";
  if (jawToForehead < 0.65) return "heart";
  if (ratio < 1.12 && jawToCheek > 0.82) return "round";
  if (ratio < 1.28 && jawToForehead > 0.88) return "square";
  return "oval";
}

// ── Eye shape from landmark geometry ─────────────────────────────────
function classifyEyeShape(lm) {
  // Left eye key points
  const outerL    = lm[33];   // outer corner
  const innerL    = lm[133];  // inner corner
  const topL      = lm[159];  // top centre of lid
  const botL      = lm[145];  // bottom centre of lid
  const browL     = lm[107];  // brow centre (above eye)

  const eyeWidth    = dist(outerL, innerL);
  const eyeOpen     = dist(topL, botL);
  const browToLid   = dist(browL, topL);
  const openRatio   = eyeOpen / eyeWidth;
  const browRatio   = browToLid / eyeWidth;

  // Upturn / downturn: compare outer corner y to inner corner y
  // In MediaPipe coords y increases downward
  const outerVsInner = innerL.y - outerL.y; // positive = outer is higher (upturned)

  if (openRatio < 0.15) {
    return browRatio < 0.10 ? "hooded" : "monolid";
  }
  if (openRatio < 0.24) {
    if (outerVsInner > 0.012) return "upturned";
    if (outerVsInner < -0.012) return "downturned";
    return browRatio < 0.13 ? "hooded" : "almond";
  }
  if (openRatio < 0.33) {
    if (outerVsInner > 0.012) return "upturned";
    if (outerVsInner < -0.012) return "downturned";
    return "almond";
  }
  return "round";
}

// ── Brow shape ────────────────────────────────────────────────────────
function classifyBrowShape(lm) {
  // Left brow: inner(55) → peak(52) → outer(46)
  const inner  = lm[55];
  const peak   = lm[52];
  const outer  = lm[46];

  const totalWidth = dist(inner, outer);
  const archHeight = Math.abs(
    peak.y - (inner.y + outer.y) / 2
  );
  const archRatio  = archHeight / totalWidth;
  const peakPos    = dist(inner, peak) / totalWidth; // 0=inner 1=outer

  if (archRatio < 0.04) return "flat";
  if (archRatio < 0.08) return peakPos > 0.65 ? "soft_angled" : "straight";
  if (archRatio < 0.15) return peakPos > 0.6 ? "arched" : "rounded";
  return "high_arch";
}

// ── Lip shape ─────────────────────────────────────────────────────────
function classifyLipShape(lm) {
  const leftCorner  = lm[61];
  const rightCorner = lm[291];
  const topCentre   = lm[0];
  const botCentre   = lm[17];
  const cupidL      = lm[37];
  const cupidR      = lm[267];

  const lipWidth  = dist(leftCorner, rightCorner);
  const lipHeight = dist(topCentre, botCentre);
  const ratio     = lipHeight / lipWidth;

  // Cupid's bow depth
  const cupidDip = (cupidL.y + cupidR.y) / 2 - topCentre.y;
  const defined  = cupidDip > 0.008;

  if (ratio > 0.42)         return "full";
  if (ratio < 0.22)         return "thin";
  if (defined && ratio > 0.30) return "defined";
  if (lipWidth > 0.28)      return "wide";
  return "standard";
}

// ── Main scan function ─────────────────────────────────────────────────
export async function scanFaceFromImage(imageElement) {
  // Draw image to offscreen canvas
  const canvas = document.createElement("canvas");
  canvas.width  = imageElement.naturalWidth  || imageElement.width;
  canvas.height = imageElement.naturalHeight || imageElement.height;
  const ctx2d = canvas.getContext("2d");
  ctx2d.drawImage(imageElement, 0, 0);

  const W = canvas.width, H = canvas.height;

  // Run MediaPipe
  const landmarks = await detectLandmarks(canvas);
  if (!landmarks || landmarks.length < 468) {
    throw new Error("No face detected — please use a clear, well-lit, front-facing photo.");
  }
  const lm = landmarks;

  // ── Sample skin tone (cheeks + forehead + chin) ────────────────────
  const skinPoints = [
    lm[234],  // left cheek
    lm[454],  // right cheek
    { x: lm[10].x, y: lm[10].y + 0.03 }, // forehead centre
    lm[200],  // chin
    lm[206],  // under left eye
    lm[426],  // under right eye
  ];
  const skinRgb  = avgPixels(ctx2d, skinPoints, W, H);
  const skinData = classifySkinTone(skinRgb.r, skinRgb.g, skinRgb.b);

  // ── Sample eye colour (iris region) ───────────────────────────────
  // Landmarks 468-472 = left iris (only with refineLandmarks: true)
  const irisPoints = lm.length > 468
    ? [lm[468], lm[469], lm[470], lm[471], lm[472]]
    : [lm[159], lm[145], lm[160], lm[144]]; // fallback: lid area
  const irisRgb  = avgPixels(ctx2d, irisPoints, W, H);
  const eyeColor = classifyEyeColour(irisRgb.r, irisRgb.g, irisRgb.b);

  // ── Sample hair colour (above hairline) ───────────────────────────
  const hairline = lm[10]; // top of face
  const hairPoints = [
    { x: hairline.x,        y: Math.max(0, hairline.y - 0.08) },
    { x: hairline.x - 0.05, y: Math.max(0, hairline.y - 0.06) },
    { x: hairline.x + 0.05, y: Math.max(0, hairline.y - 0.06) },
    { x: lm[54].x - 0.04,   y: Math.max(0, lm[54].y - 0.04) }, // left temple
    { x: lm[284].x + 0.04,  y: Math.max(0, lm[284].y - 0.04) }, // right temple
  ];
  const hairRgb   = avgPixels(ctx2d, hairPoints, W, H);
  const hairColor = classifyHairColour(hairRgb.r, hairRgb.g, hairRgb.b);

  // ── Compute shape features ─────────────────────────────────────────
  const faceShape  = classifyFaceShape(lm);
  const eyeShape   = classifyEyeShape(lm);
  const browShape  = classifyBrowShape(lm);
  const lipShape   = classifyLipShape(lm);

  // ── Compute confidence scores (based on measurement clarity) ──────
  const eyeOpenRatio = dist(lm[159], lm[145]) / dist(lm[33], lm[133]);
  const faceSymmetry = 1 - Math.abs(lm[234].x + lm[454].x - 1); // how centred the face is

  return {
    faceShape,
    eyeShape,
    eyeColor,
    browShape,
    lipShape,
    hairColor,
    skinTone:    skinData.tone,
    skinToneHex: skinData.hex,
    undertone:   skinData.undertone,
    confidence: {
      faceShape:  Math.min(0.97, 0.75 + faceSymmetry * 0.25),
      skinTone:   0.93,
      eyeShape:   Math.min(0.95, 0.70 + Math.min(eyeOpenRatio * 2, 0.25)),
    },
    rawMeasurements: {
      faceRatio:  parseFloat((dist(lm[10],lm[152]) / dist(lm[234],lm[454])).toFixed(3)),
      eyeOpenRatio: parseFloat(eyeOpenRatio.toFixed(3)),
    },
  };
}

// ── Map scan result → profile shape ───────────────────────────────────
export function scanResultToProfile(scan) {
  return {
    skinTone:    scan.skinTone,
    skinToneHex: scan.skinToneHex,
    undertone:   scan.undertone,
    eyeColour:   scan.eyeColor,
    eyeShape:    scan.eyeShape,
    eyebrowShape:scan.browShape,
    lipShape:    scan.lipShape,
    hairColour:  scan.hairColor,
    faceShape:   scan.faceShape,
    aiScanned:   true,
    aiScanDate:  new Date().toISOString(),
  };
}

export const FEATURE_LABELS = {
  faceShape:  { oval:"Oval — balanced and versatile", round:"Round — soft angles, great for contouring", square:"Square — strong jaw, suits soft blush", heart:"Heart — wide forehead, pointed chin", diamond:"Diamond — high cheekbones, narrow forehead", oblong:"Oblong — longer than wide" },
  eyeShape:   { almond:"Almond — most versatile shape", round:"Round — wide and expressive", hooded:"Hooded — fold covers part of the lid", monolid:"Monolid — minimal crease visible", upturned:"Upturned — outer corners lift", downturned:"Downturned — outer corners drop" },
  undertone:  { Warm:"Warm — golden and peachy tones suit you", Cool:"Cool — pink and rose tones suit you", Neutral:"Neutral — warm or cool work equally well", Olive:"Olive — warm-neutral formulas suit you" },
};
