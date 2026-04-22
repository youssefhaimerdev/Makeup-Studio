/**
 * Makeup Analysis Engine
 *
 * Uses MediaPipe FaceMesh 468-point landmarks to extract pixel regions
 * for each makeup zone, then computes colour statistics (hue, saturation,
 * brightness, variance, symmetry) to produce real scores and feedback.
 *
 * No backend required. All processing happens in the browser via Canvas API.
 */

// ─── MediaPipe FaceMesh landmark index groups ─────────────────────────────
// Reference: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png

export const LANDMARK_REGIONS = {
  // Left/right cheek patches (blush zone)
  LEFT_CHEEK:  [116, 123, 147, 187, 207, 206, 203, 36, 101, 119, 118, 117],
  RIGHT_CHEEK: [340, 352, 376, 411, 427, 426, 423, 266, 330, 348, 347, 346],

  // Lip outer boundary
  LIPS_OUTER: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146],
  // Lip inner
  LIPS_INNER: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95],

  // Left eye region (for shadow/liner analysis)
  LEFT_EYE_REGION:  [226, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25],
  RIGHT_EYE_REGION: [446, 467, 260, 259, 257, 258, 286, 414, 463, 341, 256, 252, 253, 254, 339, 255],

  // Eyebrow regions
  LEFT_BROW:  [46, 53, 52, 65, 55, 70, 63, 105, 66, 107, 336, 296, 334, 293, 300],
  RIGHT_BROW: [276, 283, 282, 295, 285, 300, 293, 334, 296, 336, 107, 66, 105, 63, 70],

  // Nose bridge / forehead centre (skin reference)
  NOSE_BRIDGE: [6, 197, 195, 5, 4, 1, 19, 94, 2],

  // Forehead patch (skin evenness)
  FOREHEAD: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],

  // Full face silhouette (for overall skin sampling)
  FACE_OVAL: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
};

// ─── Canvas pixel utilities ───────────────────────────────────────────────

/**
 * Given an ImageData buffer and a list of polygon points [{x,y}],
 * returns all pixel RGBA values strictly inside the polygon.
 */
function samplePolygon(imageData, points, width) {
  if (!points || points.length < 3) return [];

  const minX = Math.max(0, Math.floor(Math.min(...points.map((p) => p.x))));
  const maxX = Math.min(width - 1, Math.ceil(Math.max(...points.map((p) => p.x))));
  const minY = Math.max(0, Math.floor(Math.min(...points.map((p) => p.y))));
  const maxY = Math.min(
    imageData.data.length / (width * 4) - 1,
    Math.ceil(Math.max(...points.map((p) => p.y)))
  );

  const pixels = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (pointInPolygon(x, y, points)) {
        const idx = (y * width + x) * 4;
        pixels.push({
          r: imageData.data[idx],
          g: imageData.data[idx + 1],
          b: imageData.data[idx + 2],
        });
      }
    }
  }
  return pixels;
}

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Convert RGB to HSV (H: 0-360, S: 0-1, V: 0-1) */
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0, s = max === 0 ? 0 : d / max, v = max;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s, v };
}

/** Mean and variance of an array of numbers */
function stats(arr) {
  if (!arr.length) return { mean: 0, variance: 0, std: 0 };
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
  return { mean, variance, std: Math.sqrt(variance) };
}

/** Compute mean HSV from pixel array */
function meanHsv(pixels) {
  if (!pixels.length) return { h: 0, s: 0, v: 0.5 };
  const hsvs = pixels.map(({ r, g, b }) => rgbToHsv(r, g, b));
  return {
    h: stats(hsvs.map((c) => c.h)).mean,
    s: stats(hsvs.map((c) => c.s)).mean,
    v: stats(hsvs.map((c) => c.v)).mean,
    vStd: stats(hsvs.map((c) => c.v)).std,
    sStd: stats(hsvs.map((c) => c.s)).std,
  };
}

/** Symmetry score: compare left vs right region HSV similarity (0-1, 1=perfect) */
function symmetryScore(leftHsv, rightHsv) {
  if (!leftHsv || !rightHsv) return 0.7;
  const hueDiff = Math.abs(leftHsv.h - rightHsv.h) / 180; // normalised 0-1
  const satDiff = Math.abs(leftHsv.s - rightHsv.s);
  const valDiff = Math.abs(leftHsv.v - rightHsv.v);
  const rawScore = 1 - (hueDiff * 0.4 + satDiff * 0.3 + valDiff * 0.3);
  return Math.max(0, Math.min(1, rawScore));
}

// ─── Landmark → pixel coordinate conversion ──────────────────────────────

