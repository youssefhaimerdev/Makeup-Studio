"use client";

import { useEffect, useCallback } from "react";
import { PAGES } from "@/lib/routes";

const STEPS = [
  {
    id:     "products",
    icon:   "🧴",
    label:  "Add your products",
    desc:   "Drop in your makeup stash — brand, shade, finish. Takes 2 minutes.",
    page:   PAGES.INVENTORY,
    cta:    "Add Products",
    check:  (inv) => inv.length > 0,
  },
  {
    id:     "profile",
    icon:   "✦",
    label:  "Set your skin profile",
    desc:   "Skin tone, undertone, type, eye colour, and concerns.",
    page:   PAGES.PROFILE,
    cta:    "Set Profile",
    check:  (inv, profile) => !!profile?.skinTone,
  },
  {
    id:     "look",
    icon:   "✨",
    label:  "Generate your first look",
    desc:   "Get a complete routine for any occasion using what you own.",
    page:   PAGES.GENERATE,
    cta:    "Generate Look",
    check:  (inv) => inv.length >= 3,
  },
];

export default function OnboardingModal({ inventory, profile, onNavigate, onDismiss }) {
  const completedCount = STEPS.filter(s => s.check(inventory, profile)).length;
  const allDone = completedCount === STEPS.length;

  // Close on Escape
  useEffect(() => {
    function fn(e) { if (e.key === "Escape") onDismiss(); }
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onDismiss]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function go(page) {
    onDismiss();
    onNavigate(page);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[201] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden
                     shadow-2xl flex flex-col"
          style={{ background: "var(--bg-card)" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header gradient */}
          <div
            className="px-6 pt-8 pb-6 text-center"
            style={{ background: "linear-gradient(135deg, #fff1f2, #f8f2f7)" }}
          >
            <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center
                            justify-center text-2xl mx-auto mb-4">
              ✦
            </div>
            <h2 className="font-serif text-2xl font-bold text-nude-800 mb-1">
              Welcome to Lumière
            </h2>
            <p className="text-sm text-nude-500 font-sans leading-relaxed">
              Your personal AI makeup studio. Complete these 3 steps to unlock
              personalised looks, smart pairings, and AI evaluation.
            </p>

            {/* Progress bar */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 bg-white/60 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(completedCount / STEPS.length) * 100}%`,
                    background: "linear-gradient(90deg, #fb7185, #b87aaa)",
                  }}
                />
              </div>
              <span className="text-xs font-bold font-sans text-nude-600 shrink-0">
                {completedCount}/{STEPS.length}
              </span>
            </div>
          </div>

          {/* Steps list */}
          <div className="px-5 py-4 flex flex-col gap-3">
            {STEPS.map((step, i) => {
              const done = step.check(inventory, profile);
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all
                    ${done
                      ? "border-green-100 dark:border-green-900"
                      : "border-nude-100 dark:border-[#2e1f12] hover:border-rose-200 cursor-pointer"
                    }`}
                  style={{ background: done ? "#f0fdf4" : "var(--bg-secondary)" }}
                  onClick={() => !done && go(step.page)}
                >
                  {/* Number or check */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm
                                font-bold font-sans shrink-0 transition-all
                      ${done
                        ? "bg-green-500 text-white"
                        : "bg-white dark:bg-[#1e140c] border border-nude-200 dark:border-[#3d2a18] text-nude-500"
                      }`}
                  >
                    {done ? "✓" : i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold font-sans ${done ? "text-green-700" : "text-nude-800"}`}>
                      {step.icon} {step.label}
                    </div>
                    <div className="text-xs text-nude-400 font-sans leading-snug mt-0.5">
                      {step.desc}
                    </div>
                  </div>

                  {!done && (
                    <span className="text-rose-500 text-xs font-bold font-sans shrink-0 whitespace-nowrap">
                      {step.cta} →
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="px-5 pb-6 pt-2 flex flex-col gap-2">
            {allDone ? (
              <button
                onClick={() => go(PAGES.GENERATE)}
                className="btn-primary w-full justify-center"
              >
                ✨ Generate My First Look
              </button>
            ) : (
              <button
                onClick={() => go(STEPS.find(s => !s.check(inventory, profile))?.page || PAGES.HOME)}
                className="btn-primary w-full justify-center"
              >
                Continue Setup →
              </button>
            )}
            <button
              onClick={onDismiss}
              className="w-full py-2 text-sm text-nude-400 font-sans cursor-pointer
                         bg-transparent border-none hover:text-nude-600 transition-colors"
            >
              I'll explore on my own
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
