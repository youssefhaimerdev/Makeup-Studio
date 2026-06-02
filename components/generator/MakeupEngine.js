"use client";
import { useEffect, useRef, useCallback, useState } from "react";

const FACE_W = 1024, FACE_H = 1536;

const MASK_SRCS = {
  lips:           "/masks/lips-mask.png",
  blushLeft:      "/masks/blush-left-mask.png",
  blushRight:     "/masks/blush-right-mask.png",
  eyeshadowLeft:  "/masks/eyeshadow-left-mask.png",
  eyeshadowRight: "/masks/eyeshadow-right-mask.png",
  eyelinerLeft:   "/masks/eyeliner-left-mask.png",
  eyelinerRight:  "/masks/eyeliner-right-mask.png",
  mascaraLeft:    "/masks/mascara-left-mask.png",
  mascaraRight:   "/masks/mascara-right-mask.png",
  contour:        "/masks/contour-mask.png",
  highlight:      "/masks/highlight-mask.png",
};

function hexToRgb(hex) {
  try {
    const h = (hex || "#ff0000").replace("#", "");
    return [parseInt(h.slice(0,2),16)||0, parseInt(h.slice(2,4),16)||0, parseInt(h.slice(4,6),16)||0];
  } catch { return [255, 0, 0]; }
}

function loadImg(src) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null); // never reject — just return null
    img.src = src;
  });
}

// Apply one color layer using a mask, with blend mode
function applyLayer(ctx, maskImg, color, opacity, blendMode, W, H) {
  if (!maskImg || !ctx || opacity <= 0) return;
  try {
    const [r, g, b] = hexToRgb(color);

    // Offscreen canvas for the mask
    const mc = document.createElement("canvas");
    mc.width = W; mc.height = H;
    const mctx = mc.getContext("2d");
    mctx.drawImage(maskImg, 0, 0, W, H);
    const maskData = mctx.getImageData(0, 0, W, H).data;

    // Build colored pixels shaped by mask alpha
    const cc = document.createElement("canvas");
    cc.width = W; cc.height = H;
    const cctx = cc.getContext("2d");
    const colorImg = cctx.createImageData(W, H);
    const cd = colorImg.data;

    for (let i = 0; i < maskData.length; i += 4) {
      const alpha = (maskData[i + 3] / 255) * (maskData[i] / 255) * opacity;
      cd[i]     = r;
      cd[i + 1] = g;
      cd[i + 2] = b;
      cd[i + 3] = Math.min(255, Math.round(alpha * 255));
    }
    cctx.putImageData(colorImg, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = blendMode;
    ctx.globalAlpha = 1;
    ctx.drawImage(cc, 0, 0);
    ctx.restore();
  } catch (e) {
    console.warn("applyLayer failed:", e);
  }
}

const mkState = () => ({
  lipColor:"#c03858",     lipOpacity:0,
  blushColor:"#e87060",   blushOpacity:0,
  eyeColor:"#806090",     eyeOpacity:0,
  eyelinerOpacity:0,
  mascaraOpacity:0,
  contourColor:"#8a5030", contourOpacity:0,
  highlightOpacity:0,
});

export function useMakeupEngine(canvasRef) {
  const faceRef   = useRef(null);
  const masksRef  = useRef({});
  const stateRef  = useRef(mkState());
  const readyRef  = useRef(false);

  const [loading, setLoading] = useState(true);
  const [ready,   setReady]   = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const face = await loadImg("/faces/mannequin.png");
        if (!face) throw new Error("Could not load mannequin image");

        const masks = {};
        await Promise.all(
          Object.entries(MASK_SRCS).map(async ([k, src]) => {
            masks[k] = await loadImg(src); // null if failed — handled gracefully
          })
        );

        if (!alive) return;
        faceRef.current  = face;
        masksRef.current = masks;
        readyRef.current = true;
        setReady(true);
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setError(e.message);
        setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const face   = faceRef.current;
    if (!canvas || !face || !readyRef.current) return;

    try {
      const W = FACE_W, H = FACE_H;
      canvas.width  = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      const s   = stateRef.current;
      const m   = masksRef.current;

      // 1. Base face
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(face, 0, 0, W, H);

      // 2. Contour — multiply darkens naturally
      applyLayer(ctx, m.contour, s.contourColor, s.contourOpacity, "multiply", W, H);

      // 3. Blush — soft-light for natural warmth
      applyLayer(ctx, m.blushLeft,  s.blushColor, s.blushOpacity, "soft-light", W, H);
      applyLayer(ctx, m.blushRight, s.blushColor, s.blushOpacity, "soft-light", W, H);

      // 4. Eyeshadow — multiply for depth, overlay for vibrancy
      applyLayer(ctx, m.eyeshadowLeft,  s.eyeColor, s.eyeOpacity * 0.85, "multiply", W, H);
      applyLayer(ctx, m.eyeshadowRight, s.eyeColor, s.eyeOpacity * 0.85, "multiply", W, H);
      applyLayer(ctx, m.eyeshadowLeft,  s.eyeColor, s.eyeOpacity * 0.40, "overlay",  W, H);
      applyLayer(ctx, m.eyeshadowRight, s.eyeColor, s.eyeOpacity * 0.40, "overlay",  W, H);

      // 5. Eyeliner — multiply, near black
      applyLayer(ctx, m.eyelinerLeft,  "#080202", s.eyelinerOpacity, "multiply", W, H);
      applyLayer(ctx, m.eyelinerRight, "#080202", s.eyelinerOpacity, "multiply", W, H);

      // 6. Mascara — multiply, darken lash zone
      applyLayer(ctx, m.mascaraLeft,  "#060101", s.mascaraOpacity, "multiply", W, H);
      applyLayer(ctx, m.mascaraRight, "#060101", s.mascaraOpacity, "multiply", W, H);

      // 7. Highlight — screen brightens peaks
      applyLayer(ctx, m.highlight, "#f8e8c0", s.highlightOpacity, "screen", W, H);

      // 8. Lipstick — multiply + overlay + screen sheen
      applyLayer(ctx, m.lips, s.lipColor, s.lipOpacity * 0.75, "multiply", W, H);
      applyLayer(ctx, m.lips, s.lipColor, s.lipOpacity * 0.55, "overlay",  W, H);
      applyLayer(ctx, m.lips, "#ffffff",  s.lipOpacity * 0.12, "screen",   W, H);

    } catch (e) {
      console.warn("MakeupEngine render error:", e);
    }
  }, [canvasRef]);

  // Render once assets are ready
  useEffect(() => {
    if (ready) render();
  }, [ready]); // eslint-disable-line

  const update = (changes) => {
    Object.assign(stateRef.current, changes);
    render();
  };

  return {
    ready, loading, error,
    applyLipstick:  (color, opacity) => update({ lipColor: color,     lipOpacity: opacity }),
    applyBlush:     (color, opacity) => update({ blushColor: color,   blushOpacity: opacity }),
    applyEyeshadow: (color, opacity) => update({ eyeColor: color,     eyeOpacity: opacity }),
    applyEyeliner:  (opacity)        => update({ eyelinerOpacity: opacity }),
    applyMascara:   (opacity)        => update({ mascaraOpacity: opacity }),
    applyContour:   (color, opacity) => update({ contourColor: color, contourOpacity: opacity }),
    applyHighlight: (opacity)        => update({ highlightOpacity: opacity }),
    reset:          ()               => { stateRef.current = mkState(); render(); },
  };
}