function landmarkToPixel(lm, width, height) {
  return { x: lm.x * width, y: lm.y * height };
}

function regionPoints(landmarks, indices, width, height) {
  return indices.map((i) => landmarkToPixel(landmarks[i], width, height));
}

// ─── Main analysis function ───────────────────────────────────────────────

/**
 * @param {HTMLCanvasElement} canvas  — canvas with the user photo drawn on it
 * @param {Array}             landmarks — 468 normalised MediaPipe FaceMesh landmarks [{x,y,z}]
 * @param {Object}            profile  — user skin profile {skinTone, undertone, skinType, faceShape}
 * @param {Object}            look     — generated look {occasion, intensity, steps, missing}
 * @returns {Object}          evaluation result
 */
export function analyzeImage(canvas, landmarks, profile, look) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);

  // ── Extract pixel regions ───────────────────────────────────────────────
  const regions = {};
  for (const [name, indices] of Object.entries(LANDMARK_REGIONS)) {
    const points = regionPoints(landmarks, indices, width, height);
    regions[name] = {
      pixels: samplePolygon(imageData, points, width),
      points,
    };
  }

  // ── Compute HSV statistics per region ──────────────────────────────────
  const hsv = {};
  for (const [name, { pixels }] of Object.entries(regions)) {
    hsv[name] = meanHsv(pixels);
  }

  // ── Skin reference ──────────────────────────────────────────────────────
  const skinRef = hsv.NOSE_BRIDGE;

  // ─────────────────────────────────────────────────────────────────────────
  // SCORING — each sub-score 0-100
  // ─────────────────────────────────────────────────────────────────────────

  // ── 1. Foundation / Skin (20% weight) ────────────────────────────────────
  const skinScore = (() => {
    const fhsv = hsv.FOREHEAD;
    // Evenness: low brightness variance = smooth blending
    const evenness = Math.max(0, 1 - fhsv.vStd * 6) * 100;
    // Tone match: face v ≈ skin reference v (no obvious orange cast)
    const toneMatch = Math.max(0, 1 - Math.abs(fhsv.v - skinRef.v) * 4) * 100;
    // Saturation: skin shouldn't be over-saturated (cakey/orange)
    const satPenalty = Math.max(0, fhsv.s - 0.35) * 200; // penalty if s > 0.35
    const raw = evenness * 0.45 + toneMatch * 0.4 - satPenalty * 0.15;

    // Profile adjustment: undertone mismatch adds orange detection
    let adjust = 0;
    if (profile?.undertone === "Cool" && fhsv.h > 25 && fhsv.h < 55 && fhsv.s > 0.3) {
      adjust = -12; // warm cast on cool skin
    }
    return clamp(raw + adjust);
  })();

  // ── 2. Blush / Cheeks (15% weight) ───────────────────────────────────────
  const blushScore = (() => {
    const leftHsv  = hsv.LEFT_CHEEK;
    const rightHsv = hsv.RIGHT_CHEEK;
    const sym  = symmetryScore(leftHsv, rightHsv) * 100;

    // Blush presence: higher saturation than skin reference = product applied
    const leftSatLift  = Math.max(0, leftHsv.s  - skinRef.s);
    const rightSatLift = Math.max(0, rightHsv.s - skinRef.s);
    const avgLift = (leftSatLift + rightSatLift) / 2;

    // Expected saturation lift based on intensity
    const intensityDots = look?.intensity?.dots ?? 3;
    const expectedLift = 0.04 + intensityDots * 0.025;

    const presence = Math.max(0, 1 - Math.abs(avgLift - expectedLift) / 0.15) * 100;
    return clamp(sym * 0.5 + presence * 0.5);
  })();

  // ── 3. Eyes (25% weight) ─────────────────────────────────────────────────
  const eyeScore = (() => {
    const leftHsv  = hsv.LEFT_EYE_REGION;
    const rightHsv = hsv.RIGHT_EYE_REGION;
    const sym = symmetryScore(leftHsv, rightHsv) * 100;

    // Eye shadow presence: saturation lift above skin baseline
    const leftLift  = Math.max(0, leftHsv.s  - skinRef.s);
    const rightLift = Math.max(0, rightHsv.s - skinRef.s);
    const avgLift = (leftLift + rightLift) / 2;

    const intensityDots = look?.intensity?.dots ?? 3;
    // Natural looks expect minimal eye saturation, glam expects more
    const expectedLift = intensityDots <= 2 ? 0.02 : intensityDots <= 3 ? 0.06 : 0.10;
    const presence = Math.max(0, 1 - Math.abs(avgLift - expectedLift) / 0.12) * 100;

    // Blending: low variance in eye region = well-blended shadow
    const blending = Math.max(0, 1 - ((leftHsv.vStd + rightHsv.vStd) / 2) * 5) * 100;

    return clamp(sym * 0.35 + presence * 0.35 + blending * 0.3);
  })();

  // ── 4. Eyebrows (15% weight) ─────────────────────────────────────────────
  const browScore = (() => {
    const leftHsv  = hsv.LEFT_BROW;
    const rightHsv = hsv.RIGHT_BROW;
    const sym = symmetryScore(leftHsv, rightHsv) * 100;

    // Brow definition: darker than skin = defined
    const leftDef  = Math.max(0, skinRef.v - leftHsv.v) * 4;
    const rightDef = Math.max(0, skinRef.v - rightHsv.v) * 4;
    const avgDef = ((leftDef + rightDef) / 2) * 100;

    // Over-filled penalty: much darker than skin = too heavy
    const overFill = Math.max(0, (skinRef.v - leftHsv.v) - 0.35);
    const penalty  = overFill * 200;

    return clamp(sym * 0.55 + avgDef * 0.3 - penalty * 0.15);
  })();

  // ── 5. Lips (15% weight) ─────────────────────────────────────────────────
  const lipScore = (() => {
    const lipHsv = hsv.LIPS_OUTER;

    // Saturation (colour payoff)
    const intensityDots = look?.intensity?.dots ?? 3;
    const expectedSat = 0.2 + intensityDots * 0.1;
    const satMatch = Math.max(0, 1 - Math.abs(lipHsv.s - expectedSat) / 0.25) * 100;

    // Uniformity: low saturation variance = even application
    const uniformity = Math.max(0, 1 - lipHsv.sStd * 8) * 100;

    // Undertone harmony check
    let harmonyBonus = 0;
    const ut = profile?.undertone;
    if (ut === "Warm" && lipHsv.h > 0 && lipHsv.h < 50) harmonyBonus = 8;   // peachy/warm lip
    if (ut === "Cool" && lipHsv.h > 300 || (lipHsv.h > 280 && lipHsv.h < 360)) harmonyBonus = 8; // pink/cool lip
    if (ut === "Neutral") harmonyBonus = 5;

    return clamp(satMatch * 0.45 + uniformity * 0.35 + harmonyBonus * 0.2);
  })();

  // ── 6. Overall Balance / Harmony (10% weight) ────────────────────────────
  const harmonyScore = (() => {
    // Check overall facial symmetry (left vs right halves)
    const faceSym = symmetryScore(hsv.LEFT_CHEEK, hsv.RIGHT_CHEEK) * 100;
    const eyeSym  = symmetryScore(hsv.LEFT_EYE_REGION, hsv.RIGHT_EYE_REGION) * 100;
    const browSym = symmetryScore(hsv.LEFT_BROW, hsv.RIGHT_BROW) * 100;

    const avgSym = (faceSym + eyeSym + browSym) / 3;

    // Coherence: check that intensity is consistent across zones
    const intensityDots = look?.intensity?.dots ?? 3;
    const lipSat  = hsv.LIPS_OUTER.s;
    const eyeSat  = (hsv.LEFT_EYE_REGION.s + hsv.RIGHT_EYE_REGION.s) / 2;
    const cheekSat = (hsv.LEFT_CHEEK.s + hsv.RIGHT_CHEEK.s) / 2;

    const allZones = [lipSat, eyeSat, cheekSat];
    const zoneVariance = stats(allZones).std;

    // Low variance = balanced look; high variance = one zone dominates too much
    const balancePenalty = zoneVariance > 0.15 ? (zoneVariance - 0.15) * 300 : 0;

    return clamp(avgSym * 0.6 + 40 - balancePenalty * 0.4);
  })();

  // ── Weighted overall score ────────────────────────────────────────────────
  const overall = Math.round(
    skinScore  * 0.20 +
    blushScore * 0.15 +
    eyeScore   * 0.25 +
    browScore  * 0.15 +
    lipScore   * 0.15 +
    harmonyScore * 0.10
  );

  // ─────────────────────────────────────────────────────────────────────────
  // FEEDBACK ENGINE
  // ─────────────────────────────────────────────────────────────────────────
  const suggestions = generateSuggestions({
    scores: { skinScore, blushScore, eyeScore, browScore, lipScore, harmonyScore, overall },
    hsv,
    skinRef,
    profile,
    look,
  });

  return {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    overall,
    subscores: {
      skin:    Math.round(skinScore),
      blush:   Math.round(blushScore),
      eyes:    Math.round(eyeScore),
      brows:   Math.round(browScore),
      lips:    Math.round(lipScore),
      harmony: Math.round(harmonyScore),
    },
    suggestions,
    profile: profile ?? {},
    look: look ? { occasion: look.occasion, intensity: look.intensity?.label } : null,
  };
}

