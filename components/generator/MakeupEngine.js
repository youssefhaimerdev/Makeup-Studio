"use client";
import { useEffect, useRef, useCallback, useState } from "react";

const FACE_W = 1024, FACE_H = 1536;
const MASKS = {
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
  const h = (hex||"#ff0000").replace("#","");
  return [parseInt(h.slice(0,2),16)||0, parseInt(h.slice(2,4),16)||0, parseInt(h.slice(4,6),16)||0];
}
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function applyLayer(ctx, maskImg, color, opacity, blendMode, W, H) {
  if (!maskImg || opacity <= 0) return;
  const [r,g,b] = hexToRgb(color);

  // Extract mask alpha
  const mc = document.createElement("canvas");
  mc.width=W; mc.height=H;
  const mctx = mc.getContext("2d");
  mctx.drawImage(maskImg, 0, 0, W, H);
  const maskPx = mctx.getImageData(0,0,W,H);

  // Build colored layer shaped by mask
  const cc = document.createElement("canvas");
  cc.width=W; cc.height=H;
  const cctx = cc.getContext("2d");
  const colorPx = cctx.createImageData(W,H);
  for (let i=0; i<maskPx.data.length; i+=4) {
    const a = (maskPx.data[i+3]/255) * (maskPx.data[i]/255) * opacity;
    colorPx.data[i]   = r;
    colorPx.data[i+1] = g;
    colorPx.data[i+2] = b;
    colorPx.data[i+3] = Math.round(a*255);
  }
  cctx.putImageData(colorPx, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = blendMode;
  ctx.drawImage(cc, 0, 0);
  ctx.restore();
}

const defaultState = () => ({
  lipColor:"#c03858",    lipOpacity:0,
  blushColor:"#e87060",  blushOpacity:0,
  eyeColor:"#8060a0",    eyeOpacity:0,
  eyelinerOpacity:0,
  mascaraOpacity:0,
  contourColor:"#8a5030",contourOpacity:0,
  highlightOpacity:0,
});

export function useMakeupEngine(canvasRef) {
  const faceRef  = useRef(null);
  const masksRef = useRef({});
  const stateRef = useRef(defaultState());
  const [ready,   setReady]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let dead = false;
    async function load() {
      const face = await loadImage("/faces/mannequin.png");
      const masks = {};
      await Promise.all(Object.entries(MASKS).map(async ([k,src]) => {
        try { masks[k] = await loadImage(src); } catch {}
      }));
      if (dead) return;
      faceRef.current  = face;
      masksRef.current = masks;
      setLoading(false); setReady(true);
    }
    load().catch(() => setLoading(false));
    return () => { dead = true; };
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const face   = faceRef.current;
    if (!canvas || !face) return;
    const W=FACE_W, H=FACE_H, s=stateRef.current, m=masksRef.current;
    canvas.width=W; canvas.height=H;
    const ctx = canvas.getContext("2d");

    // Base face
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(face, 0,0,W,H);

    // Contour (multiply — darkens naturally)
    applyLayer(ctx, m.contour, s.contourColor, s.contourOpacity, "multiply", W, H);

    // Blush (soft-light — warms cheeks, feels natural)
    applyLayer(ctx, m.blushLeft,  s.blushColor, s.blushOpacity, "soft-light", W, H);
    applyLayer(ctx, m.blushRight, s.blushColor, s.blushOpacity, "soft-light", W, H);

    // Eyeshadow (multiply for depth + overlay for vibrancy)
    applyLayer(ctx, m.eyeshadowLeft,  s.eyeColor, s.eyeOpacity*0.85, "multiply", W, H);
    applyLayer(ctx, m.eyeshadowRight, s.eyeColor, s.eyeOpacity*0.85, "multiply", W, H);
    applyLayer(ctx, m.eyeshadowLeft,  s.eyeColor, s.eyeOpacity*0.40, "overlay",  W, H);
    applyLayer(ctx, m.eyeshadowRight, s.eyeColor, s.eyeOpacity*0.40, "overlay",  W, H);

    // Eyeliner (multiply, near black, precise)
    applyLayer(ctx, m.eyelinerLeft,  "#080202", s.eyelinerOpacity, "multiply", W, H);
    applyLayer(ctx, m.eyelinerRight, "#080202", s.eyelinerOpacity, "multiply", W, H);

    // Mascara
    applyLayer(ctx, m.mascaraLeft,  "#060101", s.mascaraOpacity, "multiply", W, H);
    applyLayer(ctx, m.mascaraRight, "#060101", s.mascaraOpacity, "multiply", W, H);

    // Highlight (screen — brightens cheekbones + nose)
    applyLayer(ctx, m.highlight, "#f8e8c0", s.highlightOpacity, "screen", W, H);

    // Lipstick — multiply + overlay layered for depth, then screen sheen
    applyLayer(ctx, m.lips, s.lipColor, s.lipOpacity*0.75, "multiply", W, H);
    applyLayer(ctx, m.lips, s.lipColor, s.lipOpacity*0.55, "overlay",  W, H);
    applyLayer(ctx, m.lips, "#ffffff",  s.lipOpacity*0.12, "screen",   W, H);
  }, [canvasRef]);

  // Re-render once assets load
  useEffect(() => { if (ready) render(); }, [ready, render]);

  return {
    ready, loading,
    faceW: FACE_W, faceH: FACE_H,
    applyLipstick:  (color, opacity) => { stateRef.current.lipColor=color; stateRef.current.lipOpacity=opacity; render(); },
    applyBlush:     (color, opacity) => { stateRef.current.blushColor=color; stateRef.current.blushOpacity=opacity; render(); },
    applyEyeshadow: (color, opacity) => { stateRef.current.eyeColor=color; stateRef.current.eyeOpacity=opacity; render(); },
    applyEyeliner:  (opacity)        => { stateRef.current.eyelinerOpacity=opacity; render(); },
    applyMascara:   (opacity)        => { stateRef.current.mascaraOpacity=opacity; render(); },
    applyContour:   (color, opacity) => { stateRef.current.contourColor=color; stateRef.current.contourOpacity=opacity; render(); },
    applyHighlight: (opacity)        => { stateRef.current.highlightOpacity=opacity; render(); },
    reset: () => { stateRef.current=defaultState(); render(); },
    getState: () => ({ ...stateRef.current }),
  };
}
