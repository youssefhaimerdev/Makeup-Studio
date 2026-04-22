"use client";

import { scoreToGrade } from "@/lib/makeupAnalysis";
import { deleteEvaluation } from "@/lib/evaluationStorage";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function EvaluationHistory({ evaluations, onUpdate, onSelect }) {
  function handleDelete(id) {
    const updated = deleteEvaluation(id);
    onUpdate(updated);
  }

  if (!evaluations.length) return null;

  return (
    <div className="bg-white border border-nude-100 rounded-2xl p-6">
      <h3 className="font-serif text-lg text-nude-800 mb-5">
        Past Evaluations
        <span className="ml-2 text-sm font-normal text-nude-400">({evaluations.length})</span>
      </h3>

      <div className="flex flex-col gap-2">
        {evaluations.map((ev) => {
          const { grade, color, label } = scoreToGrade(ev.overall);
          return (
            <div
              key={ev.id}
              className="flex items-center gap-4 p-3.5 rounded-xl border border-nude-100
                         hover:border-rose-200 transition-colors cursor-pointer group"
              onClick={() => onSelect?.(ev)}
            >
              {/* Score badge */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-serif font-bold text-lg"
                style={{ background: color + "15", color }}
              >
                {ev.overall}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold" style={{ color }}>{grade} — {label}</span>
                  {ev.look?.occasion && (
                    <span className="text-xs bg-nude-50 border border-nude-100 rounded-full px-2 py-0.5 text-nude-500">
                      {ev.look.occasion}
                    </span>
                  )}
                </div>
                <div className="text-xs text-nude-400 mt-0.5">{formatDate(ev.timestamp)}</div>
              </div>

              {/* Delete */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-nude-300
                           hover:text-rose-400 bg-transparent border-none cursor-pointer text-sm p-1"
                title="Delete evaluation"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {evaluations.length >= 2 && (
        <p className="text-xs text-nude-400 mt-4 text-center">
          Click any result to view full details. Track your progress over time.
        </p>
      )}
    </div>
  );
}
