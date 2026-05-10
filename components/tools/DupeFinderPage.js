"use client";

import { useState, useMemo } from "react";
import { searchDupes, getDupesByCategory, DUPE_CATEGORIES, DUPE_DATABASE } from "@/lib/dupeData";
import { PAGES } from "@/lib/routes";

function SimilarityBar({ score }) {
  const colour = score >= 90 ? "#16a34a" : score >= 85 ? "#e11d48" : "#f59e0b";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden"
           style={{ background: "var(--bg-subtle)" }}>
        <div className="h-full rounded-full transition-all duration-700"
             style={{ width: `${score}%`, background: colour }}/>
      </div>
      <span className="text-xs font-bold font-sans shrink-0" style={{ color: colour }}>
        {score}%
      </span>
    </div>
  );
}

function DupeCard({ entry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border overflow-hidden transition-all"
         style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      {/* Hero product */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="pill bg-rose-50 text-rose-600 mb-1.5 inline-block">
              {entry.category}
            </span>
            <h3 className="font-serif text-base font-bold" style={{ color: "var(--text-primary)" }}>
              {entry.hero.brand}
            </h3>
            <p className="text-sm font-sans" style={{ color: "var(--text-muted)" }}>
              {entry.hero.name}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="font-serif text-xl font-bold text-rose-600">${entry.hero.price}</div>
            <div className="text-[10px] font-sans" style={{ color: "var(--text-faint)" }}>retail</div>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          {entry.finish && (
            <span className="pill" style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: `1px solid var(--border)` }}>
              {entry.finish}
            </span>
          )}
          {entry.coverage && (
            <span className="pill" style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: `1px solid var(--border)` }}>
              {entry.coverage}
            </span>
          )}
        </div>
      </div>

      {/* Dupes */}
      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {entry.dupes.map((dupe, i) => (
          <div key={i} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold font-sans" style={{ color: "var(--text-primary)" }}>
                  {dupe.brand}
                </p>
                <p className="text-xs font-sans" style={{ color: "var(--text-muted)" }}>
                  {dupe.name}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-serif text-lg font-bold text-green-600">${dupe.price}</div>
                <div className="text-[9px] font-sans text-green-600 font-semibold">
                  Save ${entry.hero.price - dupe.price}
                </div>
              </div>
            </div>
            <SimilarityBar score={dupe.similarity}/>
            <p className="text-xs font-sans mt-2 leading-relaxed"
               style={{ color: "var(--text-muted)" }}>
              {dupe.why}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DupeFinderPage({ setPage }) {
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("All");

  const results = useMemo(() => {
    if (search.trim()) return searchDupes(search);
    return getDupesByCategory(category);
  }, [search, category]);

  const totalSavings = DUPE_DATABASE.reduce((sum, d) =>
    sum + d.dupes.reduce((s, dp) => s + (d.hero.price - dp.price), 0), 0
  );

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => setPage(PAGES.TOOLS)}
        className="text-xs font-sans cursor-pointer bg-transparent border-none mb-5"
        style={{ color: "var(--text-muted)" }}>← Back to Tools</button>

      <h1 className="page-title">💡 Dupe Finder</h1>
      <p className="page-subtitle">
        {DUPE_DATABASE.length} luxury products. Find drugstore alternatives
        that perform just as well — at a fraction of the price.
      </p>

      {/* Stat */}
      <div className="flex gap-4 p-4 rounded-2xl border mb-6"
           style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div>
          <div className="font-serif text-2xl font-bold text-green-600">${totalSavings.toLocaleString()}</div>
          <div className="text-[10px] font-sans uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            Total possible savings
          </div>
        </div>
        <div>
          <div className="font-serif text-2xl font-bold text-rose-600">{DUPE_DATABASE.length}</div>
          <div className="text-[10px] font-sans uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            Hero products catalogued
          </div>
        </div>
        <div>
          <div className="font-serif text-2xl font-bold text-rose-600">
            {DUPE_DATABASE.reduce((s, d) => s + d.dupes.length, 0)}
          </div>
          <div className="text-[10px] font-sans uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            Dupe alternatives
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
             style={{ color: "var(--text-faint)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setCategory("All"); }}
          placeholder="Search by brand, product, or category…"
          className="input-field !pl-10 !rounded-full !py-3"
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm cursor-pointer
                       bg-transparent border-none" style={{ color: "var(--text-faint)" }}>✕</button>
        )}
      </div>

      {/* Category filter */}
      {!search && (
        <div className="flex flex-wrap gap-2 mb-6">
          {DUPE_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium font-sans
                         cursor-pointer transition-all border"
              style={{
                background:  category === cat ? "#fff1f2" : "var(--bg-card)",
                borderColor: category === cat ? "#fecdd3" : "var(--border)",
                color:       category === cat ? "#e11d48" : "var(--text-muted)",
                fontWeight:  category === cat ? 600 : 400,
              }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3 opacity-40">💡</div>
          <p className="font-serif text-lg" style={{ color: "var(--text-secondary)" }}>
            No dupes found for "{search}"
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {results.map(entry => <DupeCard key={entry.id} entry={entry}/>)}
        </div>
      )}
    </div>
  );
}
