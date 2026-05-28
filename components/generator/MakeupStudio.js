"use client";
import { useRef, useState, useEffect } from "react";
import { useMakeupEngine } from "./MakeupEngine";

const LIP_SHADES = [
  { name:"Nude",        hex:"#c4907a" },
  { name:"Rose",        hex:"#d4607a" },
  { name:"Coral",       hex:"#e8604a" },
  { name:"Red",         hex:"#c02030" },
  { name:"Berry",       hex:"#882048" },
  { name:"Plum",        hex:"#6a2040" },
  { name:"Mauve",       hex:"#b07888" },
  { name:"Pink",        hex:"#e8809a" },
];
const BLUSH_SHADES = [
  { name:"Peach",       hex:"#e89070" },
  { name:"Rose",        hex:"#e07080" },
  { name:"Coral",       hex:"#e06848" },
  { name:"Plum",        hex:"#a05878" },
  { name:"Bronze",      hex:"#c08050" },
  { name:"Berry",       hex:"#985068" },
];
const EYE_SHADES = [
  { name:"Taupe",       hex:"#907060" },
  { name:"Mauve",       hex:"#907090" },
  { name:"Smoky",       hex:"#404050" },
  { name:"Bronze",      hex:"#a07030" },
  { name:"Plum",        hex:"#602050" },
  { name:"Sage",        hex:"#607060" },
  { name:"Navy",        hex:"#203060" },
  { name:"Rose Gold",   hex:"#c08878" },
];

function SwatchRow({ label, shades, selected, onSelect, showOpacity, opacity, onOpacity }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold font-sans uppercase tracking-widest" style={{ color:"var(--text-muted)" }}>{label}</p>
        {showOpacity && (
          <input type="range" min={0} max={1} step={0.05} value={opacity}
            onChange={e => onOpacity(parseFloat(e.target.value))}
            className="w-24 accent-rose-500 cursor-pointer"/>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {shades.map(s => (
          <button key={s.hex} onClick={() => onSelect(s.hex)}
            title={s.name}
            className="w-8 h-8 rounded-full border-2 cursor-pointer transition-all hover:scale-110"
            style={{ background: s.hex, borderColor: selected===s.hex ? "#e11d48" : "rgba(255,255,255,0.5)", boxShadow: selected===s.hex ? "0 0 0 2px #e11d48" : "none" }}/>
        ))}
        {/* Custom color */}
        <label title="Custom colour" className="w-8 h-8 rounded-full border-2 cursor-pointer flex items-center justify-center text-xs overflow-hidden"
               style={{ borderColor:"var(--border-mid)", background:"conic-gradient(red,yellow,lime,cyan,blue,magenta,red)" }}>
          <input type="color" className="opacity-0 absolute w-0 h-0"
            onChange={e => onSelect(e.target.value)}/>
        </label>
      </div>
    </div>
  );
}

function ToggleRow({ label, active, opacity, onToggle, onOpacity, icon }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b" style={{ borderColor:"var(--border)" }}>
      <span className="text-base shrink-0">{icon}</span>
      <span className="text-sm font-semibold font-sans flex-1" style={{ color:"var(--text-primary)" }}>{label}</span>
      {active && (
        <input type="range" min={0} max={1} step={0.05} value={opacity}
          onChange={e => onOpacity(parseFloat(e.target.value))}
          className="w-20 accent-rose-500 cursor-pointer"/>
      )}
      <button onClick={onToggle}
        className="w-10 h-5 rounded-full transition-all cursor-pointer border-none relative"
        style={{ background: active ? "#e11d48" : "var(--border-mid)" }}>
        <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
              style={{ left: active ? "22px" : "2px" }}/>
      </button>
    </div>
  );
}

