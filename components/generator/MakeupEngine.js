"use client";
import { useEffect, useRef, useCallback, useState } from "react";

/**
 * MakeupEngine v2
 * Uses face-landmarks.json (normalized 0-1 coordinates detected from the mannequin)
 * to draw makeup zones directly as Canvas paths scaled to ANY canvas size.
 * No PNG masks. Scales perfectly on every screen and resolution.
 */

function hexToRgb(hex) {
  const h = (hex||"#ff0000").replace("#","");
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

/**
 * Draw a makeup zone as a soft filled shape on an offscreen canvas.
 * Returns the offscreen canvas to be composited with a blend mode.
 */
function buildZoneCanvas(zone, color, opacity, W, H) {
  const [r,g,b] = hexToRgb(color);
  const oc = document.createElement("canvas");
  oc.width = W; oc.height = H;
  const ctx = oc.getContext("2d");

  const blur = (zone.blur || 6) * (W / 1024); // scale blur with canvas size

  if (zone.type === "lips") {
    const cx   = zone.cx   * W;
    const midY = zone.midY * H;
    const topY = zone.topY * H;
    const botY = zone.botY * H;
    const rx   = zone.rx   * W;
    const upperRy = zone.upperRy * H;
    const lowerRy = zone.lowerRy * H;

    ctx.filter = `blur(${blur * 0.4}px)`;
    // Upper lip
    ctx.beginPath();
    ctx.ellipse(cx, midY - upperRy * 0.3, rx, upperRy * 1.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
    ctx.fill();
    // Lower lip
    ctx.beginPath();
    ctx.ellipse(cx, midY + lowerRy * 0.3, rx * 0.95, lowerRy * 1.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
    ctx.fill();
    ctx.filter = "none";

  } else if (zone.type === "ellipse") {
    const cx = zone.cx * W;
    const cy = zone.cy * H;
    const rx = zone.rx * W;
    const ry = zone.ry * H;

    // Use radial gradient for soft natural edges
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
    grad.addColorStop(0,   `rgba(${r},${g},${b},${opacity})`);
    grad.addColorStop(0.55,`rgba(${r},${g},${b},${opacity * 0.7})`);
    grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

    ctx.filter = `blur(${blur}px)`;
    ctx.save();
    ctx.scale(1, ry / rx); // squash to ellipse
    ctx.beginPath();
    ctx.arc(cx, cy * (rx / ry), rx, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
    ctx.filter = "none";
  }

  return oc;
}

/**
 * Composite a zone canvas onto the main ctx with blend mode.
 */
function composite(ctx, zoneCanvas, blendMode) {
  ctx.save();
  ctx.globalCompositeOperation = blendMode;
  ctx.globalAlpha = 1;
  ctx.drawImage(zoneCanvas, 0, 0);
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
  const faceRef   = useRef(null);
  const zonesRef  = useRef(null);
  const stateRef  = useRef(mkState());
  const readyRef  = useRef(false);

  const [loading, setLoading] = useState(true);
  const [ready,   setReady]   = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        // Load face image and zone data in parallel
        const [face, lmRes] = await Promise.all([
          loadImg("/faces/mannequin.png"),
          fetch("/face-landmarks.json").then(r => r.json()).catch(() => null),
        ]);

        if (!face) throw new Error("Could not load mannequin.png");
        if (!lmRes) throw new Error("Could not load face-landmarks.json");
        if (!alive) return;

        faceRef.current  = face;
        zonesRef.current = lmRes.zones;
        readyRef.current = true;
        setReady(true);
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        console.error("MakeupEngine:", e);
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
    const zones  = zonesRef.current;
    if (!canvas || !face || !zones || !readyRef.current) return;

    try {
      // Always render at native face resolution for max quality
      const W = face.naturalWidth  || 1024;
      const H = face.naturalHeight || 1536;
      canvas.width  = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      const s   = stateRef.current;

      // 1. Base face
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(face, 0, 0, W, H);

      // 2. Contour (multiply — darkens hollows naturally)
      if (s.contourOpacity > 0) {
        composite(ctx, buildZoneCanvas(zones.left_contour,  s.contourColor, s.contourOpacity * 0.7, W, H), "multiply");
        composite(ctx, buildZoneCanvas(zones.right_contour, s.contourColor, s.contourOpacity * 0.7, W, H), "multiply");
      }

      // 3. Blush (soft-light — warm natural flush)
      if (s.blushOpacity > 0) {
        composite(ctx, buildZoneCanvas(zones.left_blush,  s.blushColor, s.blushOpacity * 0.8, W, H), "soft-light");
        composite(ctx, buildZoneCanvas(zones.right_blush, s.blushColor, s.blushOpacity * 0.8, W, H), "soft-light");
      }

      // 4. Eyeshadow (multiply for depth + overlay for colour)
      if (s.eyeOpacity > 0) {
        composite(ctx, buildZoneCanvas(zones.left_eyeshadow,  s.eyeColor, s.eyeOpacity * 0.75, W, H), "multiply");
        composite(ctx, buildZoneCanvas(zones.right_eyeshadow, s.eyeColor, s.eyeOpacity * 0.75, W, H), "multiply");
        composite(ctx, buildZoneCanvas(zones.left_eyeshadow,  s.eyeColor, s.eyeOpacity * 0.35, W, H), "overlay");
        composite(ctx, buildZoneCanvas(zones.right_eyeshadow, s.eyeColor, s.eyeOpacity * 0.35, W, H), "overlay");
      }

      // 5. Eyeliner (multiply, precise)
      if (s.eyelinerOpacity > 0) {
        composite(ctx, buildZoneCanvas(zones.left_eyeliner,  "#0a0305", s.eyelinerOpacity * 0.9, W, H), "multiply");
        composite(ctx, buildZoneCanvas(zones.right_eyeliner, "#0a0305", s.eyelinerOpacity * 0.9, W, H), "multiply");
      }

      // 6. Mascara (multiply, lash line)
      if (s.mascaraOpacity > 0) {
        composite(ctx, buildZoneCanvas(zones.left_mascara,  "#060102", s.mascaraOpacity * 0.85, W, H), "multiply");
        composite(ctx, buildZoneCanvas(zones.right_mascara, "#060102", s.mascaraOpacity * 0.85, W, H), "multiply");
      }

      // 7. Highlight (screen — brightens cheekbones)
      if (s.highlightOpacity > 0) {
        composite(ctx, buildZoneCanvas(zones.left_highlight,  "#f8e8c0", s.highlightOpacity * 0.7, W, H), "screen");
        composite(ctx, buildZoneCanvas(zones.right_highlight, "#f8e8c0", s.highlightOpacity * 0.7, W, H), "screen");
        composite(ctx, buildZoneCanvas(zones.nose_highlight,  "#f8f0d8", s.highlightOpacity * 0.5, W, H), "screen");
      }

      // 8. Lips (multiply + overlay + screen sheen — triple pass for depth)
      if (s.lipOpacity > 0) {
        composite(ctx, buildZoneCanvas(zones.lips, s.lipColor, s.lipOpacity * 0.70, W, H), "multiply");
        composite(ctx, buildZoneCanvas(zones.lips, s.lipColor, s.lipOpacity * 0.50, W, H), "overlay");
        composite(ctx, buildZoneCanvas(zones.lips, "#ffffff",  s.lipOpacity * 0.10, W, H), "screen");
      }

    } catch (e) {
      console.warn("MakeupEngine render error:", e);
    }
  }, [canvasRef]);

  // Render once assets load
  useEffect(() => { if (ready) render(); }, [ready]); // eslint-disable-line

  const update = useCallback((changes) => {
    Object.assign(stateRef.current, changes);
    render();
  }, [render]);

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
