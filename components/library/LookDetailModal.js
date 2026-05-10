"use client";

import { useEffect } from "react";
import { READINESS_META } from "@/lib/inventoryMatcher";

// ── Palette display ────────────────────────────────────────────────────────
function PaletteRow({ palette }) {
  const zones = [
    { key: "skin",      label: "Base"      },
    { key: "blush",     label: "Blush"     },
    { key: "eye",       label: "Eye"       },
    { key: "lip",       label: "Lip"       },
    { key: "bronze",    label: "Bronze"    },
    { key: "highlight", label: "Highlight" },
  ].filter(z => palette[z.key]);

  return (
    <div className="flex flex-col gap-2">
      {/* Full strip */}
      <div className="flex h-12 rounded-xl overflow-hidden shadow-sm">
        {zones.map(({ key }) => (
          <div key={key} className="flex-1" style={{ background: palette[key] }} />
        ))}
      </div>
      {/* Circle legend */}
      <div className="flex gap-3 flex-wrap">
        {zones.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ background: palette[key] }}
            />
            <span className="text-[10px] text-nude-500 font-sans">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step list ─────────────────────────────────────────────────────────────
function StepList({ steps }) {
  return (
    <ol className="flex flex-col gap-2">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold
                          font-sans flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </div>
          <p className="text-sm text-nude-600 font-sans leading-relaxed">{step}</p>
        </li>
      ))}
    </ol>
  );
}