export default function MakeupStudio() {
  const canvasRef = useRef(null);
  const engine    = useMakeupEngine(canvasRef);

  const [lipColor,     setLipColor]     = useState("#d4607a");
  const [lipOpacity,   setLipOpacity]   = useState(0.85);
  const [lipOn,        setLipOn]        = useState(false);

  const [blushColor,   setBlushColor]   = useState("#e89070");
  const [blushOpacity, setBlushOpacity] = useState(0.6);
  const [blushOn,      setBlushOn]      = useState(false);

  const [eyeColor,     setEyeColor]     = useState("#907060");
  const [eyeOpacity,   setEyeOpacity]   = useState(0.75);
  const [eyeOn,        setEyeOn]        = useState(false);

  const [eyelinerOn,   setEyelinerOn]   = useState(false);
  const [eyelinerOp,   setEyelinerOp]   = useState(0.9);

  const [mascaraOn,    setMascaraOn]    = useState(false);
  const [mascaraOp,    setMascaraOp]    = useState(0.85);

  const [contourOn,    setContourOn]    = useState(false);
  const [contourOp,    setContourOp]    = useState(0.45);

  const [highlightOn,  setHighlightOn]  = useState(false);
  const [highlightOp,  setHighlightOp]  = useState(0.55);

  const [tab, setTab] = useState("eyes");

  // Sync everything to engine
  useEffect(() => { engine.applyLipstick(lipColor, lipOn ? lipOpacity : 0); }, [lipColor, lipOpacity, lipOn, engine.ready]);
  useEffect(() => { engine.applyBlush(blushColor, blushOn ? blushOpacity : 0); }, [blushColor, blushOpacity, blushOn, engine.ready]);
  useEffect(() => { engine.applyEyeshadow(eyeColor, eyeOn ? eyeOpacity : 0); }, [eyeColor, eyeOpacity, eyeOn, engine.ready]);
  useEffect(() => { engine.applyEyeliner(eyelinerOn ? eyelinerOp : 0); }, [eyelinerOn, eyelinerOp, engine.ready]);
  useEffect(() => { engine.applyMascara(mascaraOn ? mascaraOp : 0); }, [mascaraOn, mascaraOp, engine.ready]);
  useEffect(() => { engine.applyContour("#8a5030", contourOn ? contourOp : 0); }, [contourOn, contourOp, engine.ready]);
  useEffect(() => { engine.applyHighlight(highlightOn ? highlightOp : 0); }, [highlightOn, highlightOp, engine.ready]);

  function handleReset() {
    setLipOn(false); setBlushOn(false); setEyeOn(false);
    setEyelinerOn(false); setMascaraOn(false);
    setContourOn(false); setHighlightOn(false);
    engine.reset();
  }

  const TABS = ["eyes","cheeks","lips","sculpt"];

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">

      {/* ── Face canvas ─────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 shrink-0">
        <div className="relative" style={{ borderRadius:16, overflow:"hidden", boxShadow:"0 12px 48px rgba(0,0,0,0.22)" }}>
          {engine.loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 rounded-2xl"
                 style={{ background:"var(--bg-subtle)" }}>
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-rose-400 border-t-transparent rounded-full animate-spin"/>
                <p className="text-sm font-sans" style={{ color:"var(--text-muted)" }}>Loading face…</p>
              </div>
            </div>
          )}
          <canvas ref={canvasRef}
            style={{ width:"100%", maxWidth:360, display:"block",
                     aspectRatio:"1024/1536", imageRendering:"auto" }}/>
        </div>

        {/* Reset button */}
        <button onClick={handleReset}
          className="rounded-full px-5 py-2 text-xs font-bold font-sans cursor-pointer border transition-all"
          style={{ background:"var(--bg-card)", borderColor:"var(--border)", color:"var(--text-muted)" }}>
          ↺ Reset all makeup
        </button>
      </div>

      {/* ── Controls ────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Tab bar */}
        <div className="flex gap-0 border-b mb-5" style={{ borderColor:"var(--border)" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold font-sans cursor-pointer border-none bg-transparent border-b-2 capitalize transition-all ${tab===t?"border-rose-400 text-rose-600":"border-transparent"}`}
              style={{ color: tab===t ? undefined : "var(--text-muted)" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Eyes tab */}
        {tab === "eyes" && (
          <div>
            <ToggleRow label="Eyeshadow" icon="👁" active={eyeOn} opacity={eyeOpacity}
              onToggle={() => setEyeOn(v=>!v)} onOpacity={setEyeOpacity}/>
            {eyeOn && <div className="pt-3 pb-2">
              <SwatchRow label="Eyeshadow shade" shades={EYE_SHADES} selected={eyeColor}
                onSelect={setEyeColor} showOpacity={false} opacity={eyeOpacity} onOpacity={setEyeOpacity}/>
            </div>}
            <ToggleRow label="Eyeliner" icon="✒" active={eyelinerOn} opacity={eyelinerOp}
              onToggle={() => setEyelinerOn(v=>!v)} onOpacity={setEyelinerOp}/>
            <ToggleRow label="Mascara" icon="🪄" active={mascaraOn} opacity={mascaraOp}
              onToggle={() => setMascaraOn(v=>!v)} onOpacity={setMascaraOp}/>
          </div>
        )}

        {/* Cheeks tab */}
        {tab === "cheeks" && (
          <div>
            <ToggleRow label="Blush" icon="🌸" active={blushOn} opacity={blushOpacity}
              onToggle={() => setBlushOn(v=>!v)} onOpacity={setBlushOpacity}/>
            {blushOn && <div className="pt-3 pb-2">
              <SwatchRow label="Blush shade" shades={BLUSH_SHADES} selected={blushColor}
                onSelect={setBlushColor} showOpacity={false} opacity={blushOpacity} onOpacity={setBlushOpacity}/>
            </div>}
          </div>
        )}

        {/* Lips tab */}
        {tab === "lips" && (
          <div>
            <ToggleRow label="Lipstick" icon="💄" active={lipOn} opacity={lipOpacity}
              onToggle={() => setLipOn(v=>!v)} onOpacity={setLipOpacity}/>
            {lipOn && <div className="pt-3 pb-2">
              <SwatchRow label="Lip shade" shades={LIP_SHADES} selected={lipColor}
                onSelect={setLipColor} showOpacity={false} opacity={lipOpacity} onOpacity={setLipOpacity}/>
            </div>}
          </div>
        )}

        {/* Sculpt tab */}
        {tab === "sculpt" && (
          <div>
            <ToggleRow label="Contour" icon="🌑" active={contourOn} opacity={contourOp}
              onToggle={() => setContourOn(v=>!v)} onOpacity={setContourOp}/>
            <ToggleRow label="Highlight" icon="✨" active={highlightOn} opacity={highlightOp}
              onToggle={() => setHighlightOn(v=>!v)} onOpacity={setHighlightOp}/>
          </div>
        )}

        {/* Quick full-look presets */}
        <div className="mt-6 pt-5 border-t" style={{ borderColor:"var(--border)" }}>
          <p className="text-xs font-bold uppercase tracking-widest font-sans mb-3" style={{ color:"var(--text-muted)" }}>
            ✦ Quick looks
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { name:"Soft Glam",    lip:"#d4607a", blush:"#e89070", eye:"#907060", liner:0.85, mascara:0.8, hi:0.5 },
              { name:"Dark Feminine",lip:"#6a2040", blush:"#a05878", eye:"#602050", liner:0.95, mascara:0.9, hi:0.3 },
              { name:"Clean Girl",   lip:"#c4907a", blush:"#e89070", eye:"#907060", liner:0.4,  mascara:0.6, hi:0.65 },
              { name:"Bold Red",     lip:"#c02030", blush:"#e06848", eye:"#404050", liner:0.9,  mascara:0.85,hi:0.4 },
              { name:"No-Makeup",    lip:"#c4907a", blush:"#e89070", eye:"#907060", liner:0.2,  mascara:0.4, hi:0.45 },
            ].map(preset => (
              <button key={preset.name}
                onClick={() => {
                  setLipColor(preset.lip); setLipOpacity(0.82); setLipOn(true);
                  setBlushColor(preset.blush); setBlushOpacity(0.55); setBlushOn(true);
                  setEyeColor(preset.eye); setEyeOpacity(0.72); setEyeOn(true);
                  setEyelinerOn(true); setEyelinerOp(preset.liner);
                  setMascaraOn(true); setMascaraOp(preset.mascara);
                  setHighlightOn(true); setHighlightOp(preset.hi);
                  setContourOn(true); setContourOp(0.38);
                }}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold font-sans cursor-pointer border transition-all hover:border-rose-300 hover:text-rose-600"
                style={{ background:"var(--bg-card)", borderColor:"var(--border)", color:"var(--text-muted)" }}>
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
