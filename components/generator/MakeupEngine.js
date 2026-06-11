"use client";
import { useEffect, useRef, useCallback, useState } from "react";

/**
 * MakeupEngine v3 — Clip-path based rendering.
 * For each zone: clip the canvas to the exact shape, then fill with
 * blend mode. No offscreen buffers, no spreading blobs.
 * Soft zones (blush/contour/highlight) use radial gradients + blur.
 */

function hexToRgb(hex) {
  const h = (hex || "#ff0000").replace("#", "");
  return [parseInt(h.slice(0,2),16)||0, parseInt(h.slice(2,4),16)||0, parseInt(h.slice(4,6),16)||0];
}

function loadImg(src) {
  return new Promise(resolve => {
    const img = new window.Image();
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// ── Precise clip-fill for hard zones (lips, eyeliner, eyeshadow) ──────
function applyClip(ctx, buildPath, color, opacity, blendMode) {
  ctx.save();
  buildPath(ctx);
  ctx.clip();
  const [r,g,b] = hexToRgb(color);
  ctx.globalCompositeOperation = blendMode;
  ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

// ── Soft radial gradient for blush/contour/highlight ──────────────────
function applySoft(ctx, cx, cy, rx, ry, color, opacity, blendMode, blurPx) {
  const [r,g,b] = hexToRgb(color);
  const oc = document.createElement("canvas");
  oc.width = ctx.canvas.width; oc.height = ctx.canvas.height;
  const oc2 = oc.getContext("2d");

  // Radial gradient shaped to ellipse
  const grad = oc2.createRadialGradient(cx,cy,0, cx,cy,Math.max(rx,ry));
  grad.addColorStop(0,   `rgba(${r},${g},${b},${opacity})`);
  grad.addColorStop(0.5, `rgba(${r},${g},${b},${opacity * 0.6})`);
  grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

  oc2.save();
  oc2.scale(1, ry/rx);
  oc2.beginPath();
  oc2.arc(cx, cy*(rx/ry), rx, 0, Math.PI*2);
  oc2.fillStyle = grad;
  oc2.fill();
  oc2.restore();

  // Apply blur via CSS filter on a second offscreen
  const oc3 = document.createElement("canvas");
  oc3.width = oc.width; oc3.height = oc.height;
  const oc3ctx = oc3.getContext("2d");
  oc3ctx.filter = `blur(${blurPx}px)`;
  oc3ctx.drawImage(oc, 0, 0);
  oc3ctx.filter = "none";

  ctx.save();
  ctx.globalCompositeOperation = blendMode;
  ctx.drawImage(oc3, 0, 0);
  ctx.restore();
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
  const faceRef  = useRef(null);
  const zonesRef = useRef(null);
  const stateRef = useRef(mkState());
  const readyRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [ready,   setReady]   = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [face, lm] = await Promise.all([
          loadImg("/faces/mannequin.png"),
          fetch("/face-landmarks.json").then(r=>r.json()).catch(()=>null),
        ]);
        if (!face) throw new Error("mannequin.png failed to load");
        if (!lm)   throw new Error("face-landmarks.json failed to load");
        if (!alive) return;
        faceRef.current  = face;
        zonesRef.current = lm.zones;
        readyRef.current = true;
        setReady(true); setLoading(false);
      } catch(e) {
        if (!alive) return;
        setError(e.message); setLoading(false);
        console.error("MakeupEngine:", e);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const face   = faceRef.current;
    const zones  = zonesRef.current;
    if (!canvas || !face || !zones || !readyRef.current) return;

    try {
      const W = face.naturalWidth  || 1024;
      const H = face.naturalHeight || 1536;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");
      const s = stateRef.current;

      // ── Base face ─────────────────────────────────────────────────
      ctx.clearRect(0,0,W,H);
      ctx.drawImage(face,0,0,W,H);

      // ── Helpers: scale normalized coords ──────────────────────────
      const sx = v => v * W;
      const sy = v => v * H;

      // ── 1. Contour (multiply) ─────────────────────────────────────
      if (s.contourOpacity > 0) {
        const z = zones.left_contour;
        const blur = (z.blur||18) * W/1024;
        applySoft(ctx, sx(z.cx), sy(z.cy), sx(z.rx), sy(z.ry), s.contourColor, s.contourOpacity*0.65, "multiply", blur);
        const zr = zones.right_contour;
        applySoft(ctx, sx(zr.cx), sy(zr.cy), sx(zr.rx), sy(zr.ry), s.contourColor, s.contourOpacity*0.65, "multiply", blur);
      }

      // ── 2. Blush (soft-light) ─────────────────────────────────────
      if (s.blushOpacity > 0) {
        const blur = 22 * W/1024;
        const zl = zones.left_blush;  const zr = zones.right_blush;
        applySoft(ctx, sx(zl.cx), sy(zl.cy), sx(zl.rx), sy(zl.ry), s.blushColor, s.blushOpacity*0.75, "soft-light", blur);
        applySoft(ctx, sx(zr.cx), sy(zr.cy), sx(zr.rx), sy(zr.ry), s.blushColor, s.blushOpacity*0.75, "soft-light", blur);
      }

      // ── 3. Eyeshadow (multiply + overlay) ────────────────────────
      if (s.eyeOpacity > 0) {
        const z = zones.left_eyeshadow; const blur = 7 * W/1024;
        const path = (z, flip) => (ctx) => {
          const ecx=sx(z.cx), ecy=sy(z.cy), erx=sx(z.rx), ery=sy(z.ry);
          ctx.beginPath();
          ctx.ellipse(ecx, ecy, erx, ery, 0, 0, Math.PI*2);
        };
        applyClip(ctx, path(zones.left_eyeshadow), s.eyeColor, s.eyeOpacity*0.62, "multiply");
        applyClip(ctx, path(zones.right_eyeshadow), s.eyeColor, s.eyeOpacity*0.62, "multiply");
        applyClip(ctx, path(zones.left_eyeshadow), s.eyeColor, s.eyeOpacity*0.28, "overlay");
        applyClip(ctx, path(zones.right_eyeshadow), s.eyeColor, s.eyeOpacity*0.28, "overlay");
      }

      // ── 4. Eyeliner (multiply, near black) ───────────────────────
      if (s.eyelinerOpacity > 0) {
        const buildLinerPath = (z, wingDir) => (ctx) => {
          const ecx=sx(z.cx), ecy=sy(z.cy), erx=sx(z.rx), ery=sy(z.ry);
          ctx.beginPath();
          ctx.ellipse(ecx, ecy, erx, ery, 0, 0, Math.PI*2);
          // Wing tip
          const wx = ecx + wingDir * (erx + sx(0.02));
          ctx.ellipse(wx, ecy - ery*0.8, sx(0.016), ery*0.7, wingDir*0.4, 0, Math.PI*2);
        };
        applyClip(ctx, buildLinerPath(zones.left_eyeliner,  -1), "#080202", s.eyelinerOpacity*0.88, "multiply");
        applyClip(ctx, buildLinerPath(zones.right_eyeliner,  1), "#080202", s.eyelinerOpacity*0.88, "multiply");
      }

      // ── 5. Mascara (multiply) ────────────────────────────────────
      if (s.mascaraOpacity > 0) {
        const buildM = (z) => (ctx) => {
          ctx.beginPath();
          ctx.ellipse(sx(z.cx), sy(z.cy), sx(z.rx), sy(z.ry), 0, 0, Math.PI*2);
        };
        applyClip(ctx, buildM(zones.left_mascara),  "#050101", s.mascaraOpacity*0.82, "multiply");
        applyClip(ctx, buildM(zones.right_mascara), "#050101", s.mascaraOpacity*0.82, "multiply");
      }

      // ── 6. Highlight (screen) ────────────────────────────────────
      if (s.highlightOpacity > 0) {
        const blur = 12 * W/1024;
        const hl = "#f8e8c0";
        const zl = zones.left_highlight; const zr = zones.right_highlight;
        applySoft(ctx, sx(zl.cx), sy(zl.cy), sx(zl.rx), sy(zl.ry), hl, s.highlightOpacity*0.65, "screen", blur);
        applySoft(ctx, sx(zr.cx), sy(zr.cy), sx(zr.rx), sy(zr.ry), hl, s.highlightOpacity*0.65, "screen", blur);
        const zn = zones.nose_highlight;
        applySoft(ctx, sx(zn.cx), sy(zn.cy), sx(zn.rx), sy(zn.ry), hl, s.highlightOpacity*0.45, "screen", 8*W/1024);
      }

      // ── 7. LIPS — clip to exact lip shape ────────────────────────
      if (s.lipOpacity > 0) {
        const z = zones.lips;
        const cx    = sx(z.cx);
        const topY  = sy(z.topY);
        const botY  = sy(z.botY);
        const midY  = sy(z.midY);
        const rx    = sx(z.rx);

        // Upper lip height and lower lip height
        const uRy = midY - topY;   // ~80px
        const lRy = botY - midY;   // ~80px

        const buildLips = (ctx) => {
          // Upper lip — cupid's bow: two side ellipses + center dip
          ctx.beginPath();
          // Main upper lip shape
          ctx.ellipse(cx, topY + uRy * 0.55, rx, uRy * 0.9, 0, 0, Math.PI*2);
          // Lower lip — fuller
          ctx.ellipse(cx, midY + lRy * 0.45, rx * 0.92, lRy * 0.92, 0, 0, Math.PI*2);
        };

        // Multiply pass for depth
        applyClip(ctx, buildLips, s.lipColor, s.lipOpacity * 0.72, "multiply");
        // Overlay pass for vibrancy
        applyClip(ctx, buildLips, s.lipColor, s.lipOpacity * 0.45, "overlay");
        // Soft sheen
        applyClip(ctx, buildLips, "#ffffff", s.lipOpacity * 0.08, "screen");
      }

    } catch(e) {
      console.warn("MakeupEngine render:", e);
    }
  }, [canvasRef]);

  useEffect(() => { if(ready) render(); }, [ready]); // eslint-disable-line

  const update = useCallback((changes) => {
    Object.assign(stateRef.current, changes);
    render();
  }, [render]);

  return {
    ready, loading, error,
    applyLipstick:  (c,o) => update({ lipColor:c,     lipOpacity:o }),
    applyBlush:     (c,o) => update({ blushColor:c,   blushOpacity:o }),
    applyEyeshadow: (c,o) => update({ eyeColor:c,     eyeOpacity:o }),
    applyEyeliner:  (o)   => update({ eyelinerOpacity:o }),
    applyMascara:   (o)   => update({ mascaraOpacity:o }),
    applyContour:   (c,o) => update({ contourColor:c, contourOpacity:o }),
    applyHighlight: (o)   => update({ highlightOpacity:o }),
    reset:          ()    => { stateRef.current=mkState(); render(); },
  };
}
