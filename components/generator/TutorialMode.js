"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Tutorial Mode — hands-free step-by-step overlay.
 * Displays one step at a time with an optional countdown timer.
 * Voice announcement via Web Speech API if available.
 */

function useCountdown(seconds, onDone) {
  const [remaining, setRemaining] = useState(seconds);
  const [running,   setRunning]   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setRemaining(seconds);
    setRunning(false);
  }, [seconds]);

  useEffect(() => {
    if (!running) { clearInterval(ref.current); return; }
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(ref.current); setRunning(false); onDone?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running, onDone]);

  return { remaining, running, start: () => setRunning(true), pause: () => setRunning(false), reset: () => { setRunning(false); setRemaining(seconds); } };
}

// Estimated seconds per category
const STEP_DURATIONS = {
  "Skincare Prep": 60, "Primer": 45, "Foundation": 90, "Concealer": 60,
  "Color Corrector": 45, "Setting Powder": 45, "Setting Spray": 20,
  "Blush": 30, "Blush Stick": 30, "Cream Blush": 30,
  "Bronzer": 30, "Cream Bronzer": 30, "Contour": 45, "Highlighter": 20,
  "Eyeshadow": 120, "Eyeliner": 60, "Mascara": 45,
  "Eyebrow": 60, "Brow Lamination Gel": 30, "Brow Soap": 20,
  "Lipstick": 30, "Lip Gloss": 15, "Lip Oil": 15, "Lip Stain": 30,
  "Lip Liner": 45, "Lip Topper": 15, "Lip Plumper": 15,
  "Eye Primer": 30, "Lash Serum": 20,
};

function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate  = 0.92;
  utt.pitch = 1.05;
  window.speechSynthesis.speak(utt);
}

function ProgressRing({ remaining, total, size = 80 }) {
  const r    = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const pct  = total > 0 ? remaining / total : 0;
  const dash = pct * circ;
  const colour = remaining <= 5 ? "#ef4444" : remaining <= 15 ? "#f59e0b" : "#e11d48";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-mid)" strokeWidth="5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={colour} strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              transform={`rotate(-90 ${size/2} ${size/2})`}
              style={{ transition: "stroke-dasharray 0.95s linear, stroke 0.3s" }}/>
      <text x="50%" y="54%" textAnchor="middle" fontSize={size * 0.24}
            fontWeight="700" fontFamily="DM Sans, sans-serif" fill={colour}>
        {remaining}
      </text>
    </svg>
  );
}

