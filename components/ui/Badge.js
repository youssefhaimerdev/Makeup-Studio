"use client";

const VARIANTS = {
  rose: "bg-rose-50 text-rose-600",
  nude: "bg-nude-50 text-nude-600",
  mauve: "bg-mauve-50 text-mauve-600",
  blush: "bg-blush-50 text-blush-600",
  high: "bg-rose-50 text-rose-600",
  medium: "bg-blush-50 text-blush-600",
  low: "bg-nude-50 text-nude-500",
  gap: "bg-rose-50 text-rose-500",
  harmony: "bg-mauve-50 text-mauve-600",
  balance: "bg-nude-50 text-nude-600",
  technique: "bg-blush-50 text-blush-600",
  sculpt: "bg-nude-50 text-nude-600",
  "skin type": "bg-mauve-50 text-mauve-600",
};

export default function Badge({ children, variant = "nude" }) {
  const cls = VARIANTS[variant.toLowerCase()] ?? VARIANTS.nude;
  return (
    <span className={`pill ${cls} uppercase tracking-wide`}>
      {children}
    </span>
  );
}
