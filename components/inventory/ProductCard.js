"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";

// Expiry status calculator
function getExpiryStatus(openedDate, expiryMonths) {
  if (!openedDate || !expiryMonths) return null;
  const exp = new Date(openedDate);
  exp.setMonth(exp.getMonth() + expiryMonths);
  const daysLeft = Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0)    return { label: "Expired",              color: "#ef4444", bg: "#fef2f2" };
  if (daysLeft < 30)   return { label: `${daysLeft}d left`,    color: "#f97316", bg: "#fff7ed" };
  if (daysLeft < 90)   return { label: `${Math.ceil(daysLeft/30)}mo left`, color: "#eab308", bg: "#fefce8" };
  return null; // don't show if plenty of time
}

export default function ProductCard({ product }) {
  const { removeProduct, toggleFavourite } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const expiry = getExpiryStatus(product.openedDate, product.expiryMonths);

  const attrs = [
    product.finish   && { label: product.finish,   type: "finish" },
    product.formula  && { label: product.formula,  type: "formula" },
    product.coverage && { label: product.coverage, type: "coverage" },
  ].filter(Boolean);

  return (
    <div className={`bg-white border rounded-xl transition-all duration-200 group
                    ${product.favourite
                      ? "border-rose-200 shadow-sm shadow-rose-100"
                      : "border-nude-100 hover:border-rose-200"}`}>

      {/* ── Top: swatch strip + category + favourite ──────────────── */}
      <div className="flex items-center gap-0 rounded-t-xl overflow-hidden">
        {/* Shade swatch strip */}
        <div
          className="w-2 self-stretch shrink-0 rounded-tl-xl"
          style={{ background: product.shadeHex || "transparent",
                   minHeight: 8,
                   border: product.shadeHex ? "none" : "none" }}
        />
        <div className="flex-1 flex items-center justify-between px-3 pt-3 pb-1">
          <span className="pill pill-rose">{product.category}</span>
          <div className="flex items-center gap-1">
            {/* Favourite heart */}
            <button
              onClick={() => toggleFavourite(product.id)}
              className={`text-base bg-transparent border-none cursor-pointer transition-all
                ${product.favourite
                  ? "opacity-100 scale-110"
                  : "opacity-0 group-hover:opacity-60 hover:!opacity-100"}`}
              title={product.favourite ? "Remove from favourites" : "Add to favourites"}
            >
              {product.favourite ? "❤️" : "🤍"}
            </button>
            {/* Delete */}
            {!confirmDelete
              ? <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-nude-300 hover:text-rose-400 bg-transparent border-none
                             cursor-pointer text-sm opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove"
                >✕</button>
              : <div className="flex items-center gap-1">
                  <button onClick={() => removeProduct(product.id)}
                    className="text-[10px] font-bold text-white bg-rose-500 rounded-full px-2 py-0.5
                               cursor-pointer border-none font-sans">Del</button>
                  <button onClick={() => setConfirmDelete(false)}
                    className="text-[10px] text-nude-500 bg-nude-100 rounded-full px-2 py-0.5
                               cursor-pointer border-none font-sans">No</button>
                </div>
            }
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="px-3 pb-3">
        {/* Brand + shade row */}
        <div className="flex items-start gap-2 mb-1.5">
          {/* Swatch circle */}
          {product.shadeHex && (
            <div
              className="w-5 h-5 rounded-full border border-nude-100 shrink-0 mt-0.5"
              style={{ background: product.shadeHex }}
              title={product.shade || product.shadeHex}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm text-nude-800 truncate font-sans">
              {product.brand || <span className="text-nude-400 font-normal italic">No brand</span>}
            </div>
            {product.shade && (
              <div className="text-xs text-nude-500 truncate font-sans">{product.shade}</div>
            )}
          </div>
        </div>

        {/* Attribute pills */}
        {attrs.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {attrs.map(a => (
              <span key={a.label}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium font-sans
                           bg-nude-50 text-nude-500 border border-nude-100">
                {a.label}
              </span>
            ))}
          </div>
        )}

        {/* Notes */}
        {product.notes && (
          <p className="text-[11px] text-nude-400 truncate font-sans mt-1">{product.notes}</p>
        )}

        {/* Price */}
        {product.price && (
          <p className="text-[11px] text-nude-400 font-sans mt-0.5">
            ${parseFloat(product.price).toFixed(2)}
          </p>
        )}

        {/* Expiry warning */}
        {expiry && (
          <div
            className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-sans"
            style={{ background: expiry.bg, color: expiry.color }}
          >
            ⏰ {expiry.label}
          </div>
        )}
      </div>
    </div>
  );
}
