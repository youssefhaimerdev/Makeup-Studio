"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useMakeupEngine } from "./MakeupEngine";

const LIP_SHADES = [
  { name:"Nude",   hex:"#c4907a" }, { name:"Rose",   hex:"#d4607a" },
  { name:"Coral",  hex:"#e8604a" }, { name:"Red",    hex:"#c02030" },
  { name:"Berry",  hex:"#882048" }, { name:"Plum",   hex:"#6a2040" },
  { name:"Mauve",  hex:"#b07888" }, { name:"Pink",   hex:"#e8809a" },
];
const BLUSH_SHADES = [
  { name:"Peach",  hex:"#e89070" }, { name:"Rose",   hex:"#e07080" },
  { name:"Coral",  hex:"#e06848" }, { name:"Plum",   hex:"#a05878" },
  { name:"Bronze", hex:"#c08050" }, { name:"Berry",  hex:"#985068" },
];
const EYE_SHADES = [
  { name:"Taupe",     hex:"#907060" }, { name:"Mauve",    hex:"#907090" },
  { name:"Smoky",     hex:"#404050" }, { name:"Bronze",   hex:"#a07030" },
  { name:"Plum",      hex:"#602050" }, { name:"Sage",     hex:"#607060" },
  { name:"Navy",      hex:"#203060" }, { name:"Rose Gold", hex:"#c08878" },
];

const PRESETS = [
  { name:"Soft Glam",    lip:"#d4607a", blush:"#e89070", eye:"#907060", eyeliner:0.85, mascara:0.80, highlight:0.50, contour:0.38 },
  { name:"Dark Feminine",lip:"#6a2040", blush:"#a05878", eye:"#602050", eyeliner:0.95, mascara:0.90, highlight:0.30, contour:0.55 },
  { name:"Clean Girl",   lip:"#c4907a", blush:"#e89070", eye:"#907060", eyeliner:0.40, mascara:0.55, highlight:0.65, contour:0.22 },
  { name:"Bold Red",     lip:"#c02030", blush:"#e06848", eye:"#404050", eyeliner:0.90, mascara:0.85, highlight:0.40, contour:0.42 },
  { name:"No-Makeup",    lip:"#c4907a", blush:"#e89070", eye:"#907060", eyeliner:0.20, mascara:0.38, highlight:0.45, contour:0.18 },
];

function Swatch({ hex, selected, onClick, label }) {
  return (
    <button onClick={() => onClick(hex)} title={label}
      className="w-8 h-8 rounded-full cursor-pointer transition-all hover:scale-110 border-2"
      style={{ background:hex, borderColor:selected===hex?"#e11d48":"rgba(255,255,255,0.4)",
               boxShadow:selected===hex?"0 0 0 2px #e11d48, 0 2px 8px rgba(0,0,0,0.2)":"0 1px 4px rgba(0,0,0,0.15)" }}/>
  );
}

function Toggle({ label, icon, active, onToggle, opacity, onOpacity }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor:"var(--border)" }}>
      <span className="text-lg shrink-0">{icon}</span>
      <span className="text-sm font-semibold font-sans flex-1" style={{ color:"var(--text-primary)" }}>{label}</span>
      {active && (
        <input type="range" min={0} max={1} step={0.05} value={opacity}
          onChange={e => onOpacity(parseFloat(e.target.value))}
          className="w-24 cursor-pointer accent-rose-500"/>
      )}
      <button onClick={onToggle}
        className="relative w-11 h-6 rounded-full cursor-pointer border-none shrink-0 transition-colors"
        style={{ background:active?"#e11d48":"var(--border-mid)" }}>
        <span className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
              style={{ left:active?"24px":"4px" }}/>
      </button>
    </div>
  );
}

