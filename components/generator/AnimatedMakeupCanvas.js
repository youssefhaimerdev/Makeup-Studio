"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { LIBRARY_LOOKS } from "@/lib/lookLibrary";

// ── Tool definitions ──────────────────────────────────────────────────
const TOOL_SHAPES = {
  sponge:    { type:"sponge",    label:"Beauty Sponge",  emoji:"🥚" },
  flatBrush: { type:"flat",      label:"Flat Brush",     emoji:"🖌" },
  fluffBrush:{ type:"fluffy",    label:"Fluffy Brush",   emoji:"🖌" },
  eyeBrush:  { type:"shader",    label:"Shader Brush",   emoji:"🖌" },
  linerBrush:{ type:"liner",     label:"Liner Brush",    emoji:"✒"  },
  mascWand:  { type:"wand",      label:"Mascara Wand",   emoji:"🪄" },
  lipstick:  { type:"bullet",    label:"Lipstick",       emoji:"💄" },
  lipBrush:  { type:"lipbrush",  label:"Lip Brush",      emoji:"🖌" },
  spoolie:   { type:"spoolie",   label:"Spoolie",        emoji:"🪥" },
  powder:    { type:"powder",    label:"Powder Brush",   emoji:"🖌" },
};

const CATEGORY_MAP = {
  "Foundation":          { tool:"sponge",    motion:"dabCentre",  zone:"face",    color:"#d4a97a", alpha:0.55, blend:"multiply"     },
  "BB Cream":            { tool:"sponge",    motion:"dabCentre",  zone:"face",    color:"#d4b090", alpha:0.45, blend:"multiply"     },
  "CC Cream":            { tool:"sponge",    motion:"dabCentre",  zone:"face",    color:"#d4b090", alpha:0.4,  blend:"multiply"     },
  "Skin Tint":           { tool:"sponge",    motion:"dabCentre",  zone:"face",    color:"#d4b090", alpha:0.3,  blend:"multiply"     },
  "Concealer":           { tool:"sponge",    motion:"triangle",   zone:"eyes",    color:"#e8cca0", alpha:0.6,  blend:"source-over"  },
  "Color Corrector":     { tool:"eyeBrush",  motion:"spot",       zone:"eyes",    color:"#f09060", alpha:0.5,  blend:"source-over"  },
  "Primer":              { tool:"sponge",    motion:"spread",     zone:"face",    color:"#f5ebe0", alpha:0.2,  blend:"source-over"  },
  "Pore Primer":         { tool:"sponge",    motion:"tzone",      zone:"face",    color:"#f0e8df", alpha:0.25, blend:"source-over"  },
  "Setting Powder":      { tool:"powder",    motion:"sweep",      zone:"face",    color:"#f5e8d0", alpha:0.3,  blend:"source-over"  },
  "Setting Spray":       { tool:null,        motion:"mist",       zone:"face",    color:"#c8e0f8", alpha:0.08, blend:"screen"       },
  "Blush":               { tool:"fluffBrush",motion:"cheekArc",   zone:"cheeks",  color:"#f08060", alpha:0.55, blend:"multiply"     },
  "Blush Stick":         { tool:"sponge",    motion:"cheekTap",   zone:"cheeks",  color:"#f08060", alpha:0.5,  blend:"multiply"     },
  "Cream Blush":         { tool:"sponge",    motion:"cheekTap",   zone:"cheeks",  color:"#e87060", alpha:0.5,  blend:"multiply"     },
  "Bronzer":             { tool:"fluffBrush",motion:"threePos",   zone:"face",    color:"#b07840", alpha:0.4,  blend:"multiply"     },
  "Cream Bronzer":       { tool:"sponge",    motion:"threePos",   zone:"face",    color:"#a86830", alpha:0.4,  blend:"multiply"     },
  "Contour":             { tool:"fluffBrush",motion:"hollow",     zone:"cheeks",  color:"#886040", alpha:0.4,  blend:"multiply"     },
  "Highlighter":         { tool:"eyeBrush",  motion:"highPoints", zone:"cheeks",  color:"#f0d880", alpha:0.6,  blend:"screen"       },
  "Eyeshadow":           { tool:"eyeBrush",  motion:"lidSweep",   zone:"eyes",    color:"#a07090", alpha:0.7,  blend:"multiply"     },
  "Loose Pigment":       { tool:"eyeBrush",  motion:"lidPack",    zone:"eyes",    color:"#c090d0", alpha:0.75, blend:"multiply"     },
  "Eyeliner":            { tool:"linerBrush",motion:"lashLine",   zone:"eyes",    color:"#0a0500", alpha:0.95, blend:"source-over"  },
  "Eye Primer":          { tool:"eyeBrush",  motion:"lidSweep",   zone:"eyes",    color:"#e0c8a8", alpha:0.4,  blend:"source-over"  },
  "Mascara":             { tool:"mascWand",  motion:"lashStroke", zone:"lashes",  color:"#080300", alpha:0.9,  blend:"source-over"  },
  "Eyebrow":             { tool:"spoolie",   motion:"browStroke", zone:"brows",   color:"#3c2008", alpha:0.85, blend:"source-over"  },
  "Brow Lamination Gel": { tool:"spoolie",   motion:"browGroom",  zone:"brows",   color:"#3c2008", alpha:0.5,  blend:"source-over"  },
  "Lipstick":            { tool:"lipstick",  motion:"lipApply",   zone:"lips",    color:"#c03050", alpha:0.9,  blend:"source-over"  },
  "Lip Gloss":           { tool:"lipBrush",  motion:"lipGloss",   zone:"lips",    color:"#e06080", alpha:0.6,  blend:"source-over"  },
  "Lip Liner":           { tool:"linerBrush",motion:"lipLine",    zone:"lips",    color:"#a02040", alpha:0.95, blend:"source-over"  },
  "Lip Oil":             { tool:"lipBrush",  motion:"lipGloss",   zone:"lips",    color:"#e08060", alpha:0.5,  blend:"source-over"  },
  "Lip Stain":           { tool:"lipBrush",  motion:"lipApply",   zone:"lips",    color:"#c04060", alpha:0.7,  blend:"multiply"     },
};