// ── Product requirement row ────────────────────────────────────────────────
function ProductRow({ result }) {
  const covered = result.covered;
  return (
    <div className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border
      ${covered
        ? "border-green-100 bg-green-50"
        : result.isRequired
          ? "border-rose-100 bg-rose-50"
          : "border-nude-100 bg-nude-50"
      }`}>
      {/* Status icon */}
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                       font-bold shrink-0 mt-0.5
        ${covered
          ? "bg-green-500 text-white"
          : result.isRequired
            ? "bg-rose-200 text-rose-500"
            : "bg-nude-200 text-nude-400"
        }`}>
        {covered ? "✓" : "○"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold font-sans
            ${covered ? "text-green-700" : result.isRequired ? "text-rose-700" : "text-nude-600"}`}>
            {result.category}
          </span>
          {result.substitute && (
            <span className="text-[10px] text-nude-400 font-sans italic">
              (via {result.via})
            </span>
          )}
          {!result.isRequired && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-nude-100
                             text-nude-500 font-sans font-semibold">
              optional
            </span>
          )}
        </div>
        {covered && result.product && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {result.product.shadeHex && (
              <div
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ background: result.product.shadeHex }}
              />
            )}
            <span className="text-[11px] text-nude-500 font-sans truncate">
              {result.product.brand || ""}
              {result.product.brand && result.product.shade ? " — " : ""}
              {result.product.shade || "Your product"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────
export default function LookDetailModal({ look, match, onClose, onGenerate }) {

  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!look) return null;
  const meta = match ? READINESS_META[match.readiness] : null;

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ── Modal panel ──────────────────────────────────────────── */}
      <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className="relative bg-white w-full sm:max-w-2xl max-h-[96vh] sm:max-h-[90vh]
                     rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header palette strip ──────────────────────────────── */}
          <div className="relative h-28 flex shrink-0">
            {["skin","blush","eye","lip","bronze","highlight"]
              .filter(k => look.palette[k])
              .map((k, i, arr) => (
                <div
                  key={k}
                  className="flex-1"
                  style={{
                    background: look.palette[k],
                    borderTopLeftRadius:  i === 0 ? "1.5rem" : 0,
                    borderTopRightRadius: i === arr.length - 1 ? "1.5rem" : 0,
                  }}
                />
              ))}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80
                         backdrop-blur-sm flex items-center justify-center
                         text-nude-700 text-sm font-bold cursor-pointer border-none
                         hover:bg-white transition-colors shadow-sm"
            >
              ✕
            </button>

            {/* Season tag */}
            {look.season && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px]
                              font-bold font-sans bg-white/80 backdrop-blur-sm text-nude-700 shadow-sm">
                {look.season}
              </div>
            )}
          </div>

          {/* ── Scrollable body ───────────────────────────────────── */}
          <div className="overflow-y-auto flex-1 p-5 sm:p-6">

            {/* Title + meta */}
            <div className="mb-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-nude-800 leading-tight">
                    {look.name}
                  </h2>
                  <p className="text-sm text-nude-400 font-sans italic mt-0.5">{look.subtitle}</p>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <span className="pill bg-nude-50 text-nude-600">{look.difficulty}</span>
                  <span className="pill bg-nude-50 text-nude-500">{look.time}</span>
                </div>
              </div>

              {/* Celebrity tag */}
              {look.celebrity && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl
                                bg-mauve-50 border border-mauve-200">
                  <span className="text-mauve-500 text-sm">✦</span>
                  <span className="text-xs font-semibold text-mauve-700 font-sans">
                    Inspired by {look.celebrity}
                  </span>
                </div>
              )}

              <p className="text-sm text-nude-600 font-sans leading-relaxed mt-3">
                {look.desc}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {look.tags.map(tag => (
                <span key={tag} className="pill bg-nude-50 text-nude-500 border border-nude-100">
                  {tag}
                </span>
              ))}
            </div>

            {/* Palette */}
            <div className="mb-5">
              <p className="text-xs font-bold text-nude-500 uppercase tracking-widest font-sans mb-2">
                Colour Palette
              </p>
              <PaletteRow palette={look.palette} />
            </div>

            {/* Inventory match */}
            {match && (
              <div className="mb-5 p-4 rounded-2xl border" style={{ background: meta?.bg, borderColor: meta?.border }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest font-sans"
                       style={{ color: meta?.colour }}>
                      Your Inventory Match
                    </p>
                    <p className="text-2xl font-serif font-bold mt-0.5" style={{ color: meta?.colour }}>
                      {match.score}%
                      <span className="text-sm font-sans font-normal ml-2">{meta?.label}</span>
                    </p>
                  </div>
                  {/* Mini radial */}
                  <svg width="52" height="52" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="21" fill="none" stroke="#f2ece5" strokeWidth="5"/>
                    <circle cx="26" cy="26" r="21" fill="none" stroke={meta?.dot} strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={`${(match.score / 100) * 132} 132`}
                            transform="rotate(-90 26 26)"/>
                    <text x="26" y="30" textAnchor="middle" fontSize="10" fontWeight="700"
                          fill={meta?.colour} fontFamily="DM Sans, sans-serif">
                      {match.score}
                    </text>
                  </svg>
                </div>

                {/* Required product rows */}
                <div className="flex flex-col gap-1.5">
                  {[...match.requiredResults, ...match.optionalResults].map((r, i) => (
                    <ProductRow key={i} result={r} />
                  ))}
                </div>

                {/* Missing products summary */}
                {match.missingRequired.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-rose-100">
                    <p className="text-xs font-bold text-rose-600 font-sans mb-1">
                      Still needed: {match.missingRequired.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pro tip */}
            {look.tip && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-nude-50 border border-nude-100">
                <p className="text-xs font-bold text-nude-500 uppercase tracking-widest font-sans mb-1">
                  Pro Tip
                </p>
                <p className="text-sm text-nude-700 font-sans leading-relaxed italic">
                  "{look.tip}"
                </p>
              </div>
            )}

            {/* Steps */}
            <div className="mb-6">
              <p className="text-xs font-bold text-nude-500 uppercase tracking-widest font-sans mb-3">
                Application Steps
              </p>
              <StepList steps={look.steps} />
            </div>
          </div>

          {/* ── Sticky CTA footer ─────────────────────────────────── */}
          <div className="shrink-0 p-4 border-t border-nude-100 bg-white/95 backdrop-blur-sm">
            <div className="flex gap-3">
              <button
                onClick={() => onGenerate(look)}
                className="btn-primary flex-1 !justify-center"
              >
                ✨ Generate This Look
              </button>
              <button
                onClick={onClose}
                className="btn-secondary !px-5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