export default function MakeupStudio() {
  const canvasRef = useRef(null);
  const engine    = useMakeupEngine(canvasRef);
  const [tab, setTab] = useState("lips");

  // Makeup state
  const [lip,  setLip]  = useState({ on:false, color:"#d4607a", opacity:0.85 });
  const [blush,setBlush]= useState({ on:false, color:"#e89070", opacity:0.60 });
  const [eye,  setEye]  = useState({ on:false, color:"#907060", opacity:0.72 });
  const [liner,setLiner]= useState({ on:false, opacity:0.88 });
  const [masc, setMasc] = useState({ on:false, opacity:0.85 });
  const [cont, setCont] = useState({ on:false, opacity:0.40 });
  const [hi,   setHi]   = useState({ on:false, opacity:0.52 });

  // Sync to engine whenever state changes
  useEffect(() => { if(engine.ready) engine.applyLipstick(lip.color,   lip.on   ? lip.opacity   : 0); }, [lip,   engine.ready]);   // eslint-disable-line
  useEffect(() => { if(engine.ready) engine.applyBlush(blush.color,    blush.on ? blush.opacity : 0); }, [blush, engine.ready]);   // eslint-disable-line
  useEffect(() => { if(engine.ready) engine.applyEyeshadow(eye.color,  eye.on   ? eye.opacity   : 0); }, [eye,   engine.ready]);   // eslint-disable-line
  useEffect(() => { if(engine.ready) engine.applyEyeliner(liner.on     ? liner.opacity           : 0); }, [liner, engine.ready]);  // eslint-disable-line
  useEffect(() => { if(engine.ready) engine.applyMascara(masc.on       ? masc.opacity            : 0); }, [masc,  engine.ready]);  // eslint-disable-line
  useEffect(() => { if(engine.ready) engine.applyContour("#8a5030", cont.on ? cont.opacity       : 0); }, [cont,  engine.ready]);  // eslint-disable-line
  useEffect(() => { if(engine.ready) engine.applyHighlight(hi.on        ? hi.opacity             : 0); }, [hi,    engine.ready]);  // eslint-disable-line

  function applyPreset(p) {
    setLip  ({ on:true, color:p.lip,   opacity:0.82 });
    setBlush({ on:true, color:p.blush, opacity:0.58 });
    setEye  ({ on:true, color:p.eye,   opacity:0.72 });
    setLiner({ on:true, opacity:p.eyeliner  });
    setMasc ({ on:true, opacity:p.mascara   });
    setHi   ({ on:true, opacity:p.highlight });
    setCont ({ on:true, opacity:p.contour   });
  }

  function reset() {
    setLip  ({ on:false, color:"#d4607a", opacity:0.85 });
    setBlush({ on:false, color:"#e89070", opacity:0.60 });
    setEye  ({ on:false, color:"#907060", opacity:0.72 });
    setLiner({ on:false, opacity:0.88 });
    setMasc ({ on:false, opacity:0.85 });
    setCont ({ on:false, opacity:0.40 });
    setHi   ({ on:false, opacity:0.52 });
    engine.reset();
  }

  const TABS = ["lips","eyes","cheeks","sculpt"];

  if (engine.error) return (
    <div className="text-center py-10">
      <p className="text-sm font-sans text-rose-500">Could not load makeup engine: {engine.error}</p>
      <p className="text-xs font-sans mt-1" style={{ color:"var(--text-muted)" }}>Make sure the public/faces and public/masks folders are deployed.</p>
    </div>
  );

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full">

      {/* ── Canvas ───────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 shrink-0">
        <div className="relative rounded-2xl overflow-hidden"
             style={{ boxShadow:"0 12px 48px rgba(0,0,0,0.22)", lineHeight:0 }}>
          {engine.loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-2xl"
                 style={{ background:"var(--bg-card)" }}>
              <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin mb-3"/>
              <p className="text-xs font-sans" style={{ color:"var(--text-muted)" }}>Loading face…</p>
            </div>
          )}
          <canvas ref={canvasRef}
            style={{ display:"block", width:320, height:480,
                     borderRadius:16, background:"#111" }}/>
        </div>
        <button onClick={reset}
          className="rounded-full px-5 py-2 text-xs font-bold font-sans cursor-pointer border transition-all hover:border-rose-300 hover:text-rose-500"
          style={{ background:"var(--bg-card)", borderColor:"var(--border)", color:"var(--text-muted)" }}>
          ↺ Reset all
        </button>
      </div>

      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">

        {/* Quick preset looks */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest font-sans mb-2" style={{ color:"var(--text-muted)" }}>✦ Quick looks</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button key={p.name} onClick={() => applyPreset(p)}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold font-sans cursor-pointer border transition-all hover:border-rose-400 hover:text-rose-600"
                style={{ background:"var(--bg-card)", borderColor:"var(--border)", color:"var(--text-muted)" }}>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b" style={{ borderColor:"var(--border)" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold font-sans cursor-pointer border-none bg-transparent border-b-2 capitalize transition-all ${tab===t?"border-rose-400 text-rose-600":"border-transparent"}`}
              style={{ color:tab===t?undefined:"var(--text-muted)" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Lips */}
        {tab==="lips" && (
          <div>
            <Toggle label="Lipstick" icon="💄" active={lip.on} opacity={lip.opacity}
              onToggle={() => setLip(s=>({...s,on:!s.on}))} onOpacity={v=>setLip(s=>({...s,opacity:v}))}/>
            {lip.on && (
              <div className="flex flex-wrap gap-2 pt-3">
                {LIP_SHADES.map(s=><Swatch key={s.hex} hex={s.hex} label={s.name} selected={lip.color} onClick={v=>setLip(p=>({...p,color:v}))}/>)}
                <label className="w-8 h-8 rounded-full border-2 cursor-pointer overflow-hidden relative" style={{ borderColor:"var(--border-mid)" }}
                       title="Custom colour">
                  <div className="w-full h-full" style={{ background:"conic-gradient(red,yellow,lime,cyan,blue,magenta,red)" }}/>
                  <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={e=>setLip(p=>({...p,color:e.target.value}))}/>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Eyes */}
        {tab==="eyes" && (
          <div>
            <Toggle label="Eyeshadow" icon="👁" active={eye.on} opacity={eye.opacity}
              onToggle={()=>setEye(s=>({...s,on:!s.on}))} onOpacity={v=>setEye(s=>({...s,opacity:v}))}/>
            {eye.on && (
              <div className="flex flex-wrap gap-2 pt-3 pb-3">
                {EYE_SHADES.map(s=><Swatch key={s.hex} hex={s.hex} label={s.name} selected={eye.color} onClick={v=>setEye(p=>({...p,color:v}))}/>)}
              </div>
            )}
            <Toggle label="Eyeliner" icon="✒" active={liner.on} opacity={liner.opacity}
              onToggle={()=>setLiner(s=>({...s,on:!s.on}))} onOpacity={v=>setLiner(s=>({...s,opacity:v}))}/>
            <Toggle label="Mascara" icon="🪄" active={masc.on} opacity={masc.opacity}
              onToggle={()=>setMasc(s=>({...s,on:!s.on}))} onOpacity={v=>setMasc(s=>({...s,opacity:v}))}/>
          </div>
        )}

        {/* Cheeks */}
        {tab==="cheeks" && (
          <div>
            <Toggle label="Blush" icon="🌸" active={blush.on} opacity={blush.opacity}
              onToggle={()=>setBlush(s=>({...s,on:!s.on}))} onOpacity={v=>setBlush(s=>({...s,opacity:v}))}/>
            {blush.on && (
              <div className="flex flex-wrap gap-2 pt-3">
                {BLUSH_SHADES.map(s=><Swatch key={s.hex} hex={s.hex} label={s.name} selected={blush.color} onClick={v=>setBlush(p=>({...p,color:v}))}/>)}
              </div>
            )}
          </div>
        )}

        {/* Sculpt */}
        {tab==="sculpt" && (
          <div>
            <Toggle label="Contour" icon="🌑" active={cont.on} opacity={cont.opacity}
              onToggle={()=>setCont(s=>({...s,on:!s.on}))} onOpacity={v=>setCont(s=>({...s,opacity:v}))}/>
            <Toggle label="Highlight" icon="✨" active={hi.on} opacity={hi.opacity}
              onToggle={()=>setHi(s=>({...s,on:!s.on}))} onOpacity={v=>setHi(s=>({...s,opacity:v}))}/>
          </div>
        )}
      </div>
    </div>
  );
}
