"use client";

import { useEffect, useRef } from "react";

/**
 * Wraps page content with a fade+slide-up entrance animation.
 * Re-triggers every time the `pageKey` prop changes (i.e. navigation).
 */
export default function PageTransition({ pageKey, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Remove then re-add the class to force re-trigger
    el.classList.remove("page-enter");
    void el.offsetWidth; // reflow
    el.classList.add("page-enter");
  }, [pageKey]);

  return (
    <div ref={ref} className="page-enter">
      {children}
    </div>
  );
}