// ── Zone crop rectangles (normalised 0–1 of canvas) ──────────────────
// Each defines the region to zoom into when that zone is active
const ZONE_CROPS = {
  eyes:   { x: 0.04, y: 0.30, w: 0.92, h: 0.30 },
  lashes: { x: 0.04, y: 0.33, w: 0.92, h: 0.25 },
  brows:  { x: 0.08, y: 0.24, w: 0.84, h: 0.22 },
  lips:   { x: 0.12, y: 0.68, w: 0.76, h: 0.24 },
  cheeks: { x: 0.00, y: 0.42, w: 1.00, h: 0.38 },
  face:   null,
};

// ── Base face drawing ─────────────────────────────────────────────────
function drawBaseFace(ctx, W, H, skinTone = "#e8c9a0") {
  const cx=W/2, cy=H*0.46, rx=W*0.36, ry=H*0.40;
  ctx.save();
  // Hair
  ctx.fillStyle="#2a1508";
  ctx.beginPath(); ctx.ellipse(cx,cy-ry*0.72,rx*1.05,ry*0.52,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx-rx*0.95,cy-ry*0.45); ctx.bezierCurveTo(cx-rx*1.35,cy-ry*0.1,cx-rx*1.35,cy+ry*0.35,cx-rx*0.85,cy+ry*0.5); ctx.bezierCurveTo(cx-rx*0.6,cy+ry*0.6,cx-rx*0.45,cy+ry*0.45,cx-rx*0.4,cy+ry*0.25); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx+rx*0.95,cy-ry*0.45); ctx.bezierCurveTo(cx+rx*1.35,cy-ry*0.1,cx+rx*1.35,cy+ry*0.35,cx+rx*0.85,cy+ry*0.5); ctx.bezierCurveTo(cx+rx*0.6,cy+ry*0.6,cx+rx*0.45,cy+ry*0.45,cx+rx*0.4,cy+ry*0.25); ctx.closePath(); ctx.fill();
  ctx.restore();
  // Skin
  ctx.save();
  ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
  const sg=ctx.createRadialGradient(cx-rx*0.1,cy-ry*0.25,0,cx,cy,rx*1.05);
  sg.addColorStop(0,skinTone); sg.addColorStop(0.75,skinTone); sg.addColorStop(1,darken(skinTone,0.72));
  ctx.fillStyle=sg; ctx.shadowColor="rgba(80,40,10,0.2)"; ctx.shadowBlur=16; ctx.shadowOffsetY=6;
  ctx.fill(); ctx.shadowColor="transparent"; ctx.shadowBlur=0; ctx.shadowOffsetY=0; ctx.restore();
  // Eyes
  [cx-rx*0.38, cx+rx*0.38].forEach(ex => {
    const ey=cy-ry*0.22;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(ex,ey,30,11,0,0,Math.PI*2); ctx.fillStyle="#f8f4f0"; ctx.fill();
    ctx.beginPath(); ctx.arc(ex,ey,9,0,Math.PI*2); ctx.fillStyle="#5c3d1e"; ctx.fill();
    ctx.beginPath(); ctx.arc(ex,ey,5,0,Math.PI*2); ctx.fillStyle="#0a0500"; ctx.fill();
    ctx.beginPath(); ctx.arc(ex-3,ey-3,2.5,0,Math.PI*2); ctx.fillStyle="rgba(255,255,255,0.9)"; ctx.fill();
    ctx.beginPath(); ctx.moveTo(ex-30,ey); ctx.bezierCurveTo(ex-15,ey-14,ex+15,ey-14,ex+32,ey-2);
    ctx.strokeStyle="#0a0500"; ctx.lineWidth=2; ctx.stroke(); ctx.restore();
  });
  // Brows
  [[cx-rx*0.38,cy-ry*0.36,-1],[cx+rx*0.38,cy-ry*0.36,1]].forEach(([bx,by,flip])=>{
    ctx.save(); ctx.beginPath(); ctx.moveTo(bx-27*flip,by+4); ctx.bezierCurveTo(bx-12*flip,by-6,bx+8*flip,by-9,bx+25*flip,by+1);
    ctx.lineWidth=5.5; ctx.strokeStyle="rgba(42,21,8,0.88)"; ctx.lineCap="round"; ctx.stroke(); ctx.restore();
  });
  // Nose
  const ny=cy+ry*0.18;
  [cx-11,cx+11].forEach(nx=>{ ctx.save(); ctx.beginPath(); ctx.ellipse(nx,ny+6,6,4,0.4,0,Math.PI*2); ctx.fillStyle="rgba(90,40,20,0.4)"; ctx.fill(); ctx.restore(); });
  // Lips
  const ly=cy+ry*0.45;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(cx-30,ly+4); ctx.bezierCurveTo(cx-22,ly+4,cx-14,ly-6,cx-6,ly-3); ctx.bezierCurveTo(cx-3,ly-5,cx-1,ly-7,cx,ly-5); ctx.bezierCurveTo(cx+1,ly-7,cx+3,ly-5,cx+6,ly-3); ctx.bezierCurveTo(cx+14,ly-6,cx+22,ly+4,cx+30,ly+4); ctx.bezierCurveTo(cx+18,ly+10,cx+6,ly+7,cx,ly+7); ctx.bezierCurveTo(cx-6,ly+7,cx-18,ly+10,cx-30,ly+4); ctx.closePath();
  const lg1=ctx.createLinearGradient(cx,ly-7,cx,ly+10); lg1.addColorStop(0,"#c09080"); lg1.addColorStop(1,"#a07060"); ctx.fillStyle=lg1; ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx-30,ly+4); ctx.bezierCurveTo(cx-20,ly+5,cx-8,ly+6,cx,ly+7); ctx.bezierCurveTo(cx+8,ly+6,cx+20,ly+5,cx+30,ly+4); ctx.bezierCurveTo(cx+22,ly+26,cx+8,ly+28,cx,ly+27); ctx.bezierCurveTo(cx-8,ly+28,cx-22,ly+26,cx-30,ly+4); ctx.closePath();
  const lg2=ctx.createLinearGradient(cx,ly+4,cx,ly+28); lg2.addColorStop(0,"#c09080"); lg2.addColorStop(0.5,"#d4a898"); lg2.addColorStop(1,"#a07060"); ctx.fillStyle=lg2; ctx.fill(); ctx.restore();
}

