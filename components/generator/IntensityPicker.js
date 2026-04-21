"use client";

import { INTENSITIES, TIME_OPTIONS } from "@/lib/constants";

export default function IntensityPicker({ intensity, onIntensity, time, onTime }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Intensity */}
      <div>
        <label className="section-label">Intensity</label>
        <div className="flex flex-col gap-1.5">
          {INTENSITIES.map((iv) => {
            const active = intensity?.id === iv.id;
            const dots = Array.from({ length: 5 }, (_, i) =>
              i < iv.dots ? "●" : "○"
            ).join("");
            return (
              <button
                key={iv.id}
                onClick={() => onIntensity(iv)}
                className={`text-left rounded-lg px-3 py-2 text-sm cursor-pointer transition-all duration-150 border
                  ${active
                    ? "bg-rose-50 border-rose-200 text-rose-700 font-semibold"
                    : "bg-transparent border-nude-100 text-nude-600 hover:border-rose-100 hover:bg-rose-50/40"
                  }`}
              >
                <span className="font-mono text-xs mr-2 tracking-widest">{dots}</span>
                {iv.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time */}
      <div>
        <label className="section-label">Time Available</label>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => onTime(t)}
              className={`rounded-full px-3.5 py-1.5 text-sm cursor-pointer transition-all duration-150 border
                ${time === t
                  ? "bg-rose-50 border-rose-300 text-rose-600 font-semibold"
                  : "bg-white border-nude-100 text-nude-500 hover:border-rose-200"
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