// ─── Suggestion Engine ────────────────────────────────────────────────────

function generateSuggestions({ scores, hsv, skinRef, profile, look }) {
  const tips = [];
  const { skinScore, blushScore, eyeScore, browScore, lipScore, harmonyScore } = scores;
  const ut = profile?.undertone ?? "Neutral";
  const intensityDots = look?.intensity?.dots ?? 3;

  // ── Skin / Foundation ──
  if (skinScore < 70) {
    const fhsv = hsv.FOREHEAD;
    if (fhsv.vStd > 0.12) {
      tips.push({
        zone: "Skin",
        severity: skinScore < 55 ? "high" : "medium",
        text: "Foundation blending looks uneven. Use a damp sponge and press in circular motions from the centre outward — avoid swiping, which creates visible streaks.",
      });
    }
    if (fhsv.s > 0.38 && (fhsv.h > 20 && fhsv.h < 50)) {
      tips.push({
        zone: "Skin",
        severity: "high",
        text: `Foundation appears warm/orange against your ${ut.toLowerCase()} undertone. Try a shade with more ${ut === "Cool" ? "pink (C-coded)" : "neutral (N-coded)"} pigment, or mix with a lighter shade.`,
      });
    }
    if (fhsv.s > 0.42) {
      tips.push({
        zone: "Skin",
        severity: "medium",
        text: "High colour saturation on the skin suggests heavy coverage or powder buildup. Try pressing a damp sponge over the face to sheeren and meld the layers.",
      });
    }
  }

  // ── Blush ──
  if (blushScore < 65) {
    const leftHsv  = hsv.LEFT_CHEEK;
    const rightHsv = hsv.RIGHT_CHEEK;
    const sym = symmetryScore(leftHsv, rightHsv);

    if (sym < 0.75) {
      tips.push({
        zone: "Blush",
        severity: "high",
        text: "Blush is noticeably more prominent on one side. Start with a lighter hand on both cheeks simultaneously, building symmetrically using a fan brush in soft circular motions.",
      });
    }

    const avgSat = (leftHsv.s + rightHsv.s) / 2;
    const skinSat = skinRef.s;
    if (avgSat - skinSat < 0.02 && intensityDots >= 3) {
      tips.push({
        zone: "Blush",
        severity: "medium",
        text: "Blush is barely visible for the intensity level you selected. Try tapping directly from pan to cheek (less brush-swirling) for better colour payoff, then blend edges.",
      });
    }
    if (avgSat - skinSat > 0.2) {
      tips.push({
        zone: "Blush",
        severity: "medium",
        text: "Blush appears quite intense. Blend upward toward the temples to soften — or dust a light setting powder over it to tone down the saturation.",
      });
    }
  }

  // ── Eyes ──
  if (eyeScore < 65) {
    const leftHsv  = hsv.LEFT_EYE_REGION;
    const rightHsv = hsv.RIGHT_EYE_REGION;
    const sym = symmetryScore(leftHsv, rightHsv);
    const avgVStd = (leftHsv.vStd + rightHsv.vStd) / 2;

    if (sym < 0.72) {
      tips.push({
        zone: "Eyes",
        severity: "high",
        text: "Eye makeup appears asymmetrical between left and right. Apply shadow with the same brush pressure on both sides — check in natural light mid-application.",
      });
    }
    if (avgVStd > 0.14) {
      tips.push({
        zone: "Eyes",
        severity: "medium",
        text: "Eye shadow edges look unblended — there are visible brightness transitions. Use a clean fluffy blending brush in small windshield-wiper motions to soften the crease line.",
      });
    }
    if (intensityDots >= 3 && (leftHsv.s + rightHsv.s) / 2 - skinRef.s < 0.03) {
      tips.push({
        zone: "Eyes",
        severity: "medium",
        text: "Eye shadow payoff is lower than expected for your selected look. Pack the shade on first with a flat brush, then blend edges — packing before blending increases colour intensity significantly.",
      });
    }
  }

  // ── Eyebrows ──
  if (browScore < 65) {
    const leftHsv  = hsv.LEFT_BROW;
    const rightHsv = hsv.RIGHT_BROW;
    const sym = symmetryScore(leftHsv, rightHsv);

    if (sym < 0.72) {
      tips.push({
        zone: "Brows",
        severity: "high",
        text: "Brows look different from each other. Use a brow pencil to map the arch point on both sides before filling — measuring with a brush handle from nostril to brow helps find symmetrical placement.",
      });
    }

    const avgDarkening = (skinRef.v - leftHsv.v + skinRef.v - rightHsv.v) / 2;
    if (avgDarkening < 0.05) {
      tips.push({
        zone: "Brows",
        severity: "medium",
        text: "Brow definition is subtle — the brows aren't clearly framing the eyes. Use short, hair-like strokes with a fine brow pencil or pomade to add structure.",
      });
    }
    if (avgDarkening > 0.4) {
      tips.push({
        zone: "Brows",
        severity: "medium",
        text: `Brows appear quite dark and heavy${ut === "Cool" || ut === "Warm" ? ` relative to typical ${ut.toLowerCase()}-undertoned colouring` : ""}. Brush through with a spoolie to soften, and consider a shade 1–2 tones lighter than your hair colour.`,
      });
    }
  }

  // ── Lips ──
  if (lipScore < 65) {
    const lipHsv = hsv.LIPS_OUTER;

    if (lipHsv.sStd > 0.12) {
      tips.push({
        zone: "Lips",
        severity: "medium",
        text: "Lip colour looks patchy or uneven. Apply lip liner first and fill in the entire lip — this creates a base layer that evening out the final lip colour significantly.",
      });
    }
    if (lipHsv.s < 0.15 && intensityDots >= 4) {
      tips.push({
        zone: "Lips",
        severity: "high",
        text: "Lip colour saturation is much lower than expected for a bold/glam look. Blot the first layer and reapply — or try pressing the product on with your fingertip for more concentrated pigment.",
      });
    }

    // Undertone harmony
    const isWarmLip = lipHsv.h > 0 && lipHsv.h < 55;
    const isCoolLip = lipHsv.h > 290 || lipHsv.h < 10;
    if (ut === "Cool" && isWarmLip && lipHsv.s > 0.25) {
      tips.push({
        zone: "Lips",
        severity: "medium",
        text: "Your lip colour leans warm (orange/peachy) but your undertone is cool — this can create a slightly clashing effect. A pink-based or mauve-based shade would harmonise more naturally.",
      });
    }
    if (ut === "Warm" && isCoolLip && lipHsv.s > 0.25) {
      tips.push({
        zone: "Lips",
        severity: "medium",
        text: "Your lip colour leans cool (pink/blue-based) but your undertone is warm — try a peach, warm nude, or warm red-based lip for a more harmonious result.",
      });
    }
  }

  // ── Harmony ──
  if (harmonyScore < 60) {
    tips.push({
      zone: "Harmony",
      severity: "medium",
      text: "The overall balance between makeup zones is off — one area appears to dominate significantly. Try the rule of three: soften either the eyes OR the lips, letting the other be the focal point.",
    });
  }

  // ── Positive feedback (if doing well) ──
  if (scores.overall >= 80) {
    tips.push({
      zone: "Overall",
      severity: "positive",
      text: "Excellent execution! Your makeup application looks well-blended and proportioned. The main refinement would be in the lower-scoring area above.",
    });
  } else if (scores.overall >= 65) {
    tips.push({
      zone: "Overall",
      severity: "positive",
      text: "Solid foundation! A few targeted adjustments will noticeably elevate the finished look. Focus on the highest-priority suggestions above.",
    });
  }

  // Sort: high severity first, then medium, then positive
  const order = { high: 0, medium: 1, positive: 2 };
  return tips.sort((a, b) => order[a.severity] - order[b.severity]);
}

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// ─── Image compression ────────────────────────────────────────────────────

/**
 * Compress and resize an image File/Blob to a canvas element.
 * Returns { canvas, dataUrl } ready for analysis and preview.
 */
export async function prepareImage(file, maxDimension = 640) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width  = Math.round(width  * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve({ canvas, dataUrl: canvas.toDataURL("image/jpeg", 0.85), width, height });
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

// ─── Grade helpers ────────────────────────────────────────────────────────

export function scoreToGrade(score) {
  if (score >= 90) return { grade: "A+", label: "Flawless",     color: "#16a34a" };
  if (score >= 80) return { grade: "A",  label: "Excellent",    color: "#22c55e" };
  if (score >= 70) return { grade: "B+", label: "Very Good",    color: "#84cc16" };
  if (score >= 60) return { grade: "B",  label: "Good",         color: "#eab308" };
  if (score >= 50) return { grade: "C",  label: "Developing",   color: "#f97316" };
  return             { grade: "D",  label: "Needs Work",    color: "#ef4444" };
}

export function scoreColor(score) {
  if (score >= 80) return "#e11d48";
  if (score >= 65) return "#f97316";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}
