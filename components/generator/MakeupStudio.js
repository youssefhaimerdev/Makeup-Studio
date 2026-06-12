"use client";
import { useState } from "react";

/**
 * MakeupStudio v4 — CSS mix-blend-mode approach.
 * Makeup zones are absolutely-positioned divs over the face image.
 * Percentages from face-landmarks.json — scales with any display size.
 * mix-blend-mode handles natural blending with the skin underneath.
 */

// Zone positions as % of image (from verified pixel analysis of 1024x1536 mannequin)
const ZONES = {
  lips:         { top:58.6, left:36.3, width:27.4, height:10.4, blur:3,  blend:"multiply"   },
  blushLeft:    { top:46.0, left:16.0, width:20.0, height:13.0, blur:22, blend:"soft-light" },
  blushRight:   { top:46.0, left:64.0, width:20.0, height:13.0, blur:22, blend:"soft-light" },
  eyeLeft:      { top:32.5, left:31.0, width:13.0, height: 7.0, blur:5,  blend:"multiply"   },
  eyeRight:     { top:32.5, left:56.0, width:13.0, height: 7.0, blur:5,  blend:"multiply"   },
  linerLeft:    { top:34.6, left:32.5, width:11.0, height: 2.2, blur:1,  blend:"multiply"   },
  linerRight:   { top:34.6, left:56.5, width:11.0, height: 2.2, blur:1,  blend:"multiply"   },
  mascLeft:     { top:33.8, left:33.0, width:10.0, height: 1.5, blur:1,  blend:"multiply"   },
  mascRight:    { top:33.8, left:57.0, width:10.0, height: 1.5, blur:1,  blend:"multiply"   },
  contourLeft:  { top:55.0, left:14.0, width:12.0, height:16.0, blur:20, blend:"multiply"   },
  contourRight: { top:55.0, left:74.0, width:12.0, height:16.0, blur:20, blend:"multiply"   },
  hlLeft:       { top:40.0, left:34.0, width:12.0, height: 6.0, blur:12, blend:"screen"     },
  hlRight:      { top:40.0, left:54.0, width:12.0, height: 6.0, blur:12, blend:"screen"     },
  hlNose:       { top:44.0, left:47.5, width: 5.0, height:10.0, blur:10, blend:"screen"     },
};

function Zone({ zone, color, opacity }) {
  if (opacity <= 0) return null;
  const isRadial = zone.blur > 8;
  const bg = isRadial
    ? `radial-gradient(ellipse at center, ${color}ee 0%, ${color}88 45%, ${color}00 100%)`
    : color;
  return (
    <div style={{
      position:        "absolute",
      top:             `${zone.top}%`,
      left:            `${zone.left}%`,
      width:           `${zone.width}%`,
      height:          `${zone.height}%`,
      background:      bg,
      mixBlendMode:    zone.blend,
      opacity:         opacity,
      borderRadius:    "50%",
      filter:          zone.blur > 0 ? `blur(${zone.blur * 0.4}px)` : "none",
      pointerEvents:   "none",
    }}/>
  );
}

const LIP_SHADES  = ["#c4907a","#d4607a","#e8604a","#c02030","#882048","#6a2040","#b07888","#e8809a"];
const BLUSH_SHADES= ["#e89070","#e07080","#e06848","#a05878","#c08050","#985068"];
const EYE_SHADES  = ["#907060","#907090","#404050","#a07030","#602050","#607060","#203060","#c08878"];

const PRESETS = [
  { n:"Soft Glam",    lip:"#d4607a", blush:"#e89070", eye:"#907060", liner:0.88, masc:0.82, hi:0.52, cont:0.38 },
  { n:"Dark Feminine",lip:"#6a2040", blush:"#a05878", eye:"#602050", liner:0.96, masc:0.92, hi:0.30, cont:0.58 },
  { n:"Clean Girl",   lip:"#c4907a", blush:"#e89070", eye:"#c4a882", liner:0.38, masc:0.52, hi:0.65, cont:0.18 },
  { n:"Bold Red",     lip:"#c02030", blush:"#e06848", eye:"#404050", liner:0.92, masc:0.88, hi:0.42, cont:0.44 },
  { n:"No-Makeup",    lip:"#c4907a", blush:"#f0b090", eye:"#c4a882", liner:0.18, masc:0.35, hi:0.48, cont:0.14 },
];

