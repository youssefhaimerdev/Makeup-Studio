"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";

function StepRow({ step, index, isExpanded, onToggle }) {
  const hasProduct = !!step.product;

  return (
    <div
      onClick={onToggle}
      className={`bg-white border rounded-xl px-4 py-3.5 cursor-pointer transition-all duration-150
        ${hasProduct ? "border-nude-100 hover:border-rose-200" : "border-rose-100"}`}
    >
      <div className="flex items-center gap-3">
        {/* Step number bubble */}
        <div
          className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0
            ${hasProduct ? "bg-rose-600 text-white" : "bg-nude-200 text-nude-500"}`}
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-nude-800">{step.category}</div>
          {hasProduct ? (
            <div className="text-xs text-nude-400 truncate">
              {step.product.brand || ""}
              {step.product.brand && step.product.shade ? " — " : ""}
              {step.product.shade || (!step.product.brand ? "Your product" : "")}
            </div>
          ) : (
            <div className="text-xs text-rose-400">⚠ Not in inventory</div>
          )}
        </div>

        {(step.coverage || step.intensity) && (
          <Badge variant="nude">{step.coverage || step.intensity}</Badge>
        )}

        <span className="text-nude-300 text-sm shrink-0">
          {isExpanded ? "▲" : "▼"}
        </span>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-nude-100">
          <p className="text-sm text-nude-600 leading-relaxed">💡 {step.tip}</p>
        </div>
      )}
    </div>
  );
}

function MissingProduct({ item }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Badge variant={item.priority}>{item.priority}</Badge>
      <div>
        <span className="font-semibold text-nude-700">{item.category}</span>
        <span className="text-nude-400"> — {item.reason}</span>
      </div>
    </div>
  );
}

export default function LookResult({ result }) {
  const [expanded, setExpanded] = useState(null);

  function toggle(i) {
    setExpanded((prev) => (prev === i ? null : i));
  }

  return (
    <div>
      {/* Summary banner */}
      <div
        className="rounded-2xl p-6 mb-6 border border-rose-200"
        style={{ background: "linear-gradient(135deg, #fff1f2, #f8f2f7)" }}
      >
        <h2 className="font-serif text-xl text-nude-800 mb-1">
          {result.occasion} · {result.intensity.label}
        </h2>
        <p className="text-nude-400 text-sm">
          ~{result.estimatedMinutes} minutes · {result.productCount} products from your stash
        </p>

        {result.analysis.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {result.analysis.map((note, i) => (
              <div
                key={i}
                className="flex gap-2.5 text-sm text-nude-600 bg-white/60 rounded-lg px-3 py-2"
              >
                <span className="text-rose-400 shrink-0 mt-0.5">✦</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application steps */}
      <h3 className="font-serif text-lg text-nude-700 mb-3">Application Order</h3>
      <div className="flex flex-col gap-2 mb-8">
        {result.steps.map((step, i) => (
          <StepRow
            key={i}
            step={step}
            index={i}
            isExpanded={expanded === i}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>

      {/* Missing products */}
      {result.missing.length > 0 && (
        <div
          className="rounded-xl p-5 border border-blush-100"
          style={{ background: "#fdf4f0" }}
        >
          <h4 className="text-sm font-bold text-nude-700 mb-4">
            Products to Consider Adding
          </h4>
          <div className="flex flex-col gap-3">
            {result.missing.map((m, i) => (
              <MissingProduct key={i} item={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
