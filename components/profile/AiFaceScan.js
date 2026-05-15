"use client";
import { useState, useRef, useCallback } from "react";
import { scanFaceFromImage, scanResultToProfile, FEATURE_LABELS } from "@/lib/faceScan";

const STAGES = [
  "Detecting facial landmarks…",
  "Analysing face shape…",
  "Reading skin tone…",
  "Measuring eye features…",
  "Analysing brow and lip shape…",
  "Building your profile…",
];

const ICONS = {
  faceShape:"💎", eyeShape:"👁", skinTone:"✦", undertone:"🌡",
  eyeColor:"🔵", browShape:"〰", lipShape:"💋", hairColor:"💇",
};

const TONE_HEX = {
  fair:"#f5e0cc", light:"#e8c9a8", medium:"#d4a878",
  tan:"#b8854e", deep:"#8c5c32", rich:"#5a3518",
};

function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  const col = pct > 88 ? "#16a34a" : pct > 72 ? "#e11d48" : "#f59e0b";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background:"var(--border)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background:col }}/>
      </div>
      <span className="text-[10px] font-bold font-sans shrink-0" style={{ color:col }}>{pct}%</span>
    </div>
  );
}

function ScannerOverlay({ stage }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
         style={{ background:"rgba(0,0,0,0.65)", backdropFilter:"blur(4px)" }}>
      <div className="relative w-28 h-28 mb-5">
        <svg viewBox="0 0 112 112" width="112" height="112">
          <circle cx="56" cy="56" r="50" fill="none" stroke="rgba(251,113,133,0.2)" strokeWidth="3"/>
          <circle cx="56" cy="56" r="50" fill="none" stroke="#fb7185" strokeWidth="3"
                  strokeLinecap="round" strokeDasharray="60 254"
                  className="animate-spin" style={{ animationDuration:"1.8s", transformOrigin:"56px 56px" }}/>
          <circle cx="56" cy="56" r="50" fill="none" stroke="#b87aaa" strokeWidth="2"
                  strokeLinecap="round" strokeDasharray="30 254"
                  className="animate-spin" style={{ animationDuration:"2.8s", animationDirection:"reverse", transformOrigin:"56px 56px" }}/>
        </svg>
        {/* Corner brackets */}
        {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy],i)=>(
          <svg key={i} className="absolute" width="16" height="16"
               style={{ left:sx<0?4:"auto", right:sx>0?4:"auto", top:sy<0?4:"auto", bottom:sy>0?4:"auto" }}
               viewBox="0 0 16 16">
            <path d={`M${sx<0?0:16} ${sy<0?0:16} V${sy<0?7:9} M${sx<0?0:16} ${sy<0?0:16} H${sx<0?7:9}`}
                  stroke="#fb7185" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          </svg>
        ))}
        {/* Face mesh dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 60 72" width="48" height="58">
            <ellipse cx="30" cy="36" rx="20" ry="26" fill="none" stroke="rgba(251,113,133,0.5)" strokeWidth="1" strokeDasharray="3 2"/>
            {[[30,18],[16,30],[44,30],[22,24],[38,24],[30,38],[30,52]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="1.5" fill="#fb7185" opacity={0.4+Math.random()*0.4}/>
            ))}
            <line x1="10" y1="36" x2="50" y2="36" stroke="rgba(251,113,133,0.3)" strokeWidth="0.8" strokeDasharray="2 2"/>
            <line x1="30" y1="10" x2="30" y2="62" stroke="rgba(251,113,133,0.3)" strokeWidth="0.8" strokeDasharray="2 2"/>
          </svg>
        </div>
      </div>
      <p className="text-white font-serif text-base font-bold mb-1">Scanning</p>
      <p className="text-rose-300 text-xs font-sans animate-pulse px-8 text-center">
        {STAGES[Math.min(stage, STAGES.length-1)]}
      </p>
      <div className="flex gap-1.5 mt-4">
        {STAGES.map((_,i)=>(
          <div key={i} className="rounded-full transition-all duration-300"
               style={{ width:i<=stage?8:6, height:i<=stage?8:6, background:i<=stage?"#fb7185":"rgba(255,255,255,0.2)" }}/>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ result, onApply, onRescan }) {
  const skinHex = result.skinToneHex || TONE_HEX[result.skinTone] || "#e8c9a8";
  const features = [
    { key:"faceShape",  label:"Face Shape",   value: FEATURE_LABELS.faceShape[result.faceShape]  || result.faceShape,  icon:"💎" },
    { key:"eyeShape",   label:"Eye Shape",    value: FEATURE_LABELS.eyeShape[result.eyeShape]    || result.eyeShape,   icon:"👁" },
    { key:"undertone",  label:"Undertone",    value: FEATURE_LABELS.undertone[result.undertone]  || result.undertone,  icon:"🌡" },
    { key:"eyeColor",   label:"Eye Colour",   value: result.eyeColor?.replace("_"," "),                                icon:"🔵" },
    { key:"browShape",  label:"Brow Shape",   value: result.browShape?.replace("_"," "),                               icon:"〰" },
    { key:"lipShape",   label:"Lip Shape",    value: result.lipShape,                                                  icon:"💋" },
    { key:"hairColor",  label:"Hair Colour",  value: result.hairColor?.replace(/_/g," "),                              icon:"💇" },
  ];
  return (
    <div className="flex flex-col gap-4">
      {/* Skin tone hero */}
      <div className="rounded-2xl p-5 border" style={{ background:`linear-gradient(135deg, ${skinHex}22, var(--bg-card))`, borderColor:`${skinHex}44` }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-white shadow-lg shrink-0"
               style={{ background:skinHex }}/>
          <div>
            <p className="text-[10px] font-bold font-sans uppercase tracking-widest mb-0.5" style={{ color:"var(--text-muted)" }}>Skin Tone Detected</p>
            <p className="font-serif text-xl font-bold capitalize" style={{ color:"var(--text-primary)" }}>{result.skinTone}</p>
            <p className="text-xs font-sans" style={{ color:"var(--text-muted)" }}>{result.skinToneHex?.toUpperCase()}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] font-sans uppercase tracking-wide mb-1" style={{ color:"var(--text-faint)" }}>Confidence</p>
            <div className="w-24"><ConfidenceBar value={result.confidence?.skinTone || 0.9}/></div>
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {features.map(f => (
          <div key={f.key} className="flex items-start gap-3 px-3.5 py-3 rounded-xl border"
               style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}>
            <span className="text-lg shrink-0 mt-0.5">{f.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold font-sans uppercase tracking-widest" style={{ color:"var(--text-faint)" }}>{f.label}</p>
              <p className="text-sm font-semibold font-sans capitalize leading-snug" style={{ color:"var(--text-primary)" }}>{f.value || "—"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Confidence scores */}
      {result.confidence && (
        <div className="p-4 rounded-xl border" style={{ background:"var(--bg-subtle)", borderColor:"var(--border)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest font-sans mb-3" style={{ color:"var(--text-muted)" }}>Measurement confidence</p>
          <div className="flex flex-col gap-2">
            {[["Face Shape",result.confidence.faceShape],["Skin Tone",result.confidence.skinTone],["Eye Shape",result.confidence.eyeShape]].map(([label,val])=>(
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs font-sans w-20 shrink-0" style={{ color:"var(--text-muted)" }}>{label}</span>
                <div className="flex-1"><ConfidenceBar value={val||0.8}/></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onApply} className="btn-primary flex-1 justify-center">
          ✓ Apply to My Profile
        </button>
        <button onClick={onRescan}
          className="rounded-full px-5 py-2.5 text-sm font-semibold font-sans cursor-pointer border transition-all"
          style={{ background:"var(--bg-card)", borderColor:"var(--border)", color:"var(--text-muted)" }}>
          Rescan
        </button>
      </div>
    </div>
  );
}

export default function AiFaceScan({ onApply }) {
  const [phase,     setPhase]     = useState("idle");
  const [stage,     setStage]     = useState(0);
  const [preview,   setPreview]   = useState(null);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState("");
  const [dragOver,  setDragOver]  = useState(false);
  const imgRef  = useRef(null);
  const fileRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file?.type.startsWith("image/")) { setError("Please upload a photo — JPG, PNG, or HEIC."); return; }
    if (file.size > 15 * 1024 * 1024) { setError("Photo is too large — please use one under 15MB."); return; }

    setError(""); setPhase("scanning"); setStage(0);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    const img = new window.Image();
    img.onload = async () => {
      imgRef.current = img;
      let stageIdx = 0;
      const timer = setInterval(() => { stageIdx = Math.min(stageIdx+1, STAGES.length-1); setStage(stageIdx); }, 800);
      try {
        const scanResult = await scanFaceFromImage(img);
        clearInterval(timer); setStage(STAGES.length-1);
        await new Promise(r => setTimeout(r, 400));
        setResult(scanResult); setPhase("done");
      } catch(err) {
        clearInterval(timer);
        setError(err.message || "Scan failed — please try a clear, front-facing, well-lit photo.");
        setPhase("error"); setStage(0);
      }
    };
    img.onerror = () => { setError("Could not load image — please try a different file."); setPhase("error"); };
    img.src = previewUrl;
  }, []);

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleApply() {
    if (!result) return;
    onApply(scanResultToProfile(result));
  }

  function reset() { setPhase("idle"); setPreview(null); setResult(null); setError(""); setStage(0); }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor:"var(--border)" }}>
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3"
           style={{ background:"linear-gradient(135deg,#fff1f2,#f8f2f7)", borderColor:"var(--border)" }}>
        <span className="text-2xl">🤳</span>
        <div>
          <h3 className="font-serif text-lg font-bold" style={{ color:"var(--text-primary)" }}>AI Face Scan</h3>
          <p className="text-xs font-sans" style={{ color:"var(--text-muted)" }}>
            Upload a selfie → 468 landmarks detected → instant profile. No data leaves your device.
          </p>
        </div>
      </div>

      <div className="p-5">
        {/* Idle / upload zone */}
        {(phase === "idle" || phase === "error") && (
          <div className="flex flex-col gap-4">
            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className="relative rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-3 py-10"
              style={{ borderColor: dragOver ? "#fb7185" : "var(--border-mid)", background: dragOver ? "#fff1f2" : "var(--bg-secondary)" }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                   style={{ background:"var(--bg-card)" }}>🤳</div>
              <div className="text-center">
                <p className="font-serif text-base font-bold mb-0.5" style={{ color:"var(--text-primary)" }}>
                  Drop a selfie here
                </p>
                <p className="text-xs font-sans" style={{ color:"var(--text-muted)" }}>or tap to choose from your camera roll</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Front-facing","Good lighting","No filters","No sunglasses"].map(tip => (
                  <span key={tip} className="pill bg-rose-50 text-rose-500">{tip}</span>
                ))}
              </div>
              <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden"
                     onChange={e => e.target.files?.[0] && processFile(e.target.files[0])}/>
            </div>

            {error && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50">
                <span className="text-lg shrink-0">⚠️</span>
                <p className="text-sm font-sans text-red-700">{error}</p>
              </div>
            )}

            {/* Tips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { emoji:"☀️", tip:"Use natural light" },
                { emoji:"📐", tip:"Face the camera directly" },
                { emoji:"🚫", tip:"Remove glasses if possible" },
                { emoji:"😐", tip:"Neutral expression" },
              ].map(t => (
                <div key={t.tip} className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center"
                     style={{ background:"var(--bg-card)", border:`1px solid var(--border)` }}>
                  <span className="text-xl">{t.emoji}</span>
                  <p className="text-[11px] font-sans" style={{ color:"var(--text-muted)" }}>{t.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scanning */}
        {phase === "scanning" && (
          <div className="relative rounded-2xl overflow-hidden" style={{ minHeight:280 }}>
            {preview && <img src={preview} alt="" className="w-full object-cover rounded-2xl" style={{ maxHeight:320, objectPosition:"top" }}/>}
            <ScannerOverlay stage={stage}/>
          </div>
        )}

        {/* Done */}
        {phase === "done" && result && (
          <div className="flex flex-col gap-4">
            {/* Preview thumbnail */}
            {preview && (
              <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background:"var(--bg-subtle)", borderColor:"var(--border)" }}>
                <img src={preview} alt="Your selfie" className="w-12 h-12 rounded-xl object-cover object-top shrink-0"/>
                <div>
                  <p className="text-xs font-bold font-sans" style={{ color:"var(--text-primary)" }}>Scan complete ✓</p>
                  <p className="text-[11px] font-sans" style={{ color:"var(--text-muted)" }}>
                    {Object.keys(result).filter(k => k !== "confidence" && k !== "rawMeasurements").length} features detected
                  </p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-green-500 shrink-0"/>
              </div>
            )}
            <ResultCard result={result} onApply={handleApply} onRescan={reset}/>
          </div>
        )}
      </div>
    </div>
  );
}
