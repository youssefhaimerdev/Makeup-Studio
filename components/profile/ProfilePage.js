"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { SKIN_TONES, UNDERTONES, SKIN_TYPES, FACE_SHAPES } from "@/lib/constants";
import { ButtonPrimary } from "@/components/ui/Button";

function SectionLabel({ children }) {
  return (
    <h2 className="text-xs font-bold text-nude-500 uppercase tracking-widest mb-4">
      {children}
    </h2>
  );
}

export default function ProfilePage() {
  const { profile, updateProfile, hydrated } = useApp();
  const [local, setLocal]   = useState(profile);
  const [saved, setSaved]   = useState(false);

  function set(field, value) {
    setLocal((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    updateProfile(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!hydrated) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="page-title">Skin Profile</h1>
      <p className="page-subtitle">
        Your profile personalises generated looks, harmony suggestions, and diagnoses.
      </p>

      {/* Skin Tone */}
      <section className="mb-8">
        <SectionLabel>Skin Tone</SectionLabel>
        <div className="flex flex-wrap gap-3">
          {SKIN_TONES.map((tone) => (
            <button
              key={tone.id}
              onClick={() => set("skinTone", tone.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-150 border bg-white
                ${local.skinTone === tone.id
                  ? "border-rose-400 shadow-sm"
                  : "border-nude-100 hover:border-rose-200"
                }`}
            >
              <div
                className="w-8 h-8 rounded-full border border-black/10"
                style={{ background: tone.hex }}
              />
              <span
                className={`text-[11px] whitespace-nowrap ${
                  local.skinTone === tone.id ? "text-rose-600 font-semibold" : "text-nude-500"
                }`}
              >
                {tone.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Undertone */}
      <section className="mb-8">
        <SectionLabel>Undertone</SectionLabel>
        <div className="flex flex-wrap gap-3">
          {UNDERTONES.map((ut) => (
            <button
              key={ut.id}
              onClick={() => set("undertone", ut.id)}
              className={`text-left rounded-2xl px-4 py-2.5 cursor-pointer transition-all duration-150 border bg-white
                ${local.undertone === ut.id
                  ? "border-rose-300 bg-rose-50"
                  : "border-nude-100 hover:border-rose-200"
                }`}
            >
              <div
                className={`text-sm font-semibold mb-0.5 ${
                  local.undertone === ut.id ? "text-rose-600" : "text-nude-700"
                }`}
              >
                {ut.id}
              </div>
              <div className="text-xs text-nude-400">{ut.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Skin Type */}
      <section className="mb-8">
        <SectionLabel>Skin Type</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {SKIN_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => set("skinType", type)}
              className={`rounded-full px-4 py-2 text-sm cursor-pointer transition-all duration-150 border
                ${local.skinType === type
                  ? "bg-rose-50 border-rose-300 text-rose-600 font-semibold"
                  : "bg-white border-nude-100 text-nude-600 hover:border-rose-200"
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* Face Shape */}
      <section className="mb-10">
        <SectionLabel>
          Face Shape{" "}
          <span className="normal-case font-normal text-nude-400">(optional)</span>
        </SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FACE_SHAPES.map((shape) => (
            <button
              key={shape.id}
              onClick={() => set("faceShape", shape.id)}
              className={`text-left rounded-xl px-4 py-3 cursor-pointer transition-all duration-150 border bg-white
                ${local.faceShape === shape.id
                  ? "border-rose-300 bg-rose-50"
                  : "border-nude-100 hover:border-rose-200"
                }`}
            >
              <div
                className={`text-sm font-semibold mb-0.5 ${
                  local.faceShape === shape.id ? "text-rose-700" : "text-nude-700"
                }`}
              >
                {shape.label}
              </div>
              <div className="text-xs text-nude-400 leading-snug">{shape.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <ButtonPrimary onClick={handleSave}>Save Profile</ButtonPrimary>
        {saved && (
          <span className="text-sm text-rose-500 font-medium animate-pulse">
            ✓ Profile saved
          </span>
        )}
      </div>
    </div>
  );
}
