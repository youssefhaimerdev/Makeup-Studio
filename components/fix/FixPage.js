"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { diagnoseMakeup } from "@/lib/fixEngine";
import { COMMON_PROBLEMS } from "@/lib/constants";
import DiagnosisResult from "./DiagnosisResult";
import { ButtonPrimary } from "@/components/ui/Button";

export default function FixPage() {
  const { inventory, profile, hydrated } = useApp();
  const [problem, setProblem] = useState("");
  const [result,  setResult]  = useState(null);

  function diagnose(input = problem) {
    const q = (input || "").trim();
    if (!q) return;
    setProblem(q);
    setResult(diagnoseMakeup(q, inventory, profile));
  }

  if (!hydrated) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="page-title">Fix My Makeup</h1>
      <p className="page-subtitle">
        Describe your problem and get an instant diagnosis with step-by-step corrections.
      </p>

      {/* Input */}
      <div className="bg-white border border-nude-100 rounded-2xl p-6 mb-6">
        <label className="section-label">Describe the Problem</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={problem}
            onChange={(e) => { setProblem(e.target.value); setResult(null); }}
            onKeyDown={(e) => e.key === "Enter" && diagnose()}
            placeholder="e.g. My foundation looks too orange on my skin…"
            className="input-field flex-1"
          />
          <ButtonPrimary onClick={() => diagnose()} className="shrink-0 !px-5 !py-2 !text-sm">
            Diagnose
          </ButtonPrimary>
        </div>

        <div className="mt-4">
          <p className="section-label mb-2">Common issues</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_PROBLEMS.map((p) => (
              <button
                key={p}
                onClick={() => diagnose(p)}
                className="rounded-full px-3 py-1.5 text-xs bg-nude-50 border border-nude-200
                           text-nude-600 cursor-pointer hover:border-rose-200 hover:bg-rose-50
                           hover:text-rose-600 transition-all duration-150"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      {result && <DiagnosisResult result={result} />}
    </div>
  );
}