function darken(hex,f){ const n=parseInt((hex||"#e8c9a8").replace("#",""),16); return `rgb(${Math.round(((n>>16)&255)*f)},${Math.round(((n>>8)&255)*f)},${Math.round((n&255)*f)})`; }

// ── Tool rendering ────────────────────────────────────────────────────
function drawTool(ctx, toolType, x, y, angle=0) {
  ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
  switch(toolType) {
    case "sponge": {
      const g=ctx.createRadialGradient(-3,-3,2,0,0,18); g.addColorStop(0,"#f5e8d8"); g.addColorStop(0.7,"#e8cdb0"); g.addColorStop(1,"#d4b090");
      ctx.beginPath(); ctx.ellipse(0,0,16,20,0,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      ctx.strokeStyle="rgba(180,130,90,0.4)"; ctx.lineWidth=1; ctx.stroke();
      for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(Math.cos(i*1.05)*7,Math.sin(i*1.05)*9,1.5,0,Math.PI*2);ctx.fillStyle="rgba(150,100,60,0.2)";ctx.fill();}
      break;
    }
    case "fluffy": case "flat": case "shader": case "lipbrush": case "powder": {
      const w=toolType==="shader"?10:toolType==="lipbrush"?6:toolType==="powder"?22:toolType==="flat"?14:18;
      const h=toolType==="shader"?8:toolType==="lipbrush"?5:toolType==="powder"?18:12;
      ctx.beginPath(); ctx.roundRect(-2,12,4,45,2); ctx.fillStyle="#c8a870"; ctx.fill();
      ctx.beginPath(); ctx.roundRect(-3.5,8,7,8,1); ctx.fillStyle="#b0b0b0"; ctx.fill();
      const bg=ctx.createLinearGradient(-w,-h,w,h); bg.addColorStop(0,"#f5f0e8"); bg.addColorStop(0.5,"#e8e0d0"); bg.addColorStop(1,"#d8d0c0");
      ctx.beginPath();
      if(toolType==="fluffy"||toolType==="powder") ctx.ellipse(0,0,w,h,0,0,Math.PI*2);
      else ctx.roundRect(-w/2,-h/2,w,h,3);
      ctx.fillStyle=bg; ctx.fill(); ctx.strokeStyle="rgba(180,160,130,0.5)"; ctx.lineWidth=0.8; ctx.stroke();
      break;
    }
    case "liner": {
      ctx.beginPath(); ctx.roundRect(-1.5,12,3,40,1); ctx.fillStyle="#8b6914"; ctx.fill();
      ctx.beginPath(); ctx.roundRect(-2,9,4,5,1); ctx.fillStyle="#c0c0c0"; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-2,9); ctx.lineTo(-1,-6); ctx.lineTo(0,-8); ctx.lineTo(1,-6); ctx.lineTo(2,9); ctx.fillStyle="#1a1008"; ctx.fill();
      break;
    }
    case "wand": {
      ctx.beginPath(); ctx.roundRect(-2,14,4,38,1); ctx.fillStyle="#1a0a00"; ctx.fill();
      ctx.beginPath(); ctx.roundRect(-2,10,4,6,1); ctx.fillStyle="#303030"; ctx.fill();
      for(let i=-4;i<=4;i++){ctx.beginPath();ctx.moveTo(i*1.8,8);ctx.lineTo(i*1.5,-8+Math.abs(i)*0.5);ctx.lineWidth=1.8;ctx.strokeStyle="#0a0500";ctx.stroke();}
      for(let i=0;i<10;i++){const a=i*0.65,r=3.5;ctx.beginPath();ctx.arc(Math.cos(a)*r,-5+i*1.2,1.2,0,Math.PI*2);ctx.fillStyle="#0a0500";ctx.fill();}
      break;
    }
    case "bullet": {
      ctx.beginPath(); ctx.roundRect(-6,8,12,32,2); ctx.fillStyle="#c8a0a0"; ctx.fill(); ctx.strokeStyle="#a08080"; ctx.lineWidth=0.5; ctx.stroke();
      ctx.beginPath(); ctx.rect(-6,6,12,4); ctx.fillStyle="#c8a840"; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-6,6); ctx.lineTo(-6,-12); ctx.bezierCurveTo(-6,-18,6,-18,6,-12); ctx.lineTo(6,6); ctx.closePath();
      const lcg=ctx.createLinearGradient(-6,-18,6,6); lcg.addColorStop(0,"#ff8090"); lcg.addColorStop(0.4,"#e02050"); lcg.addColorStop(1,"#a01830"); ctx.fillStyle=lcg; ctx.fill();
      ctx.beginPath(); ctx.ellipse(-1,-10,2,6,0.3,0,Math.PI*2); ctx.fillStyle="rgba(255,255,255,0.3)"; ctx.fill();
      break;
    }
    case "spoolie": {
      ctx.beginPath(); ctx.roundRect(-1.5,12,3,38,1); ctx.fillStyle="#8b6914"; ctx.fill();
      ctx.beginPath(); ctx.roundRect(-2,8,4,6,1); ctx.fillStyle="#a0a0a0"; ctx.fill();
      for(let i=0;i<14;i++){const a=i*0.48,r=4+Math.cos(a)*1.5;ctx.beginPath();ctx.arc(Math.cos(a)*r,-8+i*1.1,1,0,Math.PI*2);ctx.fillStyle="#3c2008";ctx.fill();}
      break;
    }
    default: ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.fillStyle="#e0d0b0"; ctx.fill();
  }
  ctx.restore();
}

