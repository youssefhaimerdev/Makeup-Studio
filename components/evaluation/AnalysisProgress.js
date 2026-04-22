"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "Loading AI model",           duration: 2000 },
  { label: "Detecting facial landmarks", duration: 1500 },
  { label: "Analysing makeup zones",     duration: 1500 },
  { label: "Scoring each area",          duration: 1000 },
  { label: "Generating feedback",        duration: 800  },
];

export default function AnalysisProgress({ stage }) {
  // stage: 0 = not started, 1-5 = step index, 6 = done
  const [dots, setDots] = useState("");

  useEffect(() => {
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(t);
  }, []);

  const current = Math.max(0, Math.min(stage - 1, STEPS.length - 1));
  const percent  = Math.round((stage / STEPS.length) * 100);

  return (
    <div className="bg-white border border-nude-100 rounded-2xl p-8 text-center">
      {/* Spinner */}
      <div className="relative w-16 h-16 mx-auto mb-6">
        <svg className="animate-spin" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="26" stroke="#f2ece5" strokeWidth="6" />
          <circle
            cx="32" cy="32" r="26"
            stroke="url(#grad)" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="40 124"
          />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#b87aaa" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">✦</span>
        </div>
      </div>

      <p className="font-serif text-lg text-nude-800 mb-1">
        {stage <= STEPS.length ? STEPS[current]?.label : "Finalising"}{dots}
      </p>
      <p className="text-sm text-nude-400 mb-6">AI analysis in progress</p>

      {/* Progress bar */}
      <div className="w-full bg-nude-100 rounded-full h-1.5 mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(percent, 95)}%`,
            background: "linear-gradient(90deg, #fb7185, #b87aaa)",
          }}
        />
      </div>

      {/* Step list */}
      <div className="flex flex-col gap-1.5 text-left mt-4 max-w-xs mx-auto">
        {STEPS.map((step, i) => {
          const done    = i < stage - 1;
          const active  = i === stage - 1;
          return (
            <div key={i} className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[10px]
                  ${done   ? "bg-rose-500"   : ""}
                  ${active ? "bg-rose-200 animate-pulse" : ""}
                  ${!done && !active ? "bg-nude-100" : ""}
                `}
              >
                {done && <span className="text-white font-bold">✓</span>}
              </div>
              <span
                className={`text-xs transition-colors
                  ${done   ? "text-nude-400 line-through" : ""}
                  ${active ? "text-rose-600 font-semibold" : ""}
                  ${!done && !active ? "text-nude-300" : ""}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
