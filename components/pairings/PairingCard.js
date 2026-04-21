"use client";

import Badge from "@/components/ui/Badge";

export default function PairingCard({ pairing }) {
  const isGap = pairing.type === "Gap";

  return (
    <div
      className={`bg-white border rounded-2xl p-5 transition-all duration-150
        ${isGap ? "border-rose-100" : "border-nude-100 hover:border-rose-200"}`}
    >
      <div className="flex gap-3 items-start">
        <span className="text-xl shrink-0">{pairing.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-serif text-base text-nude-800">{pairing.title}</h3>
            <Badge variant={pairing.type}>{pairing.type}</Badge>
          </div>
          <p className="text-sm text-nude-500 leading-relaxed">{pairing.desc}</p>

          {pairing.products.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {pairing.products.map((product, i) => (
                <span
                  key={i}
                  className="pill bg-rose-50 text-rose-700 font-medium"
                >
                  {product.category}
                  {product.shade ? ` · ${product.shade}` : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
