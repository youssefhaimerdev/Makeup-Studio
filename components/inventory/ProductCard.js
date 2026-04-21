"use client";

import { useApp } from "@/lib/AppContext";

export default function ProductCard({ product }) {
  const { removeProduct } = useApp();

  return (
    <div className="bg-white border border-nude-100 rounded-xl px-4 py-3.5 flex justify-between items-start
                    hover:border-rose-200 transition-colors duration-150">
      <div className="flex-1 min-w-0">
        <span className="pill pill-rose inline-block mb-1.5">{product.category}</span>
        <div className="font-semibold text-sm text-nude-800 truncate">
          {product.brand || <span className="text-nude-400 font-normal italic">No brand</span>}
        </div>
        {product.shade && (
          <div className="text-xs text-nude-500 mt-0.5 truncate">{product.shade}</div>
        )}
        {product.notes && (
          <div className="text-xs text-nude-400 mt-0.5 truncate">{product.notes}</div>
        )}
      </div>
      <button
        onClick={() => removeProduct(product.id)}
        className="ml-3 shrink-0 text-nude-300 hover:text-rose-400 bg-transparent border-none
                   cursor-pointer text-base transition-colors"
        title="Remove product"
        aria-label={`Remove ${product.brand || product.category}`}
      >
        ✕
      </button>
    </div>
  );
}
