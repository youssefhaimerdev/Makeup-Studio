"use client";

import { useState, useRef, useCallback } from "react";
import { ButtonPrimary } from "@/components/ui/Button";

export default function AIUpload({ onImageReady, disabled }) {
  const [preview, setPreview]   = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Pass the raw file up — compression happens in the parent during analysis
    onImageReady(file);
  }, [onImageReady]);

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true);  };
  const onDragLeave = ()  => setDragging(false);

  return (
    <div className="w-full">
      {!preview ? (
        /* ── Drop zone ─────────────────────────────────────────────────── */
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`
            relative flex flex-col items-center justify-center gap-4
            border-2 border-dashed rounded-2xl p-10 cursor-pointer
            transition-all duration-200 select-none
            ${dragging
              ? "border-rose-400 bg-rose-50"
              : "border-nude-200 bg-nude-50 hover:border-rose-300 hover:bg-rose-50/40"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {/* Upload icon */}
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>

          <div className="text-center">
            <p className="font-semibold text-nude-700 mb-1">Upload your selfie</p>
            <p className="text-sm text-nude-400">
              Drag and drop or{" "}
              <span className="text-rose-500 font-semibold underline">browse files</span>
            </p>
            <p className="text-xs text-nude-300 mt-2">JPG, PNG or WEBP · Max 10MB</p>
          </div>

          {/* Tips */}
          <div className="flex flex-wrap gap-3 justify-center mt-1">
            {[
              "Face clearly visible",
              "Good lighting",
              "Front-facing",
            ].map((tip) => (
              <span
                key={tip}
                className="text-xs bg-white border border-nude-100 rounded-full px-3 py-1 text-nude-500"
              >
                ✓ {tip}
              </span>
            ))}
          </div>
        </div>
      ) : (
        /* ── Preview ────────────────────────────────────────────────────── */
        <div className="relative">
          <img
            src={preview}
            alt="Uploaded selfie preview"
            className="w-full max-h-96 object-contain rounded-2xl border border-nude-100"
          />
          {/* Change photo button */}
          <button
            onClick={() => { setPreview(null); inputRef.current?.click(); }}
            disabled={disabled}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-nude-200
                       rounded-full px-3 py-1.5 text-xs text-nude-600 font-semibold cursor-pointer
                       hover:border-rose-300 hover:text-rose-600 transition-colors disabled:opacity-50"
          >
            Change photo
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onInputChange}
        disabled={disabled}
      />
    </div>
  );
}