// ── Motion paths ──────────────────────────────────────────────────────
function getMotionPath(motion, W, H) {
  const cx=W/2,cy=H*0.46,rx=W*0.36,ry=H*0.40,ly=cy+ry*0.45,eyeLX=cx-rx*0.38,eyeRX=cx+rx*0.38,eyeY=cy-ry*0.22;
  const paths = {
    dabCentre:[{x:cx,y:cy-ry*0.15},{x:cx-rx*0.3,y:cy},{x:cx,y:cy+ry*0.15},{x:cx+rx*0.3,y:cy},{x:cx,y:cy-ry*0.15},{x:cx-rx*0.5,y:cy-ry*0.2},{x:cx+rx*0.5,y:cy-ry*0.2},{x:cx,y:cy}],
    spread:[{x:cx,y:cy},{x:cx-rx*0.6,y:cy-ry*0.2},{x:cx,y:cy-ry*0.4},{x:cx+rx*0.6,y:cy-ry*0.2},{x:cx+rx*0.5,y:cy+ry*0.2},{x:cx,y:cy+ry*0.5},{x:cx-rx*0.5,y:cy+ry*0.2}],
    triangle:[{x:cx-rx*0.2,y:eyeY+20},{x:cx-rx*0.5,y:eyeY+35},{x:cx-rx*0.1,y:eyeY+45},{x:cx-rx*0.3,y:eyeY+30},{x:cx-rx*0.15,y:eyeY+20}],
    tzone:[{x:cx,y:cy-ry*0.4},{x:cx,y:cy+ry*0.2},{x:cx-rx*0.3,y:cy},{x:cx+rx*0.3,y:cy}],
    cheekArc:[{x:cx-rx*0.65,y:cy+ry*0.05},{x:cx-rx*0.45,y:cy-ry*0.05},{x:cx-rx*0.3,y:cy+ry*0.08},{x:cx-rx*0.5,y:cy+ry*0.15},{x:cx-rx*0.65,y:cy+ry*0.05}],
    cheekTap:[{x:cx-rx*0.55,y:cy+ry*0.05},{x:cx-rx*0.5,y:cy+ry*0.08},{x:cx-rx*0.6,y:cy+ry*0.1},{x:cx-rx*0.5,y:cy+ry*0.05}],
    threePos:[{x:cx,y:cy-ry*0.45},{x:cx-rx*0.45,y:cy+ry*0.05},{x:cx+rx*0.45,y:cy+ry*0.05},{x:cx,y:cy+ry*0.45},{x:cx,y:cy-ry*0.45}],
    hollow:[{x:cx-rx*0.65,y:cy+ry*0.18},{x:cx-rx*0.4,y:cy+ry*0.1},{x:cx-rx*0.55,y:cy+ry*0.22},{x:cx-rx*0.65,y:cy+ry*0.18}],
    highPoints:[{x:cx-rx*0.5,y:cy-ry*0.02},{x:cx,y:cy-ry*0.15},{x:cx+rx*0.5,y:cy-ry*0.02},{x:cx,y:cy-ry*0.05},{x:eyeLX-5,y:eyeY-5},{x:eyeRX+5,y:eyeY-5}],
    lidSweep:[{x:eyeLX-25,y:eyeY},{x:eyeLX,y:eyeY-8},{x:eyeLX+25,y:eyeY},{x:eyeRX-25,y:eyeY},{x:eyeRX,y:eyeY-8},{x:eyeRX+25,y:eyeY}],
    lidPack:[{x:eyeLX-15,y:eyeY},{x:eyeLX+15,y:eyeY},{x:eyeLX,y:eyeY},{x:eyeRX-15,y:eyeY},{x:eyeRX+15,y:eyeY},{x:eyeRX,y:eyeY}],
    lashLine:[{x:eyeLX-28,y:eyeY-2},{x:eyeLX-10,y:eyeY-10},{x:eyeLX+10,y:eyeY-10},{x:eyeLX+28,y:eyeY-4},{x:eyeLX+36,y:eyeY-8},{x:eyeRX-28,y:eyeY-2},{x:eyeRX-10,y:eyeY-10},{x:eyeRX+10,y:eyeY-10},{x:eyeRX+28,y:eyeY-4}],
    lashStroke:[{x:eyeLX-20,y:eyeY-12},{x:eyeLX-10,y:eyeY-14},{x:eyeLX,y:eyeY-14},{x:eyeLX+10,y:eyeY-12},{x:eyeLX+20,y:eyeY-11},{x:eyeRX-20,y:eyeY-12},{x:eyeRX-10,y:eyeY-14},{x:eyeRX,y:eyeY-14},{x:eyeRX+10,y:eyeY-12},{x:eyeRX+20,y:eyeY-11}],
    browStroke:[{x:eyeLX-25,y:eyeY-22},{x:eyeLX-10,y:eyeY-30},{x:eyeLX+10,y:eyeY-30},{x:eyeLX+22,y:eyeY-24},{x:eyeRX-22,y:eyeY-24},{x:eyeRX-10,y:eyeY-30},{x:eyeRX+10,y:eyeY-30},{x:eyeRX+25,y:eyeY-22}],
    browGroom:[{x:eyeLX-22,y:eyeY-26},{x:eyeLX,y:eyeY-30},{x:eyeLX+22,y:eyeY-24},{x:eyeRX-22,y:eyeY-24},{x:eyeRX,y:eyeY-30},{x:eyeRX+22,y:eyeY-26}],
    lipApply:[{x:cx-28,y:ly+4},{x:cx-10,y:ly-3},{x:cx,y:ly-5},{x:cx+10,y:ly-3},{x:cx+28,y:ly+4},{x:cx+20,y:ly+15},{x:cx,y:ly+18},{x:cx-20,y:ly+15},{x:cx-28,y:ly+4}],
    lipGloss:[{x:cx-20,y:ly+10},{x:cx,y:ly+8},{x:cx+20,y:ly+10},{x:cx+15,y:ly+18},{x:cx,y:ly+20},{x:cx-15,y:ly+18}],
    lipLine:[{x:cx-30,y:ly+4},{x:cx-15,y:ly-2},{x:cx-6,y:ly-3},{x:cx,y:ly-5},{x:cx+6,y:ly-3},{x:cx+15,y:ly-2},{x:cx+30,y:ly+4},{x:cx+22,y:ly+22},{x:cx,y:ly+25},{x:cx-22,y:ly+22},{x:cx-30,y:ly+4}],
    spot:[{x:cx-rx*0.25,y:eyeY+20},{x:cx-rx*0.4,y:eyeY+30},{x:cx-rx*0.15,y:eyeY+38},{x:cx-rx*0.3,y:eyeY+28}],
    mist:[{x:cx-rx*0.3,y:cy-ry*0.3},{x:cx+rx*0.3,y:cy-ry*0.1},{x:cx,y:cy+ry*0.2},{x:cx-rx*0.2,y:cy+ry*0.4}],
    sweep:[{x:cx-rx*0.4,y:cy},{x:cx+rx*0.4,y:cy},{x:cx+rx*0.2,y:cy-ry*0.1},{x:cx-rx*0.2,y:cy+ry*0.1}],
  };
  return paths[motion] || paths.dabCentre;
}

