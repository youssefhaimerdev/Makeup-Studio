"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import ProductForm from "./ProductForm";
import ProductCard from "./ProductCard";
import GapAnalysis from "./GapAnalysis";
import EmptyState from "@/components/ui/EmptyState";
import { ButtonPrimary, ButtonGhost } from "@/components/ui/Button";

export default function InventoryPage() {
  const { inventory, hydrated } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState("");
  const [filterCat, setFilterCat] = useState("All");

  const categories = useMemo(
    () => ["All", ...new Set(inventory.map((p) => p.category))].sort(),
    [inventory]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inventory.filter((p) => {
      const matchCat  = filterCat === "All" || p.category === filterCat;
      const matchText = !q ||
        p.category.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.shade?.toLowerCase().includes(q) ||
        p.notes?.toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }, [inventory, search, filterCat]);

  if (!hydrated) return null;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">My Products</h1>
          <p className="page-subtitle">
            {inventory.length} product{inventory.length !== 1 ? "s" : ""} across{" "}
            {new Set(inventory.map((p) => p.category)).size} categories
          </p>
        </div>
        <ButtonPrimary onClick={() => setShowForm((v) => !v)}>
          {showForm ? "✕ Close" : "+ Add Product"}
        </ButtonPrimary>
      </div>

      {/* Product form */}
      {showForm && <ProductForm onClose={() => setShowForm(false)} />}

      {/* Empty state */}
      {inventory.length === 0 && !showForm && (
        <EmptyState
          icon="🧴"
          title="No products yet"
          description="Add your first makeup product to start getting personalised looks and suggestions."
          action={
            <ButtonPrimary onClick={() => setShowForm(true)}>
              + Add Your First Product
            </ButtonPrimary>
          }
        />
      )}

      {/* Search + filters */}
      {inventory.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input-field flex-1 min-w-[180px] rounded-full"
          />
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 7).map((cat) => (
              <ButtonGhost
                key={cat}
                active={filterCat === cat}
                onClick={() => setFilterCat(cat)}
              >
                {cat}
              </ButtonGhost>
            ))}
            {categories.length > 7 && (
              <ButtonGhost
                active={!["All", ...categories.slice(1, 7)].includes(filterCat)}
                onClick={() => {}}
              >
                More ▾
              </ButtonGhost>
            )}
          </div>
        </div>
      )}

      {/* Products grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {filtered.length === 0 && inventory.length > 0 && (
        <p className="text-center text-nude-400 py-10 text-sm">
          No products match your search.
        </p>
      )}

      {/* Gap analysis */}
      <GapAnalysis />
    </div>
  );
}
