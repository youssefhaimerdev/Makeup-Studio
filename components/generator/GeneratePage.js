"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { generateLook } from "@/lib/lookGenerator";
import { saveToStorage } from "@/lib/storage";
import { OCCASIONS, INTENSITIES, TIME_OPTIONS } from "@/lib/constants";
import OccasionPicker from "./OccasionPicker";
import IntensityPicker from "./IntensityPicker";
import LookResult from "./LookResult";
import EmptyState from "@/components/ui/EmptyState";
import { ButtonPrimary } from "@/components/ui/Button";

const LOOK_KEY = "mis_last_look";

export default function GeneratePage() {
  const { inventory, profile, hydrated, markFirstLook } = useApp();

  const [occasion,  setOccasion]  = useState(OCCASIONS[0]);
  const [intensity, setIntensity] = useState(INTENSITIES[2]);
  const [time,      setTime]      = useState(TIME_OPTIONS[2]);
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);

  function handleGenerate() {
    if (!inventory.length) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const look = generateLook(inventory, profile, occasion, intensity, time);
      saveToStorage(LOOK_KEY, { occasion, intensity, steps: look.steps });
      setResult(look);
      setLoading(false);
      markFirstLook(); // triggers confetti + toast on first ever look
    }, 600);
  }

  if (!hydrated) return null;

  if (inventory.length === 0) {
    return (
      <div className="page-container">
        <h1 className="page-title">Generate a Look</h1>
        <EmptyState
          icon="🧴"
          title="Add products first"
          description="Head to My Products and add your makeup items. Then come back to generate personalised looks."
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Generate a Look</h1>
      <p className="page-subtitle">
        Build a complete, step-by-step routine using only your existing products.
      </p>

      {/* Controls panel */}
      <div className="bg-white border border-nude-100 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <OccasionPicker value={occasion} onChange={setOccasion} />
          <IntensityPicker
            intensity={intensity}
            onIntensity={setIntensity}
            time={time}
            onTime={setTime}
          />
        </div>

        <ButtonPrimary onClick={handleGenerate} disabled={loading}>
          {loading ? "✨ Generating…" : "✨ Generate My Look"}
        </ButtonPrimary>
      </div>

      {/* Results */}
      {result && (
        <>
          <LookResult result={result} />
          <div className="mt-6 p-4 rounded-xl border border-rose-100 bg-rose-50/60 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-rose-700">Look saved for AI Evaluation</p>
              <p className="text-xs text-rose-500 mt-0.5">
                Go to AI Evaluation to upload a selfie and get scored on this exact look.
              </p>
            </div>
            <span className="text-xl shrink-0">✦</span>
          </div>
        </>
      )}
    </div>
  );
}
