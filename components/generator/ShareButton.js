"use client";

import { useState } from "react";

/**
 * Generates a shareable PNG card using the Canvas API.
 * No external dependencies — pure browser Canvas.
 */

function hexToRgb(hex) {
  const h = (hex || "#e3d5c5").replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) || 200,
    g: parseInt(h.slice(2, 4), 16) || 160,
    b: parseInt(h.slice(4, 6), 16) || 130,
  };
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function generateCard(look) {
  const W = 800, H = 480;
  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const { trendName, moodDesc, aesthetic = [], palette = {}, occasion, intensity } = look;
  const skinCol  = palette.skin      || "#f5e6d3";
  const blushCol = palette.blush     || "#f09080";
  const eyeCol   = palette.eye       || "#b87aaa";
  const lipCol   = palette.lip       || "#c05060";
  const hlCol    = palette.highlight || "#f0d890";
  const brnzCol  = palette.bronze    || "#b08040";

  // ── Background gradient ───────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#fdfaf8");
  bgGrad.addColorStop(1, skinCol + "44");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Left colour panel (palette strip) ────────────────────────────────
  const panelW = 200;
  const colours = [skinCol, blushCol, eyeCol, lipCol, brnzCol, hlCol];
  const sliceH  = H / colours.length;
  colours.forEach((col, i) => {
    const grad = ctx.createLinearGradient(0, 0, panelW, 0);
    grad.addColorStop(0, col);
    grad.addColorStop(1, col + "CC");
    ctx.fillStyle = grad;
    ctx.fillRect(0, i * sliceH, panelW, sliceH + 1);
  });

  // Fade edge of panel
  const fadeGrad = ctx.createLinearGradient(panelW - 60, 0, panelW, 0);
  fadeGrad.addColorStop(0, "rgba(253,250,248,0)");
  fadeGrad.addColorStop(1, "#fdfaf8");
  ctx.fillStyle = fadeGrad;
  ctx.fillRect(panelW - 60, 0, 60, H);

  // ── Watermark text (left panel zone labels) ───────────────────────────
  const zoneLabels = ["SKIN","BLUSH","EYE","LIP","BRONZE","HIGHLIGHT"];
  ctx.font = "bold 10px 'DM Sans', sans-serif";
  colours.forEach((col, i) => {
    const fg = luminance(col) > 0.55 ? "rgba(77,60,40,0.7)" : "rgba(255,255,255,0.7)";
    ctx.fillStyle = fg;
    ctx.fillText(zoneLabels[i], 14, i * sliceH + sliceH / 2 + 4);
  });

  // ── Right content area ────────────────────────────────────────────────
  const cx = panelW + 32;
  const cw = W - cx - 32;

  // Brand / app name
  ctx.font = "600 11px 'DM Sans', sans-serif";
  ctx.fillStyle = "#a88c65";
  ctx.letterSpacing = "2px";
  ctx.fillText("✦  LUMIÈRE", cx, 44);
  ctx.letterSpacing = "0px";

  // Trend name
  ctx.font = "bold 44px 'Playfair Display', Georgia, serif";
  ctx.fillStyle = "#4d3c28";
  ctx.fillText(trendName || "My Look", cx, 100);

  // Divider
  ctx.strokeStyle = lipCol + "80";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, 116);
  ctx.lineTo(cx + cw * 0.6, 116);
  ctx.stroke();

  // Mood desc
  ctx.font = "italic 15px 'Playfair Display', Georgia, serif";
  ctx.fillStyle = "#8f7252";
  const maxLineW = cw - 20;
  // Simple word wrap
  const words   = (moodDesc || "").split(" ");
  let line      = "", lineY = 143;
  words.forEach(word => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxLineW && line) {
      ctx.fillText(line, cx, lineY);
      line  = word;
      lineY += 22;
    } else {
      line = test;
    }
  });
  if (line) ctx.fillText(line, cx, lineY);

  // Aesthetic tags
  ctx.font = "bold 11px 'DM Sans', sans-serif";
  let tagX = cx;
  aesthetic.slice(0, 4).forEach(tag => {
    const tw   = ctx.measureText(tag).width + 24;
    const tagY = lineY + 26;
    ctx.fillStyle = lipCol + "22";
    drawRoundRect(ctx, tagX, tagY, tw, 24, 12);
    ctx.fill();
    ctx.strokeStyle = lipCol + "55";
    ctx.lineWidth   = 1;
    ctx.stroke();
    ctx.fillStyle   = lipCol;
    ctx.fillText(tag, tagX + 12, tagY + 16);
    tagX += tw + 8;
  });

  // Occasion + intensity chips
  const chipY = lineY + 68;
  [occasion, intensity?.label || intensity].filter(Boolean).forEach((txt, i) => {
    const tw = ctx.measureText(txt).width + 20;
    const cx2 = cx + i * (tw + 10);
    ctx.fillStyle = "#f2ece5";
    drawRoundRect(ctx, cx2, chipY, tw, 22, 11);
    ctx.fill();
    ctx.font      = "500 10px 'DM Sans', sans-serif";
    ctx.fillStyle = "#8f7252";
    ctx.fillText(txt, cx2 + 10, chipY + 15);
  });

  // ── Colour circles ────────────────────────────────────────────────────
  const circY  = H - 90;
  const circles = [
    { col: skinCol,  label: "Base",      r: 22 },
    { col: blushCol, label: "Blush",     r: 22 },
    { col: eyeCol,   label: "Eye",       r: 22 },
    { col: lipCol,   label: "Lip",       r: 22 },
    { col: hlCol,    label: "Highlight", r: 16 },
  ];
  let circX = cx;
  circles.forEach(({ col, label, r }) => {
    // Circle
    ctx.beginPath();
    ctx.arc(circX + r, circY, r, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth   = 2.5;
    ctx.stroke();
    // Label
    ctx.font      = "500 9px 'DM Sans', sans-serif";
    ctx.fillStyle = "#a88c65";
    ctx.textAlign = "center";
    ctx.fillText(label, circX + r, circY + r + 14);
    ctx.textAlign = "left";
    circX += r * 2 + 18;
  });

  // ── Footer ────────────────────────────────────────────────────────────
  ctx.font      = "500 10px 'DM Sans', sans-serif";
  ctx.fillStyle = "#c4a882";
  ctx.fillText("lumiere.app  ·  Your AI Makeup Studio", cx, H - 16);

  return canvas;
}

