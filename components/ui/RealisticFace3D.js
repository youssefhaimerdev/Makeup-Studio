"use client";
import { useEffect, useRef } from "react";

/**
 * RealisticFace3D — Canvas 2D portrait illustration with correct facial proportions.
 * Eyes at 42% of face height. Proper skin gradients. Real hair depth. Volume lips.
 */

const SKIN_HEX = {
  fair:"#f5e0cc", light:"#e8c4a0", medium:"#d4a070",
  tan:"#c08050", deep:"#8c5830", rich:"#5a3018",
};
const EYE_HEX = {
  brown:"#7a4828", dark_brown:"#3a2010", hazel:"#8a6820",
  green:"#3a6848", blue:"#3a5888", grey:"#6878888", amber:"#b06828",
};
const HAIR_HEX = {
  black:"#100808", dark_brown:"#2a1408", medium_brown:"#5a2e10",
  light_brown:"#8a5020", dirty_blonde:"#c49048", blonde:"#d8a838",
  platinum:"#e8e0c8", red:"#902010", auburn:"#702818",
  grey:"#909088", coloured:"#6030a0",
};

function hexToRgb(h) {
  const n = parseInt((h||"#d4a070").replace("#",""),16);
  return [(n>>16)&255,(n>>8)&255,n&255];
}
function mixHex(h1,h2,t) {
  const [r1,g1,b1]=hexToRgb(h1),[r2,g2,b2]=hexToRgb(h2);
  return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`;
}
function lighten(h,f) { return mixHex(h,"#ffffff",f); }
function darken(h,f)  { return mixHex(h,"#000000",f); }

function render(canvas, opts) {
  const { skin, iris, hair, lip, blush } = opts;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);

  // ── COORDINATE SYSTEM ─────────────────────────────────────────────
  // Face oval — slightly wider than tall, realistic proportions
  const cx   = W * 0.5;
  const cy   = H * 0.46;    // face centre (slightly above canvas centre)
  const frx  = W * 0.34;    // face x-radius
  const fry  = H * 0.38;    // face y-radius

  // Feature Y positions (fraction of face height from top of face)
  const faceTop = cy - fry;
  const faceBot = cy + fry;
  const faceH   = faceBot - faceTop;

  const eyeY   = faceTop + faceH * 0.42;   // eyes at 42% down face
  const noseY  = faceTop + faceH * 0.63;   // nose tip at 63%
  const mouthY = faceTop + faceH * 0.77;   // mouth at 77%

  // Eye positions — each eye 1/5 of face width, separated by 1 eye-width
  const eyeW  = frx * 0.38;    // half-width of eye opening
  const eyeH  = eyeW * 0.38;   // eye height (realistic aspect ratio)
  const eyeLX = cx - frx * 0.35;
  const eyeRX = cx + frx * 0.35;

  // ── 1. HAIR (behind face) ──────────────────────────────────────────
  ctx.save();

  // Main hair cap
  const hairGrad = ctx.createRadialGradient(cx-frx*0.15, faceTop-fry*0.15, frx*0.1, cx, faceTop, frx*1.25);
  hairGrad.addColorStop(0, lighten(hair, 0.22));
  hairGrad.addColorStop(0.45, hair);
  hairGrad.addColorStop(1, darken(hair, 0.45));

  ctx.beginPath();
  ctx.ellipse(cx, cy - fry*0.12, frx*1.08, fry*1.05, 0, 0, Math.PI*2);
  ctx.fillStyle = hairGrad; ctx.fill();

  // Side hair left
  ctx.beginPath();
  ctx.moveTo(cx - frx*0.95, cy - fry*0.4);
  ctx.bezierCurveTo(cx-frx*1.42, cy-fry*0.05, cx-frx*1.38, cy+fry*0.42, cx-frx*0.88, cy+fry*0.62);
  ctx.bezierCurveTo(cx-frx*0.62, cy+fry*0.72, cx-frx*0.42, cy+fry*0.58, cx-frx*0.38, cy+fry*0.32);
  ctx.closePath();
  ctx.fillStyle = darken(hair, 0.08); ctx.fill();

  // Side hair right
  ctx.beginPath();
  ctx.moveTo(cx + frx*0.95, cy - fry*0.4);
  ctx.bezierCurveTo(cx+frx*1.42, cy-fry*0.05, cx+frx*1.38, cy+fry*0.42, cx+frx*0.88, cy+fry*0.62);
  ctx.bezierCurveTo(cx+frx*0.62, cy+fry*0.72, cx+frx*0.42, cy+fry*0.58, cx+frx*0.38, cy+fry*0.32);
  ctx.closePath();
  ctx.fillStyle = darken(hair, 0.08); ctx.fill();

  // Hair shine — specular highlight
  const shineGrad = ctx.createRadialGradient(cx - frx*0.22, faceTop - fry*0.18, 2, cx-frx*0.15, faceTop-fry*0.05, frx*0.52);
  shineGrad.addColorStop(0, `rgba(255,255,255,0.28)`);
  shineGrad.addColorStop(0.55, `rgba(255,255,255,0.06)`);
  shineGrad.addColorStop(1, `rgba(255,255,255,0)`);
  ctx.beginPath(); ctx.ellipse(cx-frx*0.15, faceTop+fry*0.08, frx*0.48, fry*0.32, -0.25, 0, Math.PI*2);
  ctx.fillStyle = shineGrad; ctx.fill();

  ctx.restore();

  // ── 2. NECK ────────────────────────────────────────────────────────
  ctx.save();
  const neckGrad = ctx.createLinearGradient(cx-22, 0, cx+22, 0);
  neckGrad.addColorStop(0, darken(skin,0.22)); neckGrad.addColorStop(0.3, skin);
  neckGrad.addColorStop(0.7, skin); neckGrad.addColorStop(1, darken(skin,0.22));
  ctx.beginPath(); ctx.moveTo(cx-22, faceBot-8); ctx.lineTo(cx-18, H); ctx.lineTo(cx+18, H); ctx.lineTo(cx+22, faceBot-8); ctx.closePath();
  ctx.fillStyle = neckGrad; ctx.fill();
  ctx.restore();

  // ── 3. FACE BASE ───────────────────────────────────────────────────
  ctx.save();
  // Drop shadow for depth
  ctx.shadowColor = "rgba(40,18,5,0.30)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12;
  ctx.beginPath(); ctx.ellipse(cx, cy, frx, fry, 0, 0, Math.PI*2);
  ctx.fillStyle = skin; ctx.fill();
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // Multi-stop radial skin gradient
  const skinGrad = ctx.createRadialGradient(cx-frx*0.08, cy-fry*0.28, frx*0.05, cx, cy+fry*0.08, frx*1.12);
  skinGrad.addColorStop(0,   lighten(skin, 0.12));
  skinGrad.addColorStop(0.38, skin);
  skinGrad.addColorStop(0.72, darken(skin, 0.10));
  skinGrad.addColorStop(1,   darken(skin, 0.32));
  ctx.beginPath(); ctx.ellipse(cx, cy, frx, fry, 0, 0, Math.PI*2);
  ctx.fillStyle = skinGrad; ctx.fill();
  ctx.restore();

  // Subsurface scatter — warm blush at cheeks (multiply blend)
  ctx.save(); ctx.globalCompositeOperation = "multiply";
  [[cx-frx*0.5, cy+fry*0.05],[cx+frx*0.5, cy+fry*0.05]].forEach(([bx,by])=>{
    const bg = ctx.createRadialGradient(bx,by,0,bx,by,frx*0.3);
    bg.addColorStop(0,"rgba(210,110,70,0.20)"); bg.addColorStop(1,"rgba(210,110,70,0)");
    ctx.beginPath(); ctx.ellipse(bx,by,frx*0.3,fry*0.2,0,0,Math.PI*2); ctx.fillStyle=bg; ctx.fill();
  });
  ctx.restore();

  // Forehead top-light
  const fhGrad = ctx.createRadialGradient(cx, faceTop+fry*0.18, 0, cx, faceTop+fry*0.22, frx*0.48);
  fhGrad.addColorStop(0,"rgba(255,248,236,0.55)"); fhGrad.addColorStop(1,"rgba(255,248,236,0)");
  ctx.beginPath(); ctx.ellipse(cx, faceTop+fry*0.2, frx*0.42, fry*0.22, 0, 0, Math.PI*2);
  ctx.fillStyle = fhGrad; ctx.fill();

  // Jaw AO shadow
  ctx.save(); ctx.globalCompositeOperation="multiply";
  const jawAO = ctx.createRadialGradient(cx, faceBot-fry*0.12, 0, cx, faceBot-fry*0.1, frx*0.72);
  jawAO.addColorStop(0,"rgba(70,30,10,0.18)"); jawAO.addColorStop(1,"rgba(70,30,10,0)");
  ctx.beginPath(); ctx.ellipse(cx, faceBot-fry*0.12, frx*0.72, fry*0.15, 0, 0, Math.PI*2);
  ctx.fillStyle=jawAO; ctx.fill();
  ctx.restore();

  // ── 4. BLUSH ────────────────────────────────────────────────────────
  [[cx-frx*0.52, cy+fry*0.08],[cx+frx*0.52, cy+fry*0.08]].forEach(([bx,by])=>{
    const bg = ctx.createRadialGradient(bx,by,0,bx,by,frx*0.32);
    bg.addColorStop(0,blush+"88"); bg.addColorStop(1,blush+"00");
    ctx.beginPath(); ctx.ellipse(bx,by,frx*0.32,fry*0.2,0,0,Math.PI*2); ctx.fillStyle=bg; ctx.fill();
  });

  // ── 5. EYES ─────────────────────────────────────────────────────────
  [eyeLX, eyeRX].forEach((ex, ei) => {
    const flip = ei === 0 ? -1 : 1;
    ctx.save();

    // Eye socket shadow
    const sockG = ctx.createRadialGradient(ex,eyeY-eyeH*0.6,0,ex,eyeY-eyeH*0.3,eyeW*0.95);
    sockG.addColorStop(0,"rgba(0,0,0,0)"); sockG.addColorStop(0.65,"rgba(0,0,0,0)"); sockG.addColorStop(1,`rgba(60,22,6,0.22)`);
    ctx.beginPath(); ctx.ellipse(ex,eyeY-eyeH*0.2,eyeW*0.95,eyeH*1.62,0,0,Math.PI*2); ctx.fillStyle=sockG; ctx.fill();

    // Eyeshadow (subtle)
    const esG = ctx.createRadialGradient(ex,eyeY-eyeH*0.8,0,ex,eyeY-eyeH*0.5,eyeW*0.85);
    esG.addColorStop(0,darken(iris,0.1)+"44"); esG.addColorStop(1,darken(iris,0.1)+"00");
    ctx.beginPath(); ctx.ellipse(ex,eyeY-eyeH*0.6,eyeW*0.8,eyeH*1.1,0,0,Math.PI*2); ctx.fillStyle=esG; ctx.fill();

    // Sclera
    ctx.beginPath(); ctx.ellipse(ex,eyeY,eyeW,eyeH,0,0,Math.PI*2);
    ctx.fillStyle = "#f9f5f2"; ctx.fill();
    // Sclera corner tints
    const scG = ctx.createLinearGradient(ex-eyeW,eyeY,ex+eyeW,eyeY);
    scG.addColorStop(0,"rgba(200,160,180,0.18)"); scG.addColorStop(0.5,"rgba(255,255,255,0)"); scG.addColorStop(1,"rgba(200,160,170,0.15)");
    ctx.beginPath(); ctx.ellipse(ex,eyeY,eyeW,eyeH,0,0,Math.PI*2); ctx.fillStyle=scG; ctx.fill();

    // Iris — proper multi-ring gradient
    const irisR = eyeH * 0.88;
    const irisG = ctx.createRadialGradient(ex-irisR*0.22,eyeY-irisR*0.22,irisR*0.04,ex,eyeY,irisR);
    irisG.addColorStop(0, lighten(iris,0.38));
    irisG.addColorStop(0.28, iris);
    irisG.addColorStop(0.62, darken(iris,0.22));
    irisG.addColorStop(0.85, darken(iris,0.40));
    irisG.addColorStop(1, darken(iris,0.55));
    ctx.beginPath(); ctx.arc(ex,eyeY,irisR,0,Math.PI*2); ctx.fillStyle=irisG; ctx.fill();

    // Limbal ring
    ctx.beginPath(); ctx.arc(ex,eyeY,irisR,0,Math.PI*2);
    ctx.strokeStyle=darken(iris,0.65); ctx.lineWidth=1.5; ctx.stroke();

    // Pupil
    const pupG = ctx.createRadialGradient(ex,eyeY,0,ex,eyeY,irisR*0.54);
    pupG.addColorStop(0,"#100500"); pupG.addColorStop(1,"#000000");
    ctx.beginPath(); ctx.arc(ex,eyeY,irisR*0.52,0,Math.PI*2); ctx.fillStyle=pupG; ctx.fill();

    // Primary catchlight (off-centre, bright)
    ctx.beginPath(); ctx.arc(ex-irisR*0.28,eyeY-irisR*0.28,irisR*0.22,0,Math.PI*2);
    ctx.fillStyle="rgba(255,255,255,0.92)"; ctx.fill();
    // Secondary catchlight (smaller, opposite)
    ctx.beginPath(); ctx.arc(ex+irisR*0.22,eyeY+irisR*0.18,irisR*0.1,0,Math.PI*2);
    ctx.fillStyle="rgba(255,255,255,0.48)"; ctx.fill();

    // Clip to eye shape for lid shadow overlay
    ctx.save();
    ctx.beginPath(); ctx.ellipse(ex,eyeY,eyeW,eyeH,0,0,Math.PI*2); ctx.clip();
    const lidG = ctx.createLinearGradient(ex,eyeY-eyeH,ex,eyeY+eyeH);
    lidG.addColorStop(0,"rgba(25,10,3,0.58)"); lidG.addColorStop(0.28,"rgba(25,10,3,0.1)"); lidG.addColorStop(1,"rgba(25,10,3,0)");
    ctx.fillStyle=lidG; ctx.fillRect(ex-eyeW,eyeY-eyeH,eyeW*2,eyeH*2);
    ctx.restore();

    // Eyelid crease
    ctx.beginPath(); ctx.moveTo(ex-eyeW,eyeY-eyeH*0.1);
    ctx.bezierCurveTo(ex-eyeW*0.5,eyeY-eyeH*1.55,ex+eyeW*0.5,eyeY-eyeH*1.55,ex+eyeW,eyeY-eyeH*0.1);
    ctx.strokeStyle=`rgba(100,45,18,0.20)`; ctx.lineWidth=1.8; ctx.stroke();

    // Upper eyeliner
    ctx.beginPath();
    ctx.moveTo(ex-eyeW, eyeY+eyeH*0.05);
    ctx.bezierCurveTo(ex-eyeW*0.4, eyeY-eyeH*1.12, ex+eyeW*0.4, eyeY-eyeH*1.12, ex+eyeW*0.9, eyeY-eyeH*0.08);
    // Wing flick
    ctx.bezierCurveTo(ex+eyeW*0.9+flip*5, eyeY-eyeH*0.5, ex+eyeW+flip*9, eyeY-eyeH*0.9, ex+eyeW+flip*13, eyeY-eyeH*0.6);
    ctx.strokeStyle="#0c0401"; ctx.lineWidth=2.5; ctx.lineCap="round"; ctx.stroke();

    // Lower lash line
    ctx.beginPath(); ctx.moveTo(ex-eyeW*0.9,eyeY+eyeH*0.55); ctx.bezierCurveTo(ex-eyeW*0.3,eyeY+eyeH*0.95,ex+eyeW*0.3,eyeY+eyeH*0.95,ex+eyeW*0.9,eyeY+eyeH*0.55);
    ctx.strokeStyle=`rgba(25,8,2,0.30)`; ctx.lineWidth=1; ctx.stroke();

    // Individual lashes — realistic bezier curves
    const lashCount = 9;
    for(let l=0;l<lashCount;l++){
      const t = (l/(lashCount-1)) - 0.5;
      const ang = t * Math.PI * 0.78;
      const lx = ex + Math.sin(ang)*eyeW;
      const ly = eyeY - Math.cos(ang)*eyeH*1.02;
      const llen = eyeH*(0.85+Math.abs(Math.sin(ang*1.5))*0.35);
      const la = ang - 0.06*flip;
      ctx.beginPath(); ctx.moveTo(lx,ly);
      ctx.bezierCurveTo(lx+Math.sin(la)*llen*0.42,ly-Math.cos(la)*llen*0.42,lx+Math.sin(la)*llen*0.78,ly-Math.cos(la)*llen*0.78-1.5,lx+Math.sin(la)*llen,ly-Math.cos(la)*llen);
      ctx.strokeStyle="#0a0300"; ctx.lineWidth=1.6+Math.cos(ang)*0.4; ctx.lineCap="round"; ctx.stroke();
    }

    ctx.restore();
  });

  // ── 6. EYEBROWS ─────────────────────────────────────────────────────
  [[-1,eyeLX],[1,eyeRX]].forEach(([flip,bx])=>{
    const by = eyeY - eyeH*2.0;
    // Depth shadow
    ctx.beginPath(); ctx.moveTo(bx-flip*eyeW*0.95,by+5); ctx.bezierCurveTo(bx-flip*eyeW*0.35,by-eyeH*0.9,bx+flip*eyeW*0.25,by-eyeH*1.05,bx+flip*eyeW*0.92,by+1);
    ctx.lineWidth=eyeH*1.4; ctx.strokeStyle="rgba(25,10,3,0.14)"; ctx.lineCap="round"; ctx.stroke();
    // Main brow
    const bGrad = ctx.createLinearGradient(bx-flip*eyeW*0.95,by,bx+flip*eyeW*0.92,by);
    bGrad.addColorStop(0,"rgba(35,14,4,0.52)"); bGrad.addColorStop(0.28,"rgba(32,12,3,0.92)"); bGrad.addColorStop(0.72,"rgba(30,10,2,0.96)"); bGrad.addColorStop(1,"rgba(30,10,2,0.40)");
    ctx.beginPath(); ctx.moveTo(bx-flip*eyeW*0.95,by+5); ctx.bezierCurveTo(bx-flip*eyeW*0.35,by-eyeH*0.9,bx+flip*eyeW*0.25,by-eyeH*1.05,bx+flip*eyeW*0.92,by+1);
    ctx.lineWidth=eyeH*0.68; ctx.strokeStyle=bGrad; ctx.lineCap="round"; ctx.stroke();
    // Hair texture
    for(let i=0;i<12;i++){
      const t=i/11, hx=bx+flip*(t-0.5)*eyeW*1.88, hy=by+(t<0.38?-t*eyeH*1.1:-eyeH*1.05+(t-0.38)*eyeH*1.8);
      ctx.beginPath(); ctx.moveTo(hx,hy+eyeH*0.35); ctx.lineTo(hx+flip*1.5,hy-eyeH*0.42);
      ctx.strokeStyle=`rgba(32,12,3,${0.3+Math.random()*0.35})`; ctx.lineWidth=0.85; ctx.stroke();
    }
  });

  // ── 7. NOSE ─────────────────────────────────────────────────────────
  // Bridge highlight
  const nhGrad = ctx.createLinearGradient(cx-3,eyeY+eyeH*1.5,cx+3,noseY+5);
  nhGrad.addColorStop(0,"rgba(255,245,228,0.52)"); nhGrad.addColorStop(1,"rgba(255,245,228,0)");
  ctx.beginPath(); ctx.moveTo(cx-3,eyeY+eyeH*1.8); ctx.bezierCurveTo(cx-5,noseY-12,cx-4,noseY-3,cx-2,noseY+5);
  ctx.strokeStyle=nhGrad; ctx.lineWidth=6; ctx.lineCap="round"; ctx.stroke();

  // Nose tip shading
  const ntGrad = ctx.createRadialGradient(cx-3,noseY,0,cx,noseY,frx*0.12);
  ntGrad.addColorStop(0,"rgba(255,238,215,0.38)"); ntGrad.addColorStop(0.62,"rgba(0,0,0,0)"); ntGrad.addColorStop(1,"rgba(130,60,20,0.16)");
  ctx.beginPath(); ctx.ellipse(cx,noseY+2,frx*0.115,fry*0.068,0,0,Math.PI*2); ctx.fillStyle=ntGrad; ctx.fill();

  // Nostrils — proper organic shape
  const nostrilW = frx*0.088, nostrilH = fry*0.048;
  [[-1,1],[1,-1]].forEach(([side,rotSide])=>{
    const nx = cx + side*frx*0.088;
    ctx.beginPath(); ctx.ellipse(nx, noseY+fry*0.058, nostrilW*0.9, nostrilH*0.92, rotSide*0.35, 0, Math.PI*2);
    ctx.fillStyle=darken(skin,0.38); ctx.fill();
    ctx.beginPath(); ctx.ellipse(nx+side*1, noseY+fry*0.052, nostrilW*0.56, nostrilH*0.58, rotSide*0.35, 0, Math.PI*2);
    ctx.fillStyle="rgba(20,5,0,0.52)"; ctx.fill();
  });
  // Nose side shadows
  [-1,1].forEach(side=>{
    ctx.beginPath(); ctx.moveTo(cx+side*frx*0.13,noseY+fry*0.07); ctx.bezierCurveTo(cx+side*frx*0.11,noseY-fry*0.04,cx+side*frx*0.06,noseY-fry*0.18,cx+side*frx*0.04,eyeY+eyeH*1.6);
    ctx.strokeStyle=`rgba(100,45,14,0.22)`; ctx.lineWidth=1.5; ctx.stroke();
  });

  // ── 8. LIPS ─────────────────────────────────────────────────────────
  const lipW = frx*0.56;
  const lipMidY = mouthY + fry*0.02;
  const lipBotY = mouthY + fry*0.115;
  const lipTopY = mouthY - fry*0.06;

  // Philtrum
  ctx.beginPath(); ctx.moveTo(cx-frx*0.04,mouthY-fry*0.10); ctx.bezierCurveTo(cx-frx*0.025,mouthY-fry*0.055,cx-frx*0.01,mouthY-fry*0.025,cx,lipTopY+2);
  ctx.moveTo(cx+frx*0.04,mouthY-fry*0.10); ctx.bezierCurveTo(cx+frx*0.025,mouthY-fry*0.055,cx+frx*0.01,mouthY-fry*0.025,cx,lipTopY+2);
  ctx.strokeStyle=`rgba(120,55,28,0.18)`; ctx.lineWidth=1.4; ctx.stroke();

  // Upper lip — precise cupid's bow
  ctx.beginPath();
  ctx.moveTo(cx-lipW, lipMidY+2);
  ctx.bezierCurveTo(cx-lipW*0.72, lipMidY+2, cx-lipW*0.46, lipTopY-fry*0.02, cx-lipW*0.18, lipTopY+fry*0.012);
  ctx.bezierCurveTo(cx-lipW*0.06, lipTopY-fry*0.018, cx-lipW*0.01, lipTopY-fry*0.038, cx, lipTopY-fry*0.015);
  ctx.bezierCurveTo(cx+lipW*0.01, lipTopY-fry*0.038, cx+lipW*0.06, lipTopY-fry*0.018, cx+lipW*0.18, lipTopY+fry*0.012);
  ctx.bezierCurveTo(cx+lipW*0.46, lipTopY-fry*0.02, cx+lipW*0.72, lipMidY+2, cx+lipW, lipMidY+2);
  // Bottom curve of upper lip
  ctx.bezierCurveTo(cx+lipW*0.55, lipMidY+fry*0.04, cx+lipW*0.15, lipMidY+fry*0.052, cx, lipMidY+fry*0.055);
  ctx.bezierCurveTo(cx-lipW*0.15, lipMidY+fry*0.052, cx-lipW*0.55, lipMidY+fry*0.04, cx-lipW, lipMidY+2);
  ctx.closePath();
  const ulGrad = ctx.createLinearGradient(cx,lipTopY-fry*0.04,cx,lipMidY+fry*0.055);
  ulGrad.addColorStop(0,darken(lip,0.18)); ulGrad.addColorStop(0.55,lip); ulGrad.addColorStop(1,darken(lip,0.12));
  ctx.fillStyle=ulGrad; ctx.fill();

  // Lower lip — fuller and rounder
  ctx.beginPath();
  ctx.moveTo(cx-lipW, lipMidY+2);
  ctx.bezierCurveTo(cx-lipW*0.65, lipMidY+fry*0.028, cx-lipW*0.22, lipMidY+fry*0.048, cx, lipMidY+fry*0.052);
  ctx.bezierCurveTo(cx+lipW*0.22, lipMidY+fry*0.048, cx+lipW*0.65, lipMidY+fry*0.028, cx+lipW, lipMidY+2);
  ctx.bezierCurveTo(cx+lipW*0.62, lipBotY+fry*0.002, cx+lipW*0.18, lipBotY+fry*0.018, cx, lipBotY+fry*0.015);
  ctx.bezierCurveTo(cx-lipW*0.18, lipBotY+fry*0.018, cx-lipW*0.62, lipBotY+fry*0.002, cx-lipW, lipMidY+2);
  ctx.closePath();
  const llGrad = ctx.createLinearGradient(cx,lipMidY+2,cx,lipBotY+fry*0.018);
  llGrad.addColorStop(0,lip); llGrad.addColorStop(0.32,lighten(lip,0.12)); llGrad.addColorStop(0.72,lip); llGrad.addColorStop(1,darken(lip,0.22));
  ctx.fillStyle=llGrad; ctx.fill();

  // Lower lip volume highlight
  const llHL = ctx.createRadialGradient(cx-frx*0.03,lipMidY+fry*0.072,0,cx-frx*0.03,lipMidY+fry*0.07,frx*0.14);
  llHL.addColorStop(0,"rgba(255,255,255,0.35)"); llHL.addColorStop(1,"rgba(255,255,255,0)");
  ctx.beginPath(); ctx.ellipse(cx-frx*0.03,lipMidY+fry*0.073,frx*0.14,fry*0.042,0,0,Math.PI*2); ctx.fillStyle=llHL; ctx.fill();

  // Lip line separation
  ctx.beginPath(); ctx.moveTo(cx-lipW,lipMidY+2); ctx.bezierCurveTo(cx-lipW*0.42,lipMidY+fry*0.022,cx+lipW*0.42,lipMidY+fry*0.022,cx+lipW,lipMidY+2);
  ctx.strokeStyle=darken(lip,0.38); ctx.lineWidth=0.9; ctx.stroke();
}

// ── Animated pulse ─────────────────────────────────────────────────────
let _animFrame = null;

export default function RealisticFace3D({
  width=380, height=460, className="",
  profile={}, palette={}, animated=true,
}) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  const skin = profile.skinToneHex || SKIN_HEX[profile.skinTone]  || "#d4a878";
  const iris = EYE_HEX[profile.eyeColour]  || "#7a4828";
  const hair = HAIR_HEX[profile.hairColour] || "#2a1408";
  const lip  = palette.lip   || "#c03858";
  const blush= palette.blush || "#d87060";

  useEffect(() => {
    const canvas = canvasRef.current; if(!canvas) return;
    canvas.width=width; canvas.height=height;
    const opts = { skin, iris, hair, lip, blush };

    if(animated){
      let t=0;
      function frame(){
        const blushAnim = blush + Math.round(0x88+Math.sin(t*0.03)*0x18).toString(16).padStart(2,"0").slice(-2);
        render(canvas, { ...opts, blush: blushAnim });
        t++; rafRef.current = requestAnimationFrame(frame);
      }
      rafRef.current = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(rafRef.current);
    } else {
      render(canvas, opts);
    }
  }, [skin, iris, hair, lip, blush, width, height, animated]);

  return (
    <canvas
      ref={canvasRef}
      className={`drop-shadow-2xl ${className}`}
      style={{ borderRadius:"50% 50% 50% 50% / 40% 40% 60% 60%", maxWidth:"100%" }}
      aria-label="Face illustration"
    />
  );
}

export function ProfileFace({ profile={}, palette={}, width=380, height=460, animated=true, className="" }) {
  return <RealisticFace3D profile={profile} palette={palette} width={width} height={height} animated={animated} className={className}/>;
}
