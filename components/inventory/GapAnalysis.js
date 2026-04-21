"use client";

import { getInventoryStats } from "@/lib/pairingsEngine";
import { useApp } from "@/lib/AppContext";

export default function GapAnalysis() {
  const { inventory } = useApp();
  const stats = getInventoryStats(inventory);

  if (inventory.length < 3) return null;

  return (
    <div className="mt-10 rounded-2xl p-6 border border-blush-100" style={{ background: "#fdf4f0" }}>
      <h3 className="font-serif text-lg text-nude-800 mb-5">📊 Inventory Analysis</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Covered */}
        <div>
          <div className="section-label mb-3">Covered ({stats.covered.length})</div>
          <ul className="space-y-1.5">
            {stats.covered.map((cat) => (
              <li key={cat} className="flex items-center gap-2 text-sm text-nude-700">
                <span className="text-rose-400 text-xs">✓</span> {cat}
              </li>
            ))}
          </ul>
        </div>

        {/* Missing */}
        <div>
          <div className="section-label mb-3">Missing Essentials ({stats.missing.length})</div>
          {stats.missing.length === 0 ? (
            <p className="text-sm text-nude-400 italic">All essentials covered 🎉</p>
          ) : (
            <ul className="space-y-1.5">
              {stats.missing.map((cat) => (
                <li key={cat} className="flex items-center gap-2 text-sm text-nude-500">
                  <span className="text-blush-400 text-xs">○</span> {cat}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Duplicates */}
        {stats.duplicates.length > 0 && (
          <div>
            <div className="section-label mb-3">Multiple Products</div>
            <ul className="space-y-1.5">
              {stats.duplicates.map(({ category, count }) => (
                <li key={category} className="flex items-center gap-2 text-sm text-nude-500">
                  <span className="pill bg-nude-100 text-nude-600">{count}</span> {category}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
