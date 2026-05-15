"use client";
import { useState } from "react";
import Badge from "@/components/ui/Badge";
import MoodCard from "./MoodCard";
import FaceMap from "./FaceMap";
import SaveLookPanel from "./SaveLookPanel";
import ShareButton from "./ShareButton";
import TutorialMode from "./TutorialMode";
import AnimatedMakeupCanvas from "./AnimatedMakeupCanvas";

function StepRow({ step, index, isExpanded, onToggle, palette, isCurrent, onClick }) {
  const hasProduct = !!step.product;
  const dotBg = isCurrent ? "#e11d48" : hasProduct ? (step.product.shadeHex || "#c4a882") : "#e3d5c5";
  return (
    <div onClick={onToggle}
      className={`border rounded-xl px-4 py-3.5 cursor-pointer transition-all duration-150
        ${isCurrent ? "border-rose-400 shadow-md shadow-rose-100" : hasProduct ? "border-nude-100 hover:border-rose-200" : "border-rose-100"}`}
      style={{ background: isCurrent ? "#fff1f2" : "var(--bg-card)" }}>
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full text-xs font-bold font-sans flex items-center justify-center shrink-0 shadow-sm transition-all"
          style={{ background: dotBg, color: "#fff" }}>
          {isCurrent ? "▶" : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm font-sans" style={{ color: "var(--text-primary)" }}>{step.category}</div>
          {hasProduct
            ? <div className="text-xs font-sans truncate flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                {step.product.shadeHex && <span className="inline-block w-2.5 h-2.5 rounded-full border border-white shadow-sm shrink-0" style={{ background: step.product.shadeHex }}/>}
                {step.product.brand || ""}{step.product.brand && step.product.shade ? " — " : ""}{step.product.shade || (!step.product.brand ? "Your product" : "")}
              </div>
            : <div className="text-xs font-sans text-rose-400">⚠ Not in inventory</div>}
        </div>
        {isCurrent && <span className="text-[10px] font-bold font-sans text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">Applying</span>}
        {(step.coverage || step.intensity) && !isCurrent && <Badge variant="nude">{step.coverage || step.intensity}</Badge>}
        <span className="text-sm shrink-0" style={{ color: "var(--text-faint)" }}>{isExpanded ? "▲" : "▼"}</span>
      </div>
      {isExpanded && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-sans leading-relaxed" style={{ color: "var(--text-secondary)" }}>💡 {step.tip}</p>
        </div>
      )}
    </div>
  );
}