export default function ShareButton({ look }) {
  const [generating, setGenerating] = useState(false);
  const [done,       setDone]       = useState(false);

  async function handleShare() {
    if (!look) return;
    setGenerating(true);
    try {
      await document.fonts.ready;
      const canvas = generateCard(look);

      // Try Web Share API (mobile)
      if (navigator.share && navigator.canShare) {
        canvas.toBlob(async blob => {
          const file = new File([blob], "lumiere-look.png", { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `My ${look.trendName || "Makeup"} Look`,
              text:  look.moodDesc || "Check out my Lumière look!",
              files: [file],
            });
          } else {
            download(canvas);
          }
        }, "image/png");
      } else {
        download(canvas);
      }

      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch (err) {
      if (err.name !== "AbortError") console.error("Share failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  function download(canvas) {
    const a = document.createElement("a");
    a.download = "lumiere-look.png";
    a.href = canvas.toDataURL("image/png", 0.95);
    a.click();
  }

  return (
    <button
      onClick={handleShare}
      disabled={generating || !look}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold
                  font-sans cursor-pointer transition-all duration-200 border
        ${done
          ? "bg-green-50 border-green-200 text-green-600"
          : "bg-white border-nude-200 text-nude-600 hover:border-rose-300 hover:text-rose-600"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      title="Save as image"
    >
      {generating ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20"/>
        </svg>
      ) : done ? (
        <span>✓</span>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      )}
      {done ? "Saved!" : "Save as Image"}
    </button>
  );
}
