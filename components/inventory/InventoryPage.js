"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { FINISHES } from "@/lib/constants";
import ProductForm from "./ProductForm";
import ProductCard from "./ProductCard";
import GapAnalysis from "./GapAnalysis";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { ButtonPrimary, ButtonGhost } from "@/components/ui/Button";

const SORT_OPTIONS = [
  { id: "added",    label: "Recently Added" },
  { id: "category", label: "Category A–Z" },
  { id: "brand",    label: "Brand A–Z" },
  { id: "favourite",label: "❤️ Favourites" },
  { id: "expiry",   label: "⏰ Expiring Soon" },
];

function isExpiringSoon(product) {
  if (!product.openedDate || !product.expiryMonths) return Infinity;
  const exp = new Date(product.openedDate);
  exp.setMonth(exp.getMonth() + product.expiryMonths);
  return (exp - new Date()) / (1000 * 60 * 60 * 24);
}

export default function InventoryPage() {
  const { inventory, hydrated } = useApp();
  const [showForm,    setShowForm]    = useState(false);
  const [search,      setSearch]      = useState("");
  const [filterCat,   setFilterCat]   = useState("All");
  const [filterFinish,setFilterFinish]= useState("All");
  const [sortBy,      setSortBy]      = useState("added");
  const [showFavOnly, setShowFavOnly] = useState(false);

  // Unique categories in inventory
  const categories = useMemo(() =>
    ["All", ...new Set(inventory.map(p => p.category))].sort(),
    [inventory]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = inventory.filter(p => {
      const matchCat    = filterCat    === "All" || p.category === filterCat;
      const matchFinish = filterFinish === "All" || p.finish   === filterFinish;
      const matchFav    = !showFavOnly || p.favourite;
      const matchText   = !q ||
        p.category.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)   ||
        p.shade?.toLowerCase().includes(q)   ||
        p.notes?.toLowerCase().includes(q);
      return matchCat && matchFinish && matchFav && matchText;
    });

    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === "category")  return a.category.localeCompare(b.category);
      if (sortBy === "brand")     return (a.brand || "").localeCompare(b.brand || "");
      if (sortBy === "favourite") return (b.favourite ? 1 : 0) - (a.favourite ? 1 : 0);
      if (sortBy === "expiry")    return isExpiringSoon(a) - isExpiringSoon(b);
      return b.id - a.id; // recently added (default)
    });

    return list;
  }, [inventory, search, filterCat, filterFinish, showFavOnly, sortBy]);

  const favouriteCount = inventory.filter(p => p.favourite).length;
  const expiringCount  = inventory.filter(p => isExpiringSoon(p) < 30).length;

  if (!hydrated) return (
    <div className="page-container">
      <div className="h-8 skeleton rounded-xl w-48 mb-2" />
      <div className="h-4 skeleton rounded w-64 mb-8" />
      <SkeletonGrid count={6} />
    </div>
  );

  return (
    <div className="page-container">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">My Products</h1>
          <p className="page-subtitle">
            {inventory.length} product{inventory.length !== 1 ? "s" : ""} across{" "}
            {new Set(inventory.map(p => p.category)).size} categories
            {favouriteCount > 0 && ` · ${favouriteCount} ❤️`}
            {expiringCount  > 0 && ` · ${expiringCount} ⏰`}
          </p>
        </div>
        <ButtonPrimary onClick={() => setShowForm(v => !v)}>
          {showForm ? "✕ Close" : "+ Add Product"}
        </ButtonPrimary>
      </div>

      {/* ── Product form ──────────────────────────────────────────── */}
      {showForm && <ProductForm onClose={() => setShowForm(false)} />}

      {/* ── Empty state ───────────────────────────────────────────── */}
      {inventory.length === 0 && !showForm && (
        <EmptyState
          icon="🧴"
          title="Your stash is empty"
          description="Add your first product — brand, shade, finish, and swatch colour. Takes under a minute."
          action={
            <ButtonPrimary onClick={() => setShowForm(true)}>
              + Add Your First Product
            </ButtonPrimary>
          }
        />
      )}

      {/* ── Filters & sort ────────────────────────────────────────── */}
      {inventory.length > 0 && (
        <div className="flex flex-col gap-3 mb-5">
          {/* Search + quick filters row */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search brand, shade, category…"
              className="input-field flex-1 min-w-[180px] !rounded-full"
            />
            {/* Favourite toggle */}
            <button
              onClick={() => setShowFavOnly(v => !v)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium
                          font-sans cursor-pointer transition-all border
                ${showFavOnly
                  ? "bg-rose-50 border-rose-300 text-rose-600"
                  : "bg-white border-nude-200 text-nude-500 hover:border-rose-200"}`}
            >
              ❤️ Favourites {favouriteCount > 0 && `(${favouriteCount})`}
            </button>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map(cat => (
              <ButtonGhost key={cat} active={filterCat === cat}
                           onClick={() => setFilterCat(cat)}>
                {cat}
              </ButtonGhost>
            ))}
            {categories.length > 8 && (
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
                className="rounded-full border border-nude-200 px-3 py-1 text-xs text-nude-600
                           bg-white cursor-pointer font-sans focus:border-rose-300"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>

          {/* Finish filter + Sort row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Finish filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-nude-400 font-sans">Finish:</span>
              <div className="flex gap-1.5 flex-wrap">
                {["All", ...FINISHES.map(f => f.id)].map(fid => {
                  const fin = FINISHES.find(f => f.id === fid);
                  return (
                    <button key={fid}
                      onClick={() => setFilterFinish(fid)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px]
                                  font-medium font-sans cursor-pointer transition-all border
                        ${filterFinish === fid
                          ? "bg-nude-800 border-nude-800 text-white"
                          : "bg-white border-nude-200 text-nude-500 hover:border-nude-400"}`}
                    >
                      {fin && <span className="w-2 h-2 rounded-full" style={{ background: fin.swatch }} />}
                      {fid === "All" ? "All" : fin?.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-nude-400 font-sans">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="rounded-full border border-nude-200 px-3 py-1.5 text-xs text-nude-600
                           bg-white cursor-pointer font-sans focus:border-rose-300"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Products grid ─────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {filtered.length === 0 && inventory.length > 0 && (
        <div className="text-center py-12">
          <div className="text-3xl mb-3 opacity-40">🔍</div>
          <p className="text-nude-400 text-sm font-sans">No products match those filters.</p>
          <button onClick={() => { setSearch(""); setFilterCat("All"); setFilterFinish("All"); setShowFavOnly(false); }}
            className="mt-2 text-rose-500 text-xs font-semibold font-sans cursor-pointer bg-transparent border-none hover:underline">
            Clear filters
          </button>
        </div>
      )}

      {/* ── Gap analysis ──────────────────────────────────────────── */}
      <GapAnalysis />
    </div>
  );
}
