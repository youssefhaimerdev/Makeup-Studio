"use client";

import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver to a container ref.
 * All children with class "reveal", "reveal-left", or "reveal-right"
 * get the "visible" class added when they enter the viewport.
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const targets = el.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px", ...options }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return ref;
}
