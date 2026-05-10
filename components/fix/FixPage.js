"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { diagnoseMakeup } from "@/lib/fixEngine";
import { COMMON_PROBLEMS_BY_ZONE } from "@/lib/constants";
import DiagnosisResult from "./DiagnosisResult";
import { ButtonPrimary } from "@/components/ui/Button";

const ZONE_ICONS = {
  Base:      "✦",
  Concealer: "🔵",
  Eyes:      "👁",
  Cheeks:    "🌸",
  Lips:      "💋",
};

export default function FixPage() {
  const { inventory, profile, hydrated } = useApp();
  const [problem, setProblem] = useState("");
  const [result,  setResult]  = useState(null);
  const [activeZone, setActiveZone] = useState("All");

  function diagnose(input = problem) {
    const q = (input || "").trim();
    if (!q) return;
    setProblem(q);
    setResult(diagnoseMakeup(q, inventory, profile));
    // Scroll to result on mobile
    setTimeout(() => {
      document.getElementById("fix-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  if (!hydrated) return null;

  const zones = ["All", ...COMMON_PROBLEMS_BY_ZONE.map(z => z.zone)];
  const filteredZones = activeZone === "All"
    ? COMMON_PROBLEMS_BY_ZONE
    : COMMON_PROBLEMS_BY_ZONE.filter(z => z.zone === activeZone);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="page-title">Fix My Makeup</h1>
      <p className="page-subtitle">
        Describe any problem — in your own words or tap a common issue below.
        Get an instant diagnosis with root cause, step-by-step correction, and products from your stash.
      </p>

      {/* ── Input panel ──────────────────────────────────────────────── */}
      <div className="bg-white border border-nude-100 rounded-2xl p-5 mb-6">
        <label className="section-label mb-2">Describe the problem</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={problem}
            onChange={e => { setProblem(e.target.value); if (result) setResult(null); }}
            onKeyDown={e => e.key === "Enter" && diagnose()}
            placeholder='e.g. "My foundation looks orange after an hour"'
            className="input-field flex-1"
          />
          <ButtonPrimary
            onClick={() => diagnose()}
            disabled={!problem.trim()}
            className="shrink-0 !px-5 !py-2.5 !text-sm !shadow-none"
          >
            Diagnose
          </ButtonPrimary>
        </div>
      </div>

      {/* ── Common problems — zoned ───────────────────────────────────── */}
      <div className="bg-white border border-nude-100 rounded-2xl p-5 mb-6">
        <p className="section-label mb-3">Common issues by zone</p>

        {/* Zone filter tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {zones.map(zone => (
            <button
              key={zone}
              onClick={() => setActiveZone(zone)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                          font-sans cursor-pointer transition-all border
                ${activeZone === zone
                  ? "bg-nude-800 border-nude-800 text-white"
                  : "bg-white border-nude-200 text-nude-600 hover:border-nude-400"}`}
            >
              {ZONE_ICONS[zone] && <span>{ZONE_ICONS[zone]}</span>}
              {zone}
            </button>
          ))}
        </div>

        {/* Problem chips, grouped by zone */}
        <div className="flex flex-col gap-4">
          {filteredZones.map(({ zone, problems }) => (
            <div key={zone}>
              {/* Zone label — only show when "All" is selected */}
              {activeZone === "All" && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{ZONE_ICONS[zone]}</span>
                  <span className="text-xs font-bold text-nude-500 uppercase tracking-widest font-sans">
                    {zone}
                  </span>
                  <div className="flex-1 h-px bg-nude-100"/>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {problems.map(prob => {
                  const isActive = problem === prob && result;
                  return (
                    <button
                      key={prob}
                      onClick={() => diagnose(prob)}
                      className={`rounded-full px-3.5 py-2 text-xs font-medium font-sans
                                  cursor-pointer transition-all duration-150 border text-left
                        ${isActive
                          ? "bg-rose-500 border-rose-500 text-white"
                          : "bg-nude-50 border-nude-200 text-nude-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                        }`}
                    >
                      {prob}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Diagnosis result ─────────────────────────────────────────── */}
      {result && (
        <div id="fix-result">
          <DiagnosisResult result={result} />
        </div>
      )}
    </div>
  );
}
