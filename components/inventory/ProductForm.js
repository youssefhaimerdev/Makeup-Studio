"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import { useApp } from "@/lib/AppContext";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/Button";

const EMPTY = { category: "Foundation", brand: "", shade: "", notes: "" };

export default function ProductForm({ onClose }) {
  const { addProduct } = useApp();
  const [form, setForm] = useState(EMPTY);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    if (!form.category) return;
    addProduct(form);
    setForm(EMPTY);
    onClose?.();
  }

  return (
    <div className="bg-white border border-rose-200 rounded-2xl p-6 mb-5">
      <h3 className="font-serif text-lg text-nude-800 mb-5">Add a product</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Category */}
        <div>
          <label className="section-label">Category *</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="input-field"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="section-label">Brand</label>
          <input
            type="text"
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
            placeholder="e.g. Charlotte Tilbury"
            className="input-field"
          />
        </div>

        {/* Shade */}
        <div>
          <label className="section-label">Shade / Name</label>
          <input
            type="text"
            value={form.shade}
            onChange={(e) => set("shade", e.target.value)}
            placeholder="e.g. Pillow Talk"
            className="input-field"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="section-label">Notes</label>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="e.g. full coverage, matte"
            className="input-field"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <ButtonPrimary onClick={handleSubmit}>Save Product</ButtonPrimary>
        <ButtonSecondary onClick={onClose}>Cancel</ButtonSecondary>
      </div>
    </div>
  );
}