export default function LookResult({ result, profile = {} }) {
  const [expandedStep,   setExpandedStep]   = useState(null);
  const [showAnalysis,   setShowAnalysis]    = useState(false);
  const [activeView,     setActiveView]      = useState("steps");
  const [tutorialOpen,   setTutorialOpen]    = useState(false);
  const [canvasStep,     setCanvasStep]      = useState(0);

  const { steps = [], missing = [], analysis = [], palette, applyZones, trendName, occasion, intensity, estimatedMinutes, productCount } = result;
  const validSteps = steps.filter(s => s.product);

  const TABS = [
    { id: "steps",    label: "📋 Steps"         },
    { id: "canvas",   label: "🎨 Live Apply"    },
    { id: "map",      label: "🗺 Face Map"      },
  ];

  return (
    <div className="flex flex-col gap-6">
      <MoodCard look={result} />

      {/* Stats + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex gap-4">
          {[{ n: estimatedMinutes, l: "min" }, { n: productCount, l: "products" }, { n: steps.length, l: "steps" }].map(s => (
            <div key={s.l} className="text-center">
              <div className="font-serif text-xl font-bold text-rose-600">{s.n}</div>
              <div className="text-[10px] font-sans uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setTutorialOpen(true)}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold font-sans cursor-pointer transition-all border"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
            ▶ Tutorial Mode
          </button>
          <ShareButton look={result} />
        </div>
      </div>

      {/* Main tabbed panel */}
      <div className="border rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold font-sans cursor-pointer transition-all border-none border-b-2
                ${activeView === tab.id ? "border-rose-400 text-rose-600" : "border-transparent"}`}
              style={{ background: activeView === tab.id ? "rgba(255,241,242,0.5)" : "transparent", color: activeView === tab.id ? undefined : "var(--text-muted)" }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── STEPS TAB ── */}
          {activeView === "steps" && (
            <div className="flex flex-col gap-2">
              {steps.map((step, i) => (
                <StepRow key={i} step={step} index={i}
                  isExpanded={expandedStep === i}
                  isCurrent={false}
                  onToggle={() => setExpandedStep(expandedStep === i ? null : i)}
                  palette={palette} />
              ))}
            </div>
          )}

          {/* ── LIVE APPLY TAB ── */}
          {activeView === "canvas" && (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Animated face canvas */}
              <div className="flex-shrink-0 w-full lg:w-auto flex justify-center">
                <AnimatedMakeupCanvas
                  steps={steps}
                  currentStepIndex={canvasStep}
                  palette={palette}
                  profile={profile}
                />
              </div>

              {/* Step selector sidebar */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold font-sans uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                  Tap a step to see it applied
                </p>
                <div className="flex flex-col gap-2">
                  {steps.map((step, i) => (
                    <StepRow key={i} step={step} index={i}
                      isExpanded={false}
                      isCurrent={canvasStep === i}
                      onToggle={() => setCanvasStep(i)}
                      palette={palette} />
                  ))}
                </div>

                {/* Step navigation */}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setCanvasStep(v => Math.max(0, v - 1))}
                    disabled={canvasStep === 0}
                    className="flex-1 py-2.5 rounded-full text-sm font-semibold font-sans cursor-pointer transition-all border disabled:opacity-40"
                    style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
                    ← Prev
                  </button>
                  <button onClick={() => setCanvasStep(v => Math.min(steps.length - 1, v + 1))}
                    disabled={canvasStep === steps.length - 1}
                    className="flex-1 py-2.5 rounded-full text-sm font-semibold font-sans cursor-pointer transition-all btn-primary !shadow-none">
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── MAP TAB ── */}
          {activeView === "map" && (
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <FaceMap palette={palette} applyZones={applyZones} trendName={trendName} />
              <div className="flex-1">
                <p className="text-xs font-bold font-sans uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Active zones</p>
                <div className="flex flex-col gap-2">
                  {[
                    { zone: "skin",      label: "Base & Skin",  icon: "✦" },
                    { zone: "eyes",      label: "Eyes",          icon: "👁" },
                    { zone: "brows",     label: "Brows",         icon: "〰" },
                    { zone: "blush",     label: "Blush",         icon: "🌸" },
                    { zone: "contour",   label: "Contour",       icon: "🌑" },
                    { zone: "highlight", label: "Highlight",     icon: "✨" },
                    { zone: "lips",      label: "Lips",          icon: "💋" },
                  ].filter(z => applyZones?.[z.zone]).map(z => (
                    <div key={z.zone} className="flex items-center gap-2">
                      <span className="text-sm">{z.icon}</span>
                      <span className="text-xs font-sans" style={{ color: "var(--text-muted)" }}>{z.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Harmony analysis */}
      {analysis.length > 0 && (
        <div className="border rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <button onClick={() => setShowAnalysis(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 border-none cursor-pointer transition-colors font-sans"
            style={{ background: "var(--bg-subtle)" }}>
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>✦ Harmony Notes ({analysis.length})</span>
            <span className={`transition-transform duration-200 ${showAnalysis ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }}>▾</span>
          </button>
          {showAnalysis && (
            <div className="p-4 flex flex-col gap-2">
              {analysis.map((note, i) => (
                <div key={i} className="flex gap-2.5 text-sm font-sans rounded-xl px-3.5 py-2.5 border"
                  style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                  <span className="text-rose-400 shrink-0">✦</span>
                  <span className="leading-relaxed">{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Missing products */}
      {missing.length > 0 && (
        <div className="rounded-xl p-5 border" style={{ background: "#fdf4f0", borderColor: "#f6cdb5" }}>
          <h4 className="text-sm font-bold font-sans mb-4" style={{ color: "var(--text-primary)" }}>Products to Consider</h4>
          <div className="flex flex-col gap-3">
            {missing.map((m, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <Badge variant={m.priority}>{m.priority}</Badge>
                <div>
                  <span className="font-semibold font-sans" style={{ color: "var(--text-primary)" }}>{m.category}</span>
                  <span className="font-sans" style={{ color: "var(--text-muted)" }}> — {m.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <SaveLookPanel currentLook={result} />
      {tutorialOpen && <TutorialMode steps={steps} onClose={() => setTutorialOpen(false)} />}
    </div>
  );
}
