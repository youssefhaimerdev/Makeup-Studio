"use client";

import { useState, useMemo, useCallback } from "react";
import { useApp } from "@/lib/AppContext";
import { LIBRARY_LOOKS, COLLECTIONS, getLooksByCollection, searchLooks } from "@/lib/lookLibrary";
import { matchAllLooks, READINESS_META } from "@/lib/inventoryMatcher";
import LookCard from "./LookCard";
import LookDetailModal from "./LookDetailModal";
import { PAGES } from "@/lib/routes";
import { SkeletonLookCard } from "@/components/ui/Skeleton";

// ── Seasonal section headers ───────────────────────────────────────────────
const SEASONAL_SECTIONS = [
  {
    id: "summer",
    label: "☀️ Summer 2025",
    desc: "Bronze, terracotta, and sun-kissed skin are dominating this season.",
    filter: l => l.season?.includes("Summer"),
  },
  {
    id: "spring",
    label: "🌸 Spring 2025",
    desc: "Pastel shadows and rosy cheeks are having their moment.",
    filter: l => l.season?.includes("Spring"),
  },
  {
    id: "trending",
    label: "🔥 Trending Now",
    desc: "The looks blowing up right now across beauty communities.",
    filter: l => l.season?.includes("Trending") || l.season === "Comeback",
  },
  {
    id: "holiday",
    label: "✨ Holiday Glam",
    desc: "All-out party season beauty — no holding back.",
    filter: l => l.season?.includes("Holiday"),
  },
];

// ── Readiness filter options ───────────────────────────────────────────────
const READINESS_FILTERS = [
  { id: "all",     label: "All Looks"   },
  { id: "perfect", label: "✓ Ready Now" },
  { id: "ready",   label: "Almost Ready"},
  { id: "partial", label: "Partial"     },
];

// ── Sort options ───────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { id: "match",      label: "Best Match"   },
  { id: "difficulty", label: "Easiest First"},
  { id: "time",       label: "Quickest"     },
  { id: "name",       label: "A–Z"          },
];

const DIFFICULTY_ORDER = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };

// ── Section header ─────────────────────────────────────────────────────────
function SectionHeader({ title, desc }) {
  return (
    <div className="mb-5">
      <h2 className="font-serif text-xl font-bold text-nude-800">{title}</h2>
      {desc && <p className="text-sm text-nude-400 font-sans mt-0.5">{desc}</p>}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptySearch({ query, onClear }) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3 opacity-40">🔍</div>
      <p className="font-serif text-lg text-nude-600 mb-2">
        No looks match "{query}"
      </p>
      <p className="text-sm text-nude-400 font-sans mb-4">
        Try searching by style (Soft Glam, Y2K), occasion, or vibe tag.
      </p>
      <button
        onClick={onClear}
        className="text-rose-500 text-sm font-semibold font-sans cursor-pointer
                   bg-transparent border-none hover:underline"
      >
        Clear search
      </button>
    </div>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────
function InventoryStats({ matches, inventoryCount }) {
  if (!inventoryCount) return null;
  const perfect  = Object.values(matches).filter(m => m.readiness === "perfect").length;
  const ready    = Object.values(matches).filter(m => m.readiness === "ready").length;
  const partial  = Object.values(matches).filter(m => m.readiness === "partial").length;

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white border border-nude-100 rounded-2xl mb-6">
      <div className="text-center">
        <div className="font-serif text-2xl font-bold text-green-600">{perfect}</div>
        <div className="text-[10px] text-nude-400 font-sans uppercase tracking-wide">Ready Now</div>
      </div>
      <div className="text-center">
        <div className="font-serif text-2xl font-bold text-rose-500">{ready}</div>
        <div className="text-[10px] text-nude-400 font-sans uppercase tracking-wide">Almost Ready</div>
      </div>
      <div className="text-center">
        <div className="font-serif text-2xl font-bold text-amber-500">{partial}</div>
        <div className="text-[10px] text-nude-400 font-sans uppercase tracking-wide">Partial Match</div>
      </div>
      <div className="ml-auto text-right">
        <div className="font-serif text-2xl font-bold text-nude-600">{LIBRARY_LOOKS.length}</div>
        <div className="text-[10px] text-nude-400 font-sans uppercase tracking-wide">Total Looks</div>
      </div>
    </div>
  );
}

// ── Main LibraryPage ───────────────────────────────────────────────────────
export default function LibraryPage({ setPage }) {
  const { inventory, hydrated } = useApp();

  const [activeCollection, setActiveCollection] = useState("all");
  const [search,            setSearch]           = useState("");
  const [readinessFilter,   setReadinessFilter]  = useState("all");
  const [sortBy,            setSortBy]           = useState("match");
  const [selectedLook,      setSelectedLook]     = useState(null);

  // Compute inventory matches for all looks (memoised)
  const allMatches = useMemo(
    () => matchAllLooks(LIBRARY_LOOKS, inventory),
    [inventory]
  );

  // Derive filtered + sorted look list
  const displayedLooks = useMemo(() => {
    let list = search
      ? searchLooks(search)
      : getLooksByCollection(activeCollection);

    // Readiness filter
    if (readinessFilter !== "all") {
      list = list.filter(l => allMatches[l.id]?.readiness === readinessFilter);
    }

    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === "match") {
        return (allMatches[b.id]?.score || 0) - (allMatches[a.id]?.score || 0);
      }
      if (sortBy === "difficulty") {
        return (DIFFICULTY_ORDER[a.difficulty] || 2) - (DIFFICULTY_ORDER[b.difficulty] || 2);
      }
      if (sortBy === "time") {
        return parseInt(a.time) - parseInt(b.time);
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return list;
  }, [search, activeCollection, readinessFilter, sortBy, allMatches]);

  // Seasonal section data (only shown when browsing "seasonal" tab)
  const seasonalSections = useMemo(() => {
    return SEASONAL_SECTIONS.map(sec => ({
      ...sec,
      looks: LIBRARY_LOOKS.filter(sec.filter),
    })).filter(sec => sec.looks.length > 0);
  }, []);

  const handleGenerate = useCallback((look) => {
    setSelectedLook(null);
    // Navigate to generate page — the look name/occasion will guide them
    setPage(PAGES.GENERATE);
  }, [setPage]);

  if (!hydrated) return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="h-8 skeleton rounded-xl w-48 mb-2"/>
      <div className="h-4 skeleton rounded w-72 mb-8"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonLookCard key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200
                        rounded-full px-3 py-1 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block"/>
          <span className="text-xs text-rose-600 font-semibold uppercase tracking-wide font-sans">
            {LIBRARY_LOOKS.length} curated looks
          </span>
        </div>
        <h1 className="page-title">Look Library</h1>
        <p className="page-subtitle">
          Browse curated looks by aesthetic, occasion, and season. See exactly which ones
          you can recreate right now with your existing products.
        </p>

        {/* Inventory match stats */}
        <InventoryStats matches={allMatches} inventoryCount={inventory.length} />
      </div>

      {/* ── Search bar ───────────────────────────────────────────── */}
      <div className="relative mb-5">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-nude-400 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveCollection("all"); }}
          placeholder="Search by name, style, vibe, or occasion…"
          className="input-field w-full !pl-11 !rounded-full !py-3"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-nude-400
                       hover:text-nude-600 bg-transparent border-none cursor-pointer text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Collection tabs ───────────────────────────────────────── */}
      {!search && (
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setActiveCollection("all")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium
                        font-sans cursor-pointer transition-all border
              ${activeCollection === "all"
                ? "bg-nude-800 border-nude-800 text-white"
                : "bg-white border-nude-200 text-nude-600 hover:border-nude-400"}`}
          >
            All Looks
            <span className="text-[10px] opacity-70">({LIBRARY_LOOKS.length})</span>
          </button>
          {COLLECTIONS.map(col => {
            const count = getLooksByCollection(col.id).length;
            return (
              <button
                key={col.id}
                onClick={() => setActiveCollection(col.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium
                            font-sans cursor-pointer transition-all border
                  ${activeCollection === col.id
                    ? "bg-rose-50 border-rose-300 text-rose-600"
                    : "bg-white border-nude-200 text-nude-600 hover:border-rose-200"}`}
              >
                <span>{col.emoji}</span>
                {col.label}
                <span className="text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Filter + sort row ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        {/* Readiness filter — only useful if inventory exists */}
        {inventory.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-nude-400 font-sans shrink-0">My stash:</span>
            <div className="flex flex-wrap gap-1.5">
              {READINESS_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setReadinessFilter(f.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium font-sans
                              cursor-pointer transition-all border
                    ${readinessFilter === f.id
                      ? "bg-rose-500 border-rose-500 text-white"
                      : "bg-white border-nude-200 text-nude-600 hover:border-rose-300"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-nude-400 font-sans">Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="rounded-full border border-nude-200 px-3 py-1.5 text-xs text-nude-600
                       bg-white cursor-pointer font-sans"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Seasonal sections (only when on "seasonal" tab) ───────── */}
      {activeCollection === "seasonal" && !search ? (
        <div className="flex flex-col gap-12">
          {seasonalSections.map(sec => (
            <div key={sec.id}>
              <SectionHeader title={sec.label} desc={sec.desc} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sec.looks.map(look => (
                  <LookCard
                    key={look.id}
                    look={look}
                    match={allMatches[look.id]}
                    onClick={() => setSelectedLook(look)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Standard grid ──────────────────────────────────────── */
        <>
          {search && displayedLooks.length === 0 ? (
            <EmptySearch query={search} onClear={() => setSearch("")} />
          ) : (
            <>
              {/* Result count */}
              {(search || readinessFilter !== "all") && (
                <p className="text-sm text-nude-400 font-sans mb-4">
                  {displayedLooks.length} look{displayedLooks.length !== 1 ? "s" : ""} found
                  {readinessFilter !== "all" && ` · ${READINESS_META[readinessFilter]?.label}`}
                </p>
              )}

              {/* Inventory empty nudge */}
              {inventory.length === 0 && (
                <div className="p-4 bg-nude-50 border border-nude-100 rounded-xl mb-5 flex items-center gap-3">
                  <span className="text-xl">💡</span>
                  <p className="text-sm text-nude-600 font-sans">
                    <strong className="text-nude-800">Add your products</strong> to see which looks
                    you can already recreate — and which ones need one or two more items.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedLooks.map(look => (
                  <LookCard
                    key={look.id}
                    look={look}
                    match={allMatches[look.id]}
                    onClick={() => setSelectedLook(look)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Detail modal ─────────────────────────────────────────── */}
      {selectedLook && (
        <LookDetailModal
          look={selectedLook}
          match={allMatches[selectedLook.id]}
          onClose={() => setSelectedLook(null)}
          onGenerate={handleGenerate}
        />
      )}
    </div>
  );
}