function Toggle({ label, icon, active, onToggle, opacity, onOpacity }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor:"var(--border)" }}>
      <span className="text-lg shrink-0">{icon}</span>
      <span className="text-sm font-semibold font-sans flex-1" style={{ color:"var(--text-primary)" }}>{label}</span>
      {active && (
        <input type="range" min={0} max={1} step={0.05} value={opacity}
          onChange={e=>onOpacity(parseFloat(e.target.value))}
          className="w-24 cursor-pointer accent-rose-500"/>
      )}
      <button onClick={onToggle}
        className="relative w-11 h-6 rounded-full cursor-pointer border-none shrink-0 transition-colors duration-200"
        style={{ background:active?"#e11d48":"var(--border-mid)" }}>
        <span className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
              style={{ left:active?"24px":"4px" }}/>
      </button>
    </div>
  );
}

function Swatches({ shades, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 pt-3">
      {shades.map(hex => (
        <button key={hex} onClick={() => onSelect(hex)}
          className="w-8 h-8 rounded-full cursor-pointer transition-all hover:scale-110 border-2 shrink-0"
          style={{ background:hex, borderColor:selected===hex?"#e11d48":"rgba(255,255,255,0.35)",
                   boxShadow:selected===hex?"0 0 0 2px #e11d48":"none" }}/>
      ))}
      <label title="Custom" className="w-8 h-8 rounded-full border-2 cursor-pointer overflow-hidden shrink-0 relative"
             style={{ borderColor:"var(--border-mid)", background:"conic-gradient(red,yellow,lime,cyan,blue,magenta,red)" }}>
        <input type="color" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          onChange={e=>onSelect(e.target.value)}/>
      </label>
    </div>
  );
}

