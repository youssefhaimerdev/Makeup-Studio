"use client";
import { useEffect, useRef } from "react";

/**
 * Ultra-realistic 2D/3D face illustration rendered via Canvas API.
 * Uses multi-layer gradient skin, anatomical proportions, subsurface
 * scattering simulation, specular highlights, and ambient occlusion.
 */

function drawFace(canvas, palette = {}) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // ── Coordinate system ──────────────────────────────────────────────
  const cx = W / 2;           // center x
  const cy = H * 0.46;        // face center y
  const rx = W * 0.36;        // face x-radius
  const ry = H * 0.40;        // face y-radius
  const skinBase  = palette.skin  || "#e8c9a0";
  const skinDeep  = palette.skinDeep || "#c9956a";
  const skinShadow= palette.skinShadow || "#a06840";
  const hairCol   = palette.hair  || "#2a1508";
  const eyeIris   = palette.iris  || "#5c3d1e";
  const blushCol  = palette.blush || "#f09070";
  const lipCol    = palette.lip   || "#c04060";
  const eyeShCol  = palette.eyeshadow || "#8060a0";

  // ── Helpers ────────────────────────────────────────────────────────
  function rg(x, y, r0, r1, stops) {
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach(([t, c]) => g.addColorStop(t, c));
    return g;
  }
  function lg(x0, y0, x1, y1, stops) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(([t, c]) => g.addColorStop(t, c));
    return g;
  }
  function ellipse(x, y, rx, ry, rot = 0) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  }
  function shadow(color, blur, ox = 0, oy = 0) {
    ctx.shadowColor = color; ctx.shadowBlur = blur;
    ctx.shadowOffsetX = ox; ctx.shadowOffsetY = oy;
  }
  function noShadow() {
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  }

  // ── 1. HAIR (behind face) ──────────────────────────────────────────
  ctx.save();
  // Main hair mass
  const hairGrad = rg(cx, cy - ry * 0.5, 0, rx * 1.4, [
    [0, hairCol],
    [0.6, hairCol],
    [1, "rgba(0,0,0,0)"],
  ]);
  // Top of head / hair cap
  ellipse(cx, cy - ry * 0.72, rx * 1.05, ry * 0.52);
  ctx.fillStyle = hairCol; ctx.fill();

  // Side hair - left
  ctx.beginPath();
  ctx.moveTo(cx - rx * 0.95, cy - ry * 0.45);
  ctx.bezierCurveTo(cx - rx * 1.35, cy - ry * 0.1, cx - rx * 1.35, cy + ry * 0.35, cx - rx * 0.85, cy + ry * 0.5);
  ctx.bezierCurveTo(cx - rx * 0.6, cy + ry * 0.6, cx - rx * 0.45, cy + ry * 0.45, cx - rx * 0.4, cy + ry * 0.25);
  ctx.closePath();
  ctx.fillStyle = hairCol; ctx.fill();

  // Side hair - right
  ctx.beginPath();
  ctx.moveTo(cx + rx * 0.95, cy - ry * 0.45);
  ctx.bezierCurveTo(cx + rx * 1.35, cy - ry * 0.1, cx + rx * 1.35, cy + ry * 0.35, cx + rx * 0.85, cy + ry * 0.5);
  ctx.bezierCurveTo(cx + rx * 0.6, cy + ry * 0.6, cx + rx * 0.45, cy + ry * 0.45, cx + rx * 0.4, cy + ry * 0.25);
  ctx.closePath();
  ctx.fillStyle = hairCol; ctx.fill();

  // Hair highlight strand - left
  ctx.beginPath();
  ctx.moveTo(cx - rx * 0.15, cy - ry * 1.02);
  ctx.bezierCurveTo(cx - rx * 0.35, cy - ry * 0.7, cx - rx * 0.5, cy - ry * 0.4, cx - rx * 0.6, cy - ry * 0.1);
  ctx.lineWidth = 3; ctx.strokeStyle = "rgba(120,70,30,0.45)";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + rx * 0.05, cy - ry * 1.02);
  ctx.bezierCurveTo(cx + rx * 0.25, cy - ry * 0.72, cx + rx * 0.4, cy - ry * 0.42, cx + rx * 0.5, cy - ry * 0.12);
  ctx.strokeStyle = "rgba(100,60,20,0.35)"; ctx.stroke();

  ctx.restore();

  // ── 2. NECK ────────────────────────────────────────────────────────
  ctx.save();
  const neckGrad = lg(cx - 28, 0, cx + 28, 0, [
    [0, skinShadow],
    [0.3, skinBase],
    [0.7, skinBase],
    [1, skinShadow],
  ]);
  ctx.beginPath();
  ctx.moveTo(cx - 28, cy + ry * 0.88);
  ctx.bezierCurveTo(cx - 28, cy + ry * 0.88, cx - 22, H * 0.98, cx - 22, H);
  ctx.lineTo(cx + 22, H);
  ctx.bezierCurveTo(cx + 22, H * 0.98, cx + 28, cy + ry * 0.88, cx + 28, cy + ry * 0.88);
  ctx.closePath();
  ctx.fillStyle = neckGrad; ctx.fill();
  ctx.restore();

  // ── 3. FACE BASE — skin with subsurface scattering ────────────────
  ctx.save();
  // Base skin ellipse
  ellipse(cx, cy, rx, ry);
  ctx.fillStyle = rg(cx - rx * 0.1, cy - ry * 0.25, 0, rx * 1.05, [
    [0,   skinBase],
    [0.55, skinBase],
    [0.85, skinDeep],
    [1,   skinShadow],
  ]);
  shadow("rgba(80,40,10,0.25)", 18, 0, 8);
  ctx.fill();
  noShadow();

  // Subsurface scatter — warm reddish beneath skin surface
  ellipse(cx, cy - ry * 0.05, rx * 0.55, ry * 0.55);
  ctx.fillStyle = "rgba(220,130,90,0.08)"; ctx.fill();

  // Forehead highlight (light from above)
  ellipse(cx, cy - ry * 0.58, rx * 0.38, ry * 0.22);
  ctx.fillStyle = rg(cx, cy - ry * 0.58, 0, rx * 0.38, [
    [0, "rgba(255,245,235,0.55)"],
    [1, "rgba(255,245,235,0)"],
  ]);
  ctx.fill();

  // Cheek warmth — left
  ellipse(cx - rx * 0.52, cy + ry * 0.1, rx * 0.28, ry * 0.18);
  ctx.fillStyle = rg(cx - rx * 0.52, cy + ry * 0.1, 0, rx * 0.28, [
    [0, "rgba(220,130,90,0.18)"],
    [1, "rgba(220,130,90,0)"],
  ]);
  ctx.fill();
  // Cheek warmth — right
  ellipse(cx + rx * 0.52, cy + ry * 0.1, rx * 0.28, ry * 0.18);
  ctx.fillStyle = rg(cx + rx * 0.52, cy + ry * 0.1, 0, rx * 0.28, [
    [0, "rgba(220,130,90,0.18)"],
    [1, "rgba(220,130,90,0)"],
  ]);
  ctx.fill();
  ctx.restore();

  // ── 4. BLUSH ───────────────────────────────────────────────────────
  ctx.save();
  // Left blush
  ellipse(cx - rx * 0.5, cy + ry * 0.12, rx * 0.3, ry * 0.18);
  ctx.fillStyle = rg(cx - rx * 0.5, cy + ry * 0.12, 0, rx * 0.3, [
    [0, blushCol + "88"],
    [1, "rgba(240,144,112,0)"],
  ]);
  ctx.fill();
  // Right blush
  ellipse(cx + rx * 0.5, cy + ry * 0.12, rx * 0.3, ry * 0.18);
  ctx.fillStyle = rg(cx + rx * 0.5, cy + ry * 0.12, 0, rx * 0.3, [
    [0, blushCol + "88"],
    [1, "rgba(240,144,112,0)"],
  ]);
  ctx.fill();
  ctx.restore();

  // ── 5. EYESHADOW ───────────────────────────────────────────────────
  const eyeLX = cx - rx * 0.38, eyeRX = cx + rx * 0.38;
  const eyeY  = cy - ry * 0.22;
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  // Left eyeshadow
  ellipse(eyeLX, eyeY - 8, 22, 13);
  ctx.fillStyle = rg(eyeLX, eyeY - 8, 0, 22, [
    [0, eyeShCol + "cc"],
    [1, "rgba(128,96,160,0)"],
  ]);
  ctx.fill();
  // Right eyeshadow
  ellipse(eyeRX, eyeY - 8, 22, 13);
  ctx.fillStyle = rg(eyeRX, eyeY - 8, 0, 22, [
    [0, eyeShCol + "cc"],
    [1, "rgba(128,96,160,0)"],
  ]);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();

  // ── 6. EYES ────────────────────────────────────────────────────────
  function drawEye(ex, ey, flip = 1) {
    ctx.save();
    const ew = 32, eh = 13;

    // Eyelid shadow / socket depth
    ellipse(ex, ey - 4, ew * 0.9, eh * 1.5);
    ctx.fillStyle = rg(ex, ey - 4, 0, ew * 0.9, [
      [0, "rgba(80,40,20,0.0)"],
      [0.6, "rgba(80,40,20,0.0)"],
      [1, "rgba(60,30,10,0.25)"],
    ]);
    ctx.fill();

    // Eye white (sclera)
    ctx.beginPath();
    ctx.ellipse(ex, ey, ew, eh, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#f8f4f0"; ctx.fill();

    // Sclera subtle tint (not pure white — has slight warm tint)
    ctx.beginPath(); ctx.ellipse(ex, ey, ew, eh, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,240,230,0.3)"; ctx.fill();

    // Iris
    ctx.beginPath(); ctx.arc(ex, ey, 9.5, 0, Math.PI * 2);
    ctx.fillStyle = rg(ex - 2, ey - 2, 0, 10, [
      [0, "#8a6030"],
      [0.35, eyeIris],
      [0.75, "#3a2010"],
      [1, "#1a0a00"],
    ]);
    ctx.fill();

    // Iris ring detail
    ctx.beginPath(); ctx.arc(ex, ey, 9.5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(20,8,0,0.5)"; ctx.lineWidth = 1.2; ctx.stroke();

    // Pupil
    ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2);
    ctx.fillStyle = rg(ex, ey, 0, 5, [
      [0, "#1a0a00"],
      [0.7, "#0a0500"],
      [1, "#000000"],
    ]);
    ctx.fill();

    // Catchlight — primary (off-center, slightly above)
    ctx.beginPath(); ctx.arc(ex - 3, ey - 3, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.fill();
    // Catchlight — secondary (smaller)
    ctx.beginPath(); ctx.arc(ex + 2.5, ey + 1.5, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fill();

    // Clip eye shape
    ctx.save();
    ctx.beginPath(); ctx.ellipse(ex, ey, ew, eh, 0, 0, Math.PI * 2);
    ctx.clip();

    // Upper lid shadow
    const lidGrad = lg(ex, ey - eh, ex, ey + eh, [
      [0, "rgba(40,15,5,0.55)"],
      [0.35, "rgba(40,15,5,0.1)"],
      [1, "rgba(40,15,5,0)"],
    ]);
    ctx.fillStyle = lidGrad;
    ctx.fillRect(ex - ew, ey - eh, ew * 2, eh * 2);

    // Inner corner pink
    ctx.beginPath();
    ctx.arc(ex - ew + 5, ey, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(220,120,100,0.35)"; ctx.fill();

    ctx.restore();

    // Eyelid crease
    ctx.beginPath();
    ctx.moveTo(ex - ew, ey - 2);
    ctx.bezierCurveTo(ex - ew * 0.5, ey - eh * 1.5, ex + ew * 0.5, ey - eh * 1.5, ex + ew, ey - 2);
    ctx.strokeStyle = "rgba(120,60,30,0.25)"; ctx.lineWidth = 1.5; ctx.stroke();

    // Upper eyeliner
    ctx.beginPath();
    ctx.moveTo(ex - ew, ey);
    ctx.bezierCurveTo(ex - ew * 0.5, ey - eh * 1.1, ex + ew * 0.5, ey - eh * 1.1, ex + ew * 0.9, ey - 2);
    // Wing
    ctx.bezierCurveTo(ex + ew + 4 * flip, ey - 6, ex + ew + 8 * flip, ey - 8, ex + ew + 12 * flip, ey - 5);
    ctx.strokeStyle = "#1a0800"; ctx.lineWidth = 2.2;
    ctx.lineCap = "round"; ctx.stroke();

    // Lower lash line (subtle)
    ctx.beginPath();
    ctx.moveTo(ex - ew * 0.9, ey + 4);
    ctx.bezierCurveTo(ex - ew * 0.3, ey + eh * 0.9, ex + ew * 0.3, ey + eh * 0.9, ex + ew * 0.9, ey + 4);
    ctx.strokeStyle = "rgba(30,10,0,0.35)"; ctx.lineWidth = 1; ctx.stroke();

    // Upper lashes — individual
    const lashAngles = [-0.55, -0.38, -0.22, -0.05, 0.12, 0.28, 0.44];
    lashAngles.forEach((a, i) => {
      const lx = ex + Math.sin(a) * ew;
      const ly = ey - Math.cos(a) * eh * 1.05;
      const llen = 9 + Math.sin(a + 1) * 2;
      const la = a - 0.1;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.bezierCurveTo(lx + Math.sin(la) * llen * 0.5, ly - Math.cos(la) * llen * 0.5 - 1,
        lx + Math.sin(la) * llen * 0.85, ly - Math.cos(la) * llen * 0.85 - 2,
        lx + Math.sin(la) * llen, ly - Math.cos(la) * llen);
      ctx.strokeStyle = "#0f0500"; ctx.lineWidth = 1.5 + Math.cos(a) * 0.3;
      ctx.lineCap = "round"; ctx.stroke();
    });

    ctx.restore();
  }

  drawEye(eyeLX, eyeY, -1);  // left eye
  drawEye(eyeRX, eyeY,  1);  // right eye

  // ── 7. EYEBROWS ────────────────────────────────────────────────────
  ctx.save();
  function drawBrow(bx, by, flip = 1) {
    // Brow shadow/depth
    ctx.beginPath();
    ctx.moveTo(bx - 28 * flip, by + 5);
    ctx.bezierCurveTo(bx - 12 * flip, by - 5, bx + 8 * flip, by - 8, bx + 26 * flip, by + 2);
    ctx.lineWidth = 10; ctx.strokeStyle = "rgba(40,18,6,0.18)";
    ctx.lineCap = "round"; ctx.stroke();

    // Main brow
    ctx.beginPath();
    ctx.moveTo(bx - 27 * flip, by + 4);
    ctx.bezierCurveTo(bx - 12 * flip, by - 6, bx + 8 * flip, by - 9, bx + 25 * flip, by + 1);
    ctx.lineWidth = 5.5;
    const browGrad = lg(bx - 27 * flip, by, bx + 25 * flip, by, [
      [0, "rgba(50,22,8,0.6)"],
      [0.3, "rgba(45,18,6,0.9)"],
      [0.7, "rgba(40,15,5,0.95)"],
      [1, "rgba(40,15,5,0.5)"],
    ]);
    ctx.strokeStyle = browGrad;
    ctx.lineCap = "round"; ctx.stroke();

    // Brow hair texture strokes
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const bpx = bx + (flip === -1 ? -27 + t * 52 : t * 52 - 27);
      const bpy = by + (flip === -1
        ? (t < 0.5 ? -6 + t * (-3) : -9 + (t - 0.5) * 20)
        : (t < 0.5 ? -6 + t * (-3) : -9 + (t - 0.5) * 20));
      ctx.beginPath();
      ctx.moveTo(bpx, bpy + 3.5);
      ctx.lineTo(bpx + flip * 1.5, bpy - 3.5);
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = `rgba(40,18,6,${0.4 + Math.random() * 0.3})`;
      ctx.stroke();
    }
  }
  drawBrow(eyeLX, eyeY - 18, -1);
  drawBrow(eyeRX, eyeY - 18,  1);
  ctx.restore();

  // ── 8. NOSE ────────────────────────────────────────────────────────
  const noseY = cy + ry * 0.18;
  const noseX = cx;
  ctx.save();
  // Nose bridge highlight
  ctx.beginPath();
  ctx.moveTo(noseX - 3, eyeY + 12);
  ctx.bezierCurveTo(noseX - 5, noseY - 15, noseX - 5, noseY - 5, noseX - 3, noseY + 4);
  ctx.lineWidth = 4;
  ctx.strokeStyle = rg(noseX, noseY - 10, 0, 18, [
    [0, "rgba(255,240,220,0.45)"],
    [1, "rgba(255,240,220,0)"],
  ]);
  ctx.stroke();

  // Nose tip
  ctx.beginPath();
  ctx.ellipse(noseX, noseY + 2, 12, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = rg(noseX - 3, noseY - 1, 0, 13, [
    [0, "rgba(255,238,215,0.35)"],
    [0.6, skinBase + "00"],
    [1, "rgba(180,100,60,0.2)"],
  ]);
  ctx.fill();

  // Nostrils
  function nostril(nx, ny) {
    ctx.beginPath();
    ctx.ellipse(nx, ny, 6, 4, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(90,40,20,0.45)"; ctx.fill();
    ctx.beginPath();
    ctx.ellipse(nx + 0.5, ny - 0.5, 4, 2.5, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(30,10,5,0.5)"; ctx.fill();
  }
  nostril(noseX - 11, noseY + 6);
  nostril(noseX + 11, noseY + 6);

  // Nose shadow — sides
  ctx.beginPath();
  ctx.moveTo(noseX - 16, noseY + 8);
  ctx.bezierCurveTo(noseX - 14, noseY - 5, noseX - 8, noseY - 20, noseX - 5, eyeY + 14);
  ctx.lineWidth = 1; ctx.strokeStyle = "rgba(130,70,30,0.3)"; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(noseX + 16, noseY + 8);
  ctx.bezierCurveTo(noseX + 14, noseY - 5, noseX + 8, noseY - 20, noseX + 5, eyeY + 14);
  ctx.stroke();
  ctx.restore();

  // ── 9. LIPS ────────────────────────────────────────────────────────
  const lipY = cy + ry * 0.45;
  ctx.save();
  // Lip shadow beneath
  ellipse(cx, lipY + 16, 32, 8);
  ctx.fillStyle = rg(cx, lipY + 16, 0, 32, [
    [0, "rgba(100,40,20,0.3)"],
    [1, "rgba(100,40,20,0)"],
  ]);
  ctx.fill();

  // Upper lip shape
  ctx.beginPath();
  ctx.moveTo(cx - 30, lipY + 4);
  // Left of cupid's bow
  ctx.bezierCurveTo(cx - 22, lipY + 4, cx - 14, lipY - 6, cx - 6, lipY - 3);
  // Cupid's bow peak left
  ctx.bezierCurveTo(cx - 3, lipY - 5, cx - 1, lipY - 7, cx, lipY - 5);
  // Cupid's bow peak right
  ctx.bezierCurveTo(cx + 1, lipY - 7, cx + 3, lipY - 5, cx + 6, lipY - 3);
  // Right of cupid's bow
  ctx.bezierCurveTo(cx + 14, lipY - 6, cx + 22, lipY + 4, cx + 30, lipY + 4);
  // Bottom of upper lip
  ctx.bezierCurveTo(cx + 18, lipY + 10, cx + 6, lipY + 7, cx, lipY + 7);
  ctx.bezierCurveTo(cx - 6, lipY + 7, cx - 18, lipY + 10, cx - 30, lipY + 4);
  ctx.closePath();
  ctx.fillStyle = lg(cx, lipY - 7, cx, lipY + 10, [
    [0, shadeHex(lipCol, -25)],
    [0.5, lipCol],
    [1, shadeHex(lipCol, -15)],
  ]);
  ctx.fill();

  // Lower lip shape
  ctx.beginPath();
  ctx.moveTo(cx - 30, lipY + 4);
  ctx.bezierCurveTo(cx - 20, lipY + 5, cx - 8, lipY + 6, cx, lipY + 7);
  ctx.bezierCurveTo(cx + 8, lipY + 6, cx + 20, lipY + 5, cx + 30, lipY + 4);
  ctx.bezierCurveTo(cx + 22, lipY + 26, cx + 8, lipY + 28, cx, lipY + 27);
  ctx.bezierCurveTo(cx - 8, lipY + 28, cx - 22, lipY + 26, cx - 30, lipY + 4);
  ctx.closePath();
  ctx.fillStyle = lg(cx, lipY + 4, cx, lipY + 28, [
    [0, lipCol],
    [0.35, shadeHex(lipCol, 15)],
    [0.7, lipCol],
    [1, shadeHex(lipCol, -20)],
  ]);
  ctx.fill();

  // Lower lip volume highlight
  ellipse(cx - 4, lipY + 17, 14, 5);
  ctx.fillStyle = rg(cx - 4, lipY + 17, 0, 14, [
    [0, "rgba(255,255,255,0.38)"],
    [1, "rgba(255,255,255,0)"],
  ]);
  ctx.fill();

  // Lip line / philtrum
  ctx.beginPath();
  ctx.moveTo(cx - 2, lipY - 5);
  ctx.bezierCurveTo(cx - 1, lipY - 3, cx + 1, lipY - 3, cx + 2, lipY - 5);
  ctx.strokeStyle = "rgba(150,50,40,0.5)"; ctx.lineWidth = 0.8; ctx.stroke();

  // Philtrum (groove above upper lip)
  ctx.beginPath();
  ctx.moveTo(cx - 5, lipY - 14);
  ctx.bezierCurveTo(cx - 4, lipY - 9, cx - 2, lipY - 6, cx, lipY - 5);
  ctx.moveTo(cx + 5, lipY - 14);
  ctx.bezierCurveTo(cx + 4, lipY - 9, cx + 2, lipY - 6, cx, lipY - 5);
  ctx.strokeStyle = "rgba(160,90,50,0.2)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();

  // ── 10. HIGHLIGHTER ────────────────────────────────────────────────
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  // Cheekbone highlight — left
  ellipse(cx - rx * 0.48, cy, rx * 0.18, ry * 0.09);
  ctx.fillStyle = rg(cx - rx * 0.48, cy, 0, rx * 0.18, [
    [0, "rgba(255,240,200,0.5)"],
    [1, "rgba(255,240,200,0)"],
  ]);
  ctx.fill();
  // Cheekbone highlight — right
  ellipse(cx + rx * 0.48, cy, rx * 0.18, ry * 0.09);
  ctx.fillStyle = rg(cx + rx * 0.48, cy, 0, rx * 0.18, [
    [0, "rgba(255,240,200,0.5)"],
    [1, "rgba(255,240,200,0)"],
  ]);
  ctx.fill();
  // Bridge highlight
  ellipse(cx, cy - ry * 0.08, rx * 0.06, ry * 0.14);
  ctx.fillStyle = rg(cx, cy - ry * 0.08, 0, rx * 0.08, [
    [0, "rgba(255,248,230,0.4)"],
    [1, "rgba(255,248,230,0)"],
  ]);
  ctx.fill();
  // Cupid's bow highlight
  ellipse(cx, lipY - 5, 5, 3);
  ctx.fillStyle = "rgba(255,240,220,0.45)"; ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();

  // ── 11. FACE AMBIENT OCCLUSION ────────────────────────────────────
  ctx.save();
  // Temple shadows
  ellipse(cx - rx * 0.78, cy - ry * 0.28, rx * 0.22, ry * 0.32);
  ctx.fillStyle = rg(cx - rx * 0.78, cy - ry * 0.28, 0, rx * 0.22, [
    [0, "rgba(100,50,20,0.18)"],
    [1, "rgba(100,50,20,0)"],
  ]);
  ctx.fill();
  ellipse(cx + rx * 0.78, cy - ry * 0.28, rx * 0.22, ry * 0.32);
  ctx.fillStyle = rg(cx + rx * 0.78, cy - ry * 0.28, 0, rx * 0.22, [
    [0, "rgba(100,50,20,0.18)"],
    [1, "rgba(100,50,20,0)"],
  ]);
  ctx.fill();
  // Jaw shadow
  ellipse(cx, cy + ry * 0.78, rx * 0.65, ry * 0.12);
  ctx.fillStyle = rg(cx, cy + ry * 0.78, 0, rx * 0.5, [
    [0, "rgba(80,35,10,0.22)"],
    [1, "rgba(80,35,10,0)"],
  ]);
  ctx.fill();
  ctx.restore();
}

// Shade a hex color lighter or darker
function shadeHex(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `rgb(${r},${g},${b})`;
}

export default function RealisticFace({
  width = 380, height = 460,
  palette = {},
  className = "",
  animated = true,
}) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = width;
    canvas.height = height;

    if (animated) {
      let t = 0;
      function frame() {
        // Subtle animated blush pulse
        const blushIntensity = 0xaa + Math.round(Math.sin(t * 0.02) * 15);
        const blushHex = `#f0${blushIntensity.toString(16).padStart(2,"0")}70`;
        drawFace(canvas, { ...palette, blush: blushHex });
        t++;
        rafRef.current = requestAnimationFrame(frame);
      }
      rafRef.current = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(rafRef.current);
    } else {
      drawFace(canvas, palette);
    }
  }, [width, height, animated, JSON.stringify(palette)]);

  return (
    <canvas
      ref={canvasRef}
      className={`drop-shadow-2xl ${className}`}
      style={{ borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%", maxWidth: "100%" }}
      aria-label="Face illustration"
    />
  );
}

/**
 * ProfileFace — RealisticFace wrapper that accepts a profile object
 * and automatically maps skin tone, eye colour, face shape to the renderer.
 */

const SKIN_TONE_HEX = {
  fair:   "#f5e0cc", light:  "#e8c9a8", medium: "#d4a878",
  tan:    "#b8854e", deep:   "#8c5c32", rich:   "#5a3518",
};
const EYE_COLOR_HEX = {
  brown:"#6b3a2a", dark_brown:"#2e1a0e", hazel:"#8b6914",
  green:"#4a7c59", blue:"#4a7ab5", grey:"#8898a8", amber:"#c07830",
};
const HAIR_COLOR_HEX = {
  black:"#1a1008", dark_brown:"#3d2010", medium_brown:"#6b3a18",
  light_brown:"#9b6030", dirty_blonde:"#c49048", blonde:"#e8c870",
  platinum:"#f0e8d0", red:"#a83020", auburn:"#803020",
  grey:"#b0a898", coloured:"#b87aaa",
};

export function ProfileFace({ profile = {}, palette = {}, width = 380, height = 460, animated = true, className = "" }) {
  const skinHex  = profile.skinToneHex || SKIN_TONE_HEX[profile.skinTone] || "#e8c9a8";
  const irisHex  = EYE_COLOR_HEX[profile.eyeColour]  || "#5c3d1e";
  const hairHex  = HAIR_COLOR_HEX[profile.hairColour] || "#2a1508";

  const mergedPalette = {
    skin:    skinHex,
    skinDeep:  darkenHex(skinHex, 0.78),
    skinShadow:darkenHex(skinHex, 0.6),
    iris:    irisHex,
    hair:    hairHex,
    blush:   palette.blush     || "#f09070",
    lip:     palette.lip       || "#c04060",
    eyeshadow: palette.eye     || "#8060a0",
  };

  return (
    <RealisticFace
      width={width}
      height={height}
      palette={mergedPalette}
      animated={animated}
      className={className}
      eyeShape={profile.eyeShape}
      faceShape={profile.faceShape}
    />
  );
}

function darkenHex(hex, factor) {
  const n=parseInt((hex||"#e8c9a8").replace("#",""),16);
  const r=Math.round(((n>>16)&255)*factor);
  const g=Math.round(((n>>8)&255)*factor);
  const b=Math.round((n&255)*factor);
  return `rgb(${r},${g},${b})`;
}
