"use client";

import { useState, useEffect } from "react";
import { loadSavedLooks, saveLook, deleteSavedLook } from "@/lib/savedLooks";
import { ButtonPrimary } from "@/components/ui/Button";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function PaletteDots({ palette }) {
  if (!palette) return null;
  return (
    <div className="flex gap-1">
      {["skin", "blush", "eye", "lip"].map(k => (
        palette[k] && (
          <div key={k}
               className="w-3 h-3 rounded-full border border-white shadow-sm"
               style={{ background: palette[k] }}
               title={k}/>
        )
      ))}
    </div>
  );
}

export default function SaveLookPanel({ currentLook, onLoadLook }) {
  const [name,       setName]       = useState("");
  const [saved,      setSaved]      = useState([]);
  const [justSaved,  setJustSaved]  = useState(false);
  const [showList,   setShowList]   = useState(false);

  useEffect(() => {
    setSaved(loadSavedLooks());
  }, []);

  function handleSave() {
    if (!currentLook) return;
    const trimmed = name.trim() || currentLook.trendName || "My Look";
    const updated = saveLook(currentLook, trimmed);
    setSaved(updated);
    setName("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
  }

  function handleDelete(id, e) {
    e.stopPropagation();
    const updated = deleteSavedLook(id);
    setSaved(updated);
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Save current look ──────────────────────────────────────── */}
      <div className="bg-white border border-nude-100 rounded-xl p-4">
        <p className="text-xs font-bold text-nude-500 uppercase tracking-wide font-sans mb-3">
          Save this look
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()}
            placeholder={currentLook?.trendName || "Give this look a name…"}
            className="input-field flex-1 !py-2 !text-sm"
            maxLength={50}
          />
          <ButtonPrimary onClick={handleSave} className="!px-4 !py-2 !text-sm !shadow-none shrink-0">
            Save ❤
          </ButtonPrimary>
        </div>
        {justSaved && (
          <p className="text-xs text-rose-500 font-semibold font-sans mt-2 animate-pulse">
            ✓ Look saved to your collection!
          </p>
        )}
      </div>

      {/* ── Saved looks list ──────────────────────────────────────── */}
      {saved.length > 0 && (
        <div className="bg-white border border-nude-100 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowList(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-nude-50
                       hover:bg-nude-100 transition-colors border-none cursor-pointer font-sans"
          >
            <span className="text-xs font-bold text-nude-600 uppercase tracking-wide">
              Saved Looks ({saved.length})
            </span>
            <span className={`text-nude-400 text-sm transition-transform duration-200 ${showList ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>

          {showList && (
            <div className="divide-y divide-nude-50 max-h-72 overflow-y-auto">
              {saved.map(look => (
                <div
                  key={look.id}
                  onClick={() => onLoadLook?.(look)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-nude-50
                             cursor-pointer transition-colors group"
                >
                  {/* Palette dots */}
                  <PaletteDots palette={look.palette} />

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-nude-800 font-sans truncate">
                      {look.name}
                    </p>
                    <p className="text-[11px] text-nude-400 font-sans">
                      {look.trendName && `${look.trendName} · `}{formatDate(look.savedAt)}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={e => handleDelete(look.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity
                               text-nude-300 hover:text-rose-400 bg-transparent border-none
                               cursor-pointer text-sm shrink-0"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