export default function MakeupStudio() {
  const [tab,   setTab]   = useState("lips");
  const [lip,   setLip]   = useState({ on:false, color:"#d4607a", opacity:0.85 });
  const [blush, setBlush] = useState({ on:false, color:"#e89070", opacity:0.60 });
  const [eye,   setEye]   = useState({ on:false, color:"#907060", opacity:0.72 });
  const [liner, setLiner] = useState({ on:false, opacity:0.88 });
  const [masc,  setMasc]  = useState({ on:false, opacity:0.85 });
  const [cont,  setCont]  = useState({ on:false, opacity:0.42 });
  const [hi,    setHi]    = useState({ on:false, opacity:0.55 });

  function applyPreset(p) {
    setLip  ({ on:true, color:p.lip,   opacity:0.82 });
    setBlush({ on:true, color:p.blush, opacity:0.58 });
    setEye  ({ on:true, color:p.eye,   opacity:0.70 });
    setLiner({ on:true, opacity:p.liner });
    setMasc ({ on:true, opacity:p.masc  });
    setHi   ({ on:true, opacity:p.hi    });
    setCont ({ on:true, opacity:p.cont  });
  }

  function reset() {
    setLip({on:false,color:"#d4607a",opacity:0.85});
    setBlush({on:false,color:"#e89070",opacity:0.60});
    setEye({on:false,color:"#907060",opacity:0.72});
    setLiner({on:false,opacity:0.88}); setMasc({on:false,opacity:0.85});
    setCont({on:false,opacity:0.42}); setHi({on:false,opacity:0.55});
  }

  const TABS = ["lips","eyes","cheeks","sculpt"];

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full">

      {/* ── Face with CSS makeup overlay ─────────────────────────── */}
      <div className="flex flex-col items-center gap-3 shrink-0">
        <div className="relative rounded-2xl overflow-hidden"
             style={{ width:320, boxShadow:"0 12px 48px rgba(0,0,0,0.28)" }}>
          {/* Base face image */}
          <img
            src="/faces/mannequin.png"
            alt="Makeup mannequin"
            style={{ width:"100%", display:"block" }}
            draggable={false}
          />

          {/* Makeup layers — CSS mix-blend-mode */}
          {lip.on   && <Zone zone={ZONES.lips}         color={lip.color}   opacity={lip.opacity}/>}
          {blush.on && <Zone zone={ZONES.blushLeft}    color={blush.color} opacity={blush.opacity}/>}
          {blush.on && <Zone zone={ZONES.blushRight}   color={blush.color} opacity={blush.opacity}/>}
          {eye.on   && <Zone zone={ZONES.eyeLeft}      color={eye.color}   opacity={eye.opacity}/>}
          {eye.on   && <Zone zone={ZONES.eyeRight}     color={eye.color}   opacity={eye.opacity}/>}
          {liner.on && <Zone zone={ZONES.linerLeft}    color="#0a0300"     opacity={liner.opacity}/>}
          {liner.on && <Zone zone={ZONES.linerRight}   color="#0a0300"     opacity={liner.opacity}/>}
          {masc.on  && <Zone zone={ZONES.mascLeft}     color="#060100"     opacity={masc.opacity}/>}
          {masc.on  && <Zone zone={ZONES.mascRight}    color="#060100"     opacity={masc.opacity}/>}
          {cont.on  && <Zone zone={ZONES.contourLeft}  color="#7a4820"     opacity={cont.opacity}/>}
          {cont.on  && <Zone zone={ZONES.contourRight} color="#7a4820"     opacity={cont.opacity}/>}
          {hi.on    && <Zone zone={ZONES.hlLeft}       color="#f8e8b8"     opacity={hi.opacity}/>}
          {hi.on    && <Zone zone={ZONES.hlRight}      color="#f8e8b8"     opacity={hi.opacity}/>}
          {hi.on    && <Zone zone={ZONES.hlNose}       color="#f8f0d0"     opacity={hi.opacity*0.7}/>}
        </div>

        <button onClick={reset}
          className="rounded-full px-5 py-2 text-xs font-bold font-sans cursor-pointer border transition-all hover:border-rose-300 hover:text-rose-500"
          style={{ background:"var(--bg-card)", borderColor:"var(--border)", color:"var(--text-muted)" }}>
          ↺ Reset all
        </button>
      </div>

      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">

        {/* Quick presets */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest font-sans mb-2" style={{ color:"var(--text-muted)" }}>✦ Quick looks</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button key={p.n} onClick={() => applyPreset(p)}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold font-sans cursor-pointer border transition-all hover:border-rose-400 hover:text-rose-600"
                style={{ background:"var(--bg-card)", borderColor:"var(--border)", color:"var(--text-muted)" }}>
                {p.n}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor:"var(--border)" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold font-sans cursor-pointer border-none bg-transparent border-b-2 capitalize transition-all ${tab===t?"border-rose-400 text-rose-600":"border-transparent"}`}
              style={{ color:tab===t?undefined:"var(--text-muted)" }}>
              {t}
            </button>
          ))}
        </div>

        {tab==="lips" && <>
          <Toggle label="Lipstick" icon="💄" active={lip.on} opacity={lip.opacity}
            onToggle={()=>setLip(s=>({...s,on:!s.on}))} onOpacity={v=>setLip(s=>({...s,opacity:v}))}/>
          {lip.on && <Swatches shades={LIP_SHADES} selected={lip.color} onSelect={v=>setLip(s=>({...s,color:v}))}/>}
        </>}

        {tab==="eyes" && <>
          <Toggle label="Eyeshadow" icon="👁"  active={eye.on}   opacity={eye.opacity}
            onToggle={()=>setEye(s=>({...s,on:!s.on}))}   onOpacity={v=>setEye(s=>({...s,opacity:v}))}/>
          {eye.on && <Swatches shades={EYE_SHADES} selected={eye.color} onSelect={v=>setEye(s=>({...s,color:v}))}/>}
          <Toggle label="Eyeliner"  icon="✒" active={liner.on} opacity={liner.opacity}
            onToggle={()=>setLiner(s=>({...s,on:!s.on}))} onOpacity={v=>setLiner(s=>({...s,opacity:v}))}/>
          <Toggle label="Mascara"   icon="🪄"  active={masc.on}  opacity={masc.opacity}
            onToggle={()=>setMasc(s=>({...s,on:!s.on}))}  onOpacity={v=>setMasc(s=>({...s,opacity:v}))}/>
        </>}

        {tab==="cheeks" && <>
          <Toggle label="Blush" icon="🌸" active={blush.on} opacity={blush.opacity}
            onToggle={()=>setBlush(s=>({...s,on:!s.on}))} onOpacity={v=>setBlush(s=>({...s,opacity:v}))}/>
          {blush.on && <Swatches shades={BLUSH_SHADES} selected={blush.color} onSelect={v=>setBlush(s=>({...s,color:v}))}/>}
        </>}

        {tab==="sculpt" && <>
          <Toggle label="Contour"   icon="🌑" active={cont.on} opacity={cont.opacity}
            onToggle={()=>setCont(s=>({...s,on:!s.on}))} onOpacity={v=>setCont(s=>({...s,opacity:v}))}/>
          <Toggle label="Highlight" icon="✨" active={hi.on}   opacity={hi.opacity}
            onToggle={()=>setHi(s=>({...s,on:!s.on}))}   onOpacity={v=>setHi(s=>({...s,opacity:v}))}/>
        </>}
      </div>
    </div>
  );
}
