"use client";

import { OCCASIONS } from "@/lib/constants";

export default function OccasionPicker({ value, onChange }) {
  return (
    <div>
      <label className="section-label">Occasion</label>
      <div className="flex flex-col gap-1.5">
        {OCCASIONS.map((occ) => (
          <button
            key={occ}
            onClick={() => onChange(occ)}
            className={`text-left rounded-lg px-3 py-2 text-sm cursor-pointer transition-all duration-150 border
              ${value === occ
                ? "bg-rose-50 border-rose-200 text-rose-700 font-semibold"
                : "bg-transparent border-nude-100 text-nude-600 hover:border-rose-100 hover:bg-rose-50/40"
              }`}
          >
            {occ}
          </button>
        ))}
      </div>
    </div>
  );
}
