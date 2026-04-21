"use client";

export default function Card({ children, className = "", onClick }) {
  const base = "bg-white border border-nude-100 rounded-2xl p-6 transition-all duration-200";
  const interactive = onClick ? "cursor-pointer hover:border-rose-200 hover:shadow-sm" : "";
  return (
    <div className={`${base} ${interactive} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function CardCompact({ children, className = "", onClick, highlighted = false }) {
  const base = "bg-white border rounded-xl px-4 py-3.5 transition-all duration-150";
  const border = highlighted ? "border-rose-200" : "border-nude-100 hover:border-rose-200";
  const interactive = onClick ? "cursor-pointer" : "";
  return (
    <div className={`${base} ${border} ${interactive} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