function applyMark(ctx, motion, x, y, color, alpha, blend, toolType, progress) {
  ctx.save(); ctx.globalCompositeOperation=blend||"multiply"; ctx.globalAlpha=alpha*(0.5+progress*0.5)*0.35;
  if(toolType==="sponge"){const r=14+Math.random()*4;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,"rgba(0,0,0,0)");ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();}
  else if(toolType==="wand"){ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
  else if(toolType==="liner"||toolType==="lipbrush"){ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
  else if(toolType==="bullet"){const g=ctx.createRadialGradient(x,y,0,x,y,7);g.addColorStop(0,color);g.addColorStop(1,"rgba(0,0,0,0)");ctx.beginPath();ctx.ellipse(x,y,7,4,0,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();}
  else{const r2=motion==="threePos"||motion==="cheekArc"?16:10;const g2=ctx.createRadialGradient(x,y,0,x,y,r2);g2.addColorStop(0,color);g2.addColorStop(1,"rgba(0,0,0,0)");ctx.beginPath();ctx.arc(x,y,r2,0,Math.PI*2);ctx.fillStyle=g2;ctx.fill();}
  ctx.restore();
}

// ── Palette comparison swatch ─────────────────────────────────────────
function PaletteMatch({ currentPalette, refLookId }) {
  const refLook = LIBRARY_LOOKS.find(l => l.id === refLookId);
  if (!refLook) return null;
  const zones = ["skin","blush","eye","lip","bronze","highlight"];
  function hexMatch(a, b) {
    if (!a || !b) return null;
    const hex2rgb = h => { const n=parseInt(h.replace("#",""),16); return [n>>16,(n>>8)&255,n&255]; };
    try {
      const [r1,g1,b1]=hex2rgb(a), [r2,g2,b2]=hex2rgb(b);
      const dist=Math.sqrt((r1-r2)**2+(g1-g2)**2+(b1-b2)**2);
      return Math.max(0, Math.round(100 - dist/4.41));
    } catch { return null; }
  }
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor:"var(--border)" }}>
      <div className="px-3 py-2 border-b text-center" style={{ background:"var(--bg-subtle)", borderColor:"var(--border)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest font-sans" style={{ color:"var(--text-muted)" }}>
          Matching to: {refLook.name}
        </p>
      </div>
      <div className="p-3 flex flex-col gap-2">
        {zones.map(k => {
          const mine = currentPalette[k], theirs = refLook.palette[k];
          if (!theirs) return null;
          const match = hexMatch(mine, theirs);
          const col = match === null ? "#aaa" : match >= 80 ? "#16a34a" : match >= 55 ? "#f59e0b" : "#e11d48";
          return (
            <div key={k} className="flex items-center gap-2">
              <span className="text-[9px] font-sans w-12 uppercase shrink-0" style={{ color:"var(--text-faint)" }}>{k}</span>
              <div className="w-4 h-4 rounded-full border border-white shadow-sm shrink-0" style={{ background:mine||"#e3d5c5" }}/>
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background:"var(--border)" }}>
                {match !== null && <div className="h-full rounded-full" style={{ width:`${match}%`, background:col, transition:"width 0.5s" }}/>}
              </div>
              <div className="w-4 h-4 rounded-full border border-white shadow-sm shrink-0" style={{ background:theirs }}/>
              {match !== null && <span className="text-[9px] font-bold font-sans shrink-0" style={{ color:col }}>{match}%</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
const SPEED_OPTIONS = [
  { label:"0.5×", value:0.5 },
  { label:"1×",   value:1.0 },
  { label:"2×",   value:2.0 },
];
const BASE_SPEED = 0.025;

export default function AnimatedMakeupCanvas({ steps=[], currentStepIndex=0, palette={}, profile={} }) {
  const canvasRef   = useRef(null);
  const baseRef     = useRef(null);
  const beforeRef   = useRef(null); // snapshot before this step
  const afterRef    = useRef(null);  // snapshot after this step
  const rafRef      = useRef(null);

  const [animating,    setAnimating]    = useState(false);
  const [toolLabel,    setToolLabel]    = useState("");
  const [toolEmoji,    setToolEmoji]    = useState("");
  const [showBefore,   setShowBefore]   = useState(false);
  const [speed,        setSpeed]        = useState(1.0);
  const [zoomZone,     setZoomZone]     = useState(null);
  const [refLookId,    setRefLookId]    = useState("");
  const speedRef = useRef(1.0);

  const W = 360, H = 440;

  const skinHex = profile.skinToneHex
    || {"fair":"#f5e0cc","light":"#e8c9a8","medium":"#d4a878","tan":"#b8854e","deep":"#8c5c32","rich":"#5a3518"}[profile.skinTone]
    || palette.skin || "#e8c9a0";

  // Init base face
  useEffect(() => {
    const canvas = canvasRef.current; if(!canvas) return;
    canvas.width=W; canvas.height=H;
    const ctx = canvas.getContext("2d");
    drawBaseFace(ctx, W, H, skinHex);
    const base = document.createElement("canvas"); base.width=W; base.height=H;
    drawBaseFace(base.getContext("2d"), W, H, skinHex);
    baseRef.current = base;
  }, [skinHex]);

  // Render zoomed view from offscreen canvas
  function renderZoomed(displayCtx, sourceCanvas, zone) {
    if (!zone || !ZONE_CROPS[zone]) {
      displayCtx.clearRect(0, 0, W, H);
      displayCtx.drawImage(sourceCanvas, 0, 0);
      return;
    }
    const crop = ZONE_CROPS[zone];
    const sx = crop.x * W, sy = crop.y * H, sw = crop.w * W, sh = crop.h * H;
    displayCtx.clearRect(0, 0, W, H);
    displayCtx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, W, H);
  }

  // Animate when currentStepIndex changes
  useEffect(() => {
    const step = steps[currentStepIndex];
    if (!step || !step.product) return;
    const config = CATEGORY_MAP[step.category]; if (!config) return;
    const color = step.product.shadeHex || config.color;
    const { tool, motion, alpha, blend } = config;
    const toolDef = tool ? TOOL_SHAPES[tool] : null;
    const zone = config.zone || "face";

    setToolLabel(toolDef?.label || "Applying…");
    setToolEmoji(toolDef?.emoji || "🖌");
    setZoomZone(zone !== "face" ? zone : null);
    setAnimating(true);
    setShowBefore(false);

    // Bake all previous steps onto base
    const base = baseRef.current; if (!base) return;
    const bctx = base.getContext("2d");
    bctx.clearRect(0,0,W,H);
    drawBaseFace(bctx, W, H, skinHex);
    steps.slice(0, currentStepIndex).forEach(s => {
      if (!s.product) return;
      const cfg = CATEGORY_MAP[s.category]; if (!cfg) return;
      const c = s.product.shadeHex || cfg.color;
      getMotionPath(cfg.motion, W, H).forEach(pt => applyMark(bctx, cfg.motion, pt.x, pt.y, c, cfg.alpha*0.4, cfg.blend, cfg.tool||"fluffy", 1));
    });

    // Snapshot "before"
    const before = document.createElement("canvas"); before.width=W; before.height=H;
    before.getContext("2d").drawImage(base, 0, 0);
    beforeRef.current = before;

    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const path = getMotionPath(motion, W, H);

    // Working canvas (accumulates this step's marks)
    const working = document.createElement("canvas"); working.width=W; working.height=H;
    const wctx = working.getContext("2d");

    let pathIdx=0, subT=0;
    cancelAnimationFrame(rafRef.current);

    function animate() {
      if (pathIdx >= path.length-1) {
        // Snapshot "after"
        const after = document.createElement("canvas"); after.width=W; after.height=H;
        after.getContext("2d").drawImage(working, 0, 0);
        afterRef.current = after;
        setAnimating(false);
        return;
      }
      const from=path[pathIdx], to=path[pathIdx+1];
      subT += BASE_SPEED * speedRef.current;
      if (subT >= 1) { subT=0; pathIdx++; }

      const toolX = from.x+(to.x-from.x)*subT;
      const toolY = from.y+(to.y-from.y)*subT;

      // Draw to working canvas
      wctx.clearRect(0,0,W,H); wctx.drawImage(base, 0, 0);
      applyMark(wctx, motion, toolX, toolY, color, alpha, blend, tool||"fluffy", pathIdx/path.length);

      // Draw tool
      if (toolDef) {
        const angle = Math.atan2(to.y-from.y, to.x-from.x)+Math.PI/2;
        drawTool(wctx, toolDef.type, toolX, toolY-35, angle);
      }

      // Render to display (with zoom)
      renderZoomed(ctx, working, zone !== "face" ? zone : null);
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [currentStepIndex, steps, skinHex]);

  // Handle before/after toggle
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (showBefore && beforeRef.current) {
      renderZoomed(ctx, beforeRef.current, zoomZone);
    } else if (!showBefore && afterRef.current && !animating) {
      renderZoomed(ctx, afterRef.current, zoomZone);
    }
  }, [showBefore, zoomZone]);

  function handleSpeedChange(v) { setSpeed(v); speedRef.current = v; }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Tool indicator */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border font-sans text-sm font-semibold transition-all"
             style={{ background:animating?"#fff1f2":"var(--bg-card)", borderColor:animating?"#fecdd3":"var(--border)", color:animating?"#e11d48":"var(--text-muted)" }}>
          <span className="text-base">{toolEmoji||"✦"}</span>
          <span>{animating?`Applying with ${toolLabel}…`:"Ready"}</span>
          {animating&&<span className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce inline-block" style={{animationDelay:`${i*0.15}s`}}/>)}</span>}
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-1 rounded-full border overflow-hidden" style={{ borderColor:"var(--border)" }}>
          {SPEED_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => handleSpeedChange(opt.value)}
              className="px-3 py-1.5 text-xs font-bold font-sans cursor-pointer border-none transition-all"
              style={{ background:speed===opt.value?"#e11d48":"var(--bg-card)", color:speed===opt.value?"white":"var(--text-muted)" }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas with zoom badge */}
      <div className="relative" style={{ filter:"drop-shadow(0 8px 32px rgba(200,120,100,0.2))" }}>
        <canvas ref={canvasRef} className="w-full" style={{ borderRadius:"50% 50% 50% 50% / 40% 40% 60% 60%", maxWidth:"100%" }}/>
        {zoomZone && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold font-sans uppercase tracking-wide shadow-sm"
               style={{ background:"rgba(0,0,0,0.55)", color:"white", backdropFilter:"blur(4px)" }}>
            🔍 {zoomZone} close-up
          </div>
        )}
      </div>

      {/* Before / After toggle */}
      <div className="flex gap-2 items-center">
        <button onClick={() => setShowBefore(true)} disabled={animating||!beforeRef.current}
          className="flex-1 py-2 rounded-full text-xs font-bold font-sans cursor-pointer border transition-all disabled:opacity-40"
          style={{ background:showBefore?"#1a0a00":"var(--bg-card)", color:showBefore?"white":"var(--text-muted)", borderColor:showBefore?"#1a0a00":"var(--border)" }}>
          Before
        </button>
        <div className="w-px h-5 shrink-0" style={{ background:"var(--border)" }}/>
        <button onClick={() => setShowBefore(false)} disabled={animating}
          className="flex-1 py-2 rounded-full text-xs font-bold font-sans cursor-pointer border transition-all"
          style={{ background:!showBefore?"#e11d48":"var(--bg-card)", color:!showBefore?"white":"var(--text-muted)", borderColor:!showBefore?"#e11d48":"var(--border)" }}>
          After
        </button>
      </div>

      {/* Reference look comparison */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest font-sans" style={{ color:"var(--text-muted)" }}>Compare to library look</span>
        </div>
        <select value={refLookId} onChange={e => setRefLookId(e.target.value)}
          className="input-field !py-2 !text-xs w-full mb-2">
          <option value="">None — just show my build</option>
          {LIBRARY_LOOKS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        {refLookId && <PaletteMatch currentPalette={palette} refLookId={refLookId}/>}
      </div>
    </div>
  );
}
