"use client";

import { useEffect, useState } from "react";

const TYPE_STYLES = {
  success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", icon: "✓" },
  info:    { bg: "#f8f2f7", border: "#dfc0d8", text: "#7d3f71", icon: "✦" },
  error:   { bg: "#fff1f2", border: "#fecdd3", text: "#e11d48", icon: "✕" },
};

export default function Toast({ toast }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;
    // Tiny delay so the CSS transition fires
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, [toast?.id]);

  useEffect(() => {
    if (!toast) setVisible(false);
  }, [toast]);

  if (!toast) return null;

  const style = TYPE_STYLES[toast.type] ?? TYPE_STYLES.success;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[200] pointer-events-none"
      style={{ transform: "translateX(-50%)" }}
    >
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border font-sans text-sm font-medium
                   transition-all duration-300"
        style={{
          background:   style.bg,
          borderColor:  style.border,
          color:        style.text,
          opacity:      visible ? 1 : 0,
          transform:    visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.95)",
          minWidth:     220,
          maxWidth:     360,
        }}
      >
        <span className="text-base font-bold">{style.icon}</span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