export default function TutorialMode({ steps, onClose }) {
  const validSteps = steps.filter(s => s.product);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [voiceOn,    setVoiceOn]    = useState(false);
  const [completed,  setCompleted]  = useState(new Set());

  const current   = validSteps[currentIdx];
  const duration  = current ? (STEP_DURATIONS[current.category] || 30) : 30;
  const isLast    = currentIdx === validSteps.length - 1;
  const allDone   = completed.size === validSteps.length;

  const handleTimerDone = useCallback(() => {
    if (voiceOn) speak("Step complete. Ready for the next one.");
  }, [voiceOn]);

  const { remaining, running, start, pause, reset } = useCountdown(duration, handleTimerDone);

  // Announce step when it changes
  useEffect(() => {
    if (!current || !voiceOn) return;
    const prod = current.product;
    const name = prod?.brand ? `${prod.brand}${prod.shade ? `, ${prod.shade}` : ""}` : current.category;
    speak(`Step ${currentIdx + 1}: ${current.category}. Use ${name}. ${current.tip || ""}`);
  }, [currentIdx, voiceOn]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; window.speechSynthesis?.cancel(); };
  }, []);

  function goTo(idx) {
    reset();
    setCurrentIdx(idx);
  }

  function markDone(idx) {
    setCompleted(prev => new Set([...prev, idx]));
    if (!isLast) goTo(idx + 1);
  }

  function toggleVoice() {
    setVoiceOn(v => !v);
    if (!voiceOn && current) speak(`Tutorial mode. Step ${currentIdx + 1}: ${current.category}.`);
    else window.speechSynthesis?.cancel();
  }

  if (!validSteps.length) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
           onClick={onClose}/>

      {/* Panel */}
      <div className="fixed inset-0 z-[151] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden
                     flex flex-col shadow-2xl"
          style={{ background: "var(--bg-card)", maxHeight: "92vh" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b flex items-center justify-between shrink-0"
               style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
            <div>
              <p className="text-[10px] font-bold font-sans uppercase tracking-widest"
                 style={{ color: "var(--text-muted)" }}>
                Tutorial Mode
              </p>
              <p className="text-sm font-semibold font-sans" style={{ color: "var(--text-primary)" }}>
                Step {currentIdx + 1} of {validSteps.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Voice toggle */}
              {typeof window !== "undefined" && window.speechSynthesis && (
                <button onClick={toggleVoice}
                  className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer
                             border transition-all text-sm"
                  style={{
                    background:  voiceOn ? "#fff1f2" : "var(--bg-card)",
                    borderColor: voiceOn ? "#fecdd3" : "var(--border)",
                    color:       voiceOn ? "#e11d48" : "var(--text-muted)",
                  }}
                  title={voiceOn ? "Mute voice" : "Enable voice"}>
                  {voiceOn ? "🔊" : "🔇"}
                </button>
              )}
              <button onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer
                           border text-sm transition-all hover:border-rose-300"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
                ✕
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 shrink-0" style={{ background: "var(--border)" }}>
            <div className="h-full transition-all duration-500"
                 style={{
                   width: `${((currentIdx + (completed.has(currentIdx) ? 1 : 0)) / validSteps.length) * 100}%`,
                   background: "linear-gradient(90deg, #fb7185, #b87aaa)",
                 }}/>
          </div>

          {/* All done */}
          {allDone ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="text-6xl">🎉</div>
              <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                Look complete!
              </h2>
              <p className="text-sm font-sans" style={{ color: "var(--text-muted)" }}>
                You've worked through all {validSteps.length} steps. Time to see how it looks!
              </p>
              <button onClick={onClose} className="btn-primary mt-2">Close Tutorial</button>
            </div>
          ) : current ? (
            <div className="flex-1 overflow-y-auto">
              {/* Current step */}
              <div className="p-5">
                {/* Step header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-full bg-rose-600 text-white text-base
                                  font-bold font-sans flex items-center justify-center shrink-0">
                    {currentIdx + 1}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-serif text-xl font-bold mb-0.5"
                        style={{ color: "var(--text-primary)" }}>
                      {current.category}
                    </h2>
                    {current.product && (
                      <div className="flex items-center gap-2">
                        {current.product.shadeHex && (
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                               style={{ background: current.product.shadeHex }}/>
                        )}
                        <p className="text-sm font-sans" style={{ color: "var(--text-muted)" }}>
                          {current.product.brand || ""}
                          {current.product.brand && current.product.shade ? " — " : ""}
                          {current.product.shade || ""}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tip */}
                <div className="rounded-xl border p-4 mb-5"
                     style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
                  <p className="text-sm font-sans leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    💡 {current.tip}
                  </p>
                </div>

                {/* Timer */}
                <div className="flex flex-col items-center gap-3 mb-5 py-4">
                  <ProgressRing remaining={remaining} total={duration} size={90}/>
                  <p className="text-xs font-sans" style={{ color: "var(--text-muted)" }}>
                    {running ? "Timer running…" : remaining === 0 ? "Time's up!" : `${duration}s suggested`}
                  </p>
                  <div className="flex gap-2">
                    {!running && remaining > 0 && (
                      <button onClick={start}
                        className="rounded-full px-4 py-2 text-sm font-semibold font-sans
                                   cursor-pointer transition-all border"
                        style={{ background: "#fff1f2", borderColor: "#fecdd3", color: "#e11d48" }}>
                        ▶ Start Timer
                      </button>
                    )}
                    {running && (
                      <button onClick={pause}
                        className="rounded-full px-4 py-2 text-sm font-semibold font-sans
                                   cursor-pointer transition-all border"
                        style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
                        ⏸ Pause
                      </button>
                    )}
                    <button onClick={reset}
                      className="rounded-full px-4 py-2 text-sm font-semibold font-sans
                                 cursor-pointer transition-all border"
                      style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
                      ↺ Reset
                    </button>
                  </div>
                </div>

                {/* Nav actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => markDone(currentIdx)}
                    className="btn-primary flex-1 justify-center"
                  >
                    {isLast ? "✓ Finish Look" : "✓ Done — Next Step →"}
                  </button>
                </div>

                {currentIdx > 0 && (
                  <button onClick={() => goTo(currentIdx - 1)}
                    className="w-full mt-2 text-xs font-sans cursor-pointer bg-transparent
                               border-none text-center py-2"
                    style={{ color: "var(--text-faint)" }}>
                    ← Back to previous step
                  </button>
                )}
              </div>

              {/* Step overview dots */}
              <div className="px-5 pb-5">
                <p className="section-label mb-2">All steps</p>
                <div className="flex flex-wrap gap-2">
                  {validSteps.map((s, i) => (
                    <button key={i} onClick={() => goTo(i)}
                      className="w-8 h-8 rounded-full text-xs font-bold font-sans cursor-pointer
                                 transition-all border"
                      style={{
                        background:  completed.has(i) ? "#e11d48" : i === currentIdx ? "#fff1f2" : "var(--bg-card)",
                        borderColor: completed.has(i) ? "#e11d48" : i === currentIdx ? "#fecdd3" : "var(--border)",
                        color:       completed.has(i) ? "#fff"    : i === currentIdx ? "#e11d48" : "var(--text-muted)",
                      }}>
                      {completed.has(i) ? "✓" : i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
