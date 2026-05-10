"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  CATEGORY_GROUPS, FINISHES, FORMULAS, COVERAGES,
  EXPIRY_PERIODS, BRANDS,
} from "@/lib/constants";
import { useApp } from "@/lib/AppContext";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/Button";

// ── Brand Autocomplete ────────────────────────────────────────────────────
function BrandAutocomplete({ value, onChange }) {
  const [query,       setQuery]       = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open,        setOpen]        = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const wrapRef = useRef(null);

  // Update suggestions on every keystroke
  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); setOpen(false); return; }
    const q   = query.toLowerCase();
    const res = BRANDS
      .filter(b => b.toLowerCase().includes(q))
      .slice(0, 7);
    setSuggestions(res);
    setOpen(res.length > 0);
    setHighlighted(0);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function onOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  function select(brand) {
    setQuery(brand);
    onChange(brand);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    if (e.key === "Enter")     { e.preventDefault(); select(suggestions[highlighted]); }
    if (e.key === "Escape")    { setOpen(false); }
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); }}
        onKeyDown={onKeyDown}
        onFocus={() => query.length >= 2 && suggestions.length && setOpen(true)}
        placeholder="e.g. Charlotte Tilbury"
        className="input-field"
        autoComplete="off"
      />
      {open && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-nude-200
                       rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {suggestions.map((brand, i) => {
            const qi  = brand.toLowerCase().indexOf(query.toLowerCase());
            const pre = brand.slice(0, qi);
            const mid = brand.slice(qi, qi + query.length);
            const suf = brand.slice(qi + query.length);
            return (
              <li
                key={brand}
                onMouseDown={() => select(brand)}
                className={`px-4 py-2.5 text-sm cursor-pointer font-sans transition-colors
                  ${i === highlighted ? "bg-rose-50 text-rose-700" : "text-nude-700 hover:bg-nude-50"}`}
              >
                {pre}<strong className="font-semibold">{mid}</strong>{suf}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── Hex swatch picker ─────────────────────────────────────────────────────
const PRESET_SWATCHES = [
  "#f5d5c0","#e8b09e","#d4786a","#c0404e",
  "#8b2252","#4a1a30","#f5c8a0","#e09060",
  "#c06030","#903020","#f8e8d0","#e8d0a8",
  "#d0b878","#c0a050","#d8b4a0","#c09080",
  "#b87060","#906050","#f8c8d8","#e890b0",
  "#d060a0","#b84090","#8a2080","#601060",
  "#f0e8d8","#e0d0b8","#c8b890","#a89060",
  "#ffe4a0","#ffca70","#ff9040","#ff6020",
  "#d04010","#e8e0d0","#c8c0b0","#a8a098",
  "#888078","#ffffff","#000000","#1a1a1a",
];

function HexSwatchPicker({ value, onChange }) {
  const [customHex, setCustomHex] = useState(value || "");
  const [showPicker, setShowPicker] = useState(false);

  function applyHex(hex) {
    setCustomHex(hex);
    onChange(hex);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        {/* Current swatch preview */}
        <button
          type="button"
          onClick={() => setShowPicker(v => !v)}
          className="w-9 h-9 rounded-full border-2 border-nude-200 hover:border-rose-300
                     transition-all cursor-pointer shrink-0 shadow-sm"
          style={{ background: value || "#e3d5c5" }}
          title="Pick shade colour"
        />
        <input
          type="text"
          value={customHex}
          onChange={e => applyHex(e.target.value)}
          placeholder="#e8b09e or colour name"
          className="input-field flex-1 font-mono text-xs"
          maxLength={30}
        />
        {/* Native colour input */}
        <label className="w-9 h-9 rounded-full border border-nude-200 flex items-center justify-center
                          cursor-pointer hover:border-rose-300 transition-all overflow-hidden shrink-0"
               title="Open system colour picker">
          <input
            type="color"
            value={value && value.startsWith("#") && value.length === 7 ? value : "#c4a882"}
            onChange={e => applyHex(e.target.value)}
            className="opacity-0 absolute w-0 h-0"
          />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a88c65" strokeWidth="2">
            <circle cx="13.5" cy="6.5" r=".5" fill="#a88c65"/>
            <circle cx="17.5" cy="10.5" r=".5" fill="#a88c65"/>
            <circle cx="8.5" cy="7.5" r=".5" fill="#a88c65"/>
            <circle cx="6.5" cy="12.5" r=".5" fill="#a88c65"/>
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688
                     0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996
                     c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
          </svg>
        </label>
      </div>

      {/* Preset swatches panel */}
      {showPicker && (
        <div className="mt-2 p-3 bg-nude-50 rounded-xl border border-nude-100">
          <p className="text-[10px] text-nude-400 font-sans uppercase tracking-wide mb-2">Quick swatches</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_SWATCHES.map(hex => (
              <button
                key={hex}
                type="button"
                onClick={() => { applyHex(hex); setShowPicker(false); }}
                className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-all hover:scale-110
                  ${value === hex ? "border-rose-500 scale-110" : "border-transparent hover:border-nude-300"}`}
                style={{ background: hex, boxShadow: hex === "#ffffff" ? "inset 0 0 0 1px #e3d5c5" : undefined }}
                title={hex}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chip selector (multi or single) ──────────────────────────────────────
function ChipSelector({ options, value, onChange, multi = false, labelKey = "label" }) {
  function toggle(id) {
    if (multi) {
      const arr = Array.isArray(value) ? value : [];
      onChange(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
    } else {
      onChange(value === id ? "" : id);
    }
  }
  const isActive = (id) => multi ? (Array.isArray(value) && value.includes(id)) : value === id;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const id    = typeof opt === "string" ? opt : opt.id;
        const label = typeof opt === "string" ? opt : opt[labelKey];
        const active = isActive(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                        font-sans cursor-pointer transition-all duration-150 border
              ${active
                ? "bg-rose-500 border-rose-500 text-white shadow-sm"
                : "bg-white border-nude-200 text-nude-600 hover:border-rose-300 hover:text-rose-600"
              }`}
          >
            {typeof opt !== "string" && opt.swatch && (
              <span className="w-2.5 h-2.5 rounded-full border border-white/50"
                    style={{ background: opt.swatch }} />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Category grouped select ───────────────────────────────────────────────
function CategorySelect({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="input-field">
      {CATEGORY_GROUPS.map(group => (
        <optgroup key={group.label} label={group.label}>
          {group.cats.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

// ── Expiry tracker ────────────────────────────────────────────────────────
function ExpiryPicker({ openedDate, onOpenedDate, expiryMonths, onExpiryMonths }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="section-label">Date Opened</label>
        <input
          type="date"
          value={openedDate || ""}
          onChange={e => onOpenedDate(e.target.value)}
          className="input-field"
          max={new Date().toISOString().split("T")[0]}
        />
      </div>
      <div>
        <label className="section-label">Period After Opening (PAO)</label>
        <div className="flex flex-wrap gap-2">
          {EXPIRY_PERIODS.map(p => (
            <button
              key={p.months}
              type="button"
              onClick={() => onExpiryMonths(expiryMonths === p.months ? null : p.months)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium font-sans cursor-pointer
                          transition-all border
                ${expiryMonths === p.months
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white border-nude-200 text-nude-600 hover:border-nude-300"
                }`}
              style={expiryMonths === p.months ? { background: p.color, borderColor: p.color } : {}}
            >
              {p.label}
            </button>
          ))}
        </div>
        {openedDate && expiryMonths && (() => {
          const exp = new Date(openedDate);
          exp.setMonth(exp.getMonth() + expiryMonths);
          const now = new Date();
          const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
          const expired = daysLeft < 0;
          const soon = daysLeft >= 0 && daysLeft < 30;
          return (
            <p className={`text-xs font-sans mt-2 font-medium
              ${expired ? "text-red-600" : soon ? "text-orange-500" : "text-green-600"}`}>
              {expired
                ? `⚠ Expired ${Math.abs(daysLeft)} days ago`
                : soon
                ? `⏰ Expires in ${daysLeft} days`
                : `✓ Expires ${exp.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
              }
            </p>
          );
        })()}
      </div>
    </div>
  );
}

// ── Collapsible section ───────────────────────────────────────────────────
function Section({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-nude-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-nude-50
                   text-sm font-semibold text-nude-700 font-sans cursor-pointer
                   hover:bg-nude-100 transition-colors border-none"
      >
        <span>{title}</span>
        <span className={`text-nude-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && <div className="p-4 flex flex-col gap-4 bg-white">{children}</div>}
    </div>
  );
}

// ── Main ProductForm ──────────────────────────────────────────────────────
const EMPTY = {
  category:     "Foundation",
  brand:        "",
  shade:        "",
  shadeHex:     "",
  finish:       "",
  formula:      "",
  coverage:     "",
  notes:        "",
  price:        "",
  openedDate:   "",
  expiryMonths: null,
  favourite:    false,
};

export default function ProductForm({ onClose }) {
  const { addProduct } = useApp();
  const [form, setForm] = useState(EMPTY);

  const set = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  function handleSubmit() {
    if (!form.category) return;
    addProduct(form);
    setForm(EMPTY);
    onClose?.();
  }

  // Coverage only relevant for base products
  const showCoverage = ["Foundation","BB Cream","CC Cream","Skin Tint",
                        "Tinted Moisturiser","Concealer","Color Corrector"].includes(form.category);
  const showFormula  = !["Skincare Prep","SPF / Sunscreen","Face Mist",
                         "Setting Spray","Lash Serum","Lash Glue","Brow Soap",
                         "Brow Lamination Gel"].includes(form.category);

  return (
    <div className="bg-white border border-rose-200 rounded-2xl p-6 mb-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-lg text-nude-800">Add a product</h3>
        {/* Favourite toggle */}
        <button
          type="button"
          onClick={() => set("favourite", !form.favourite)}
          className={`text-2xl cursor-pointer bg-transparent border-none transition-all
            ${form.favourite ? "scale-110" : "opacity-40 hover:opacity-80"}`}
          title="Mark as favourite"
        >
          {form.favourite ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="flex flex-col gap-4">

        {/* ── Row 1: Category + Brand ───────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="section-label">Category *</label>
            <CategorySelect value={form.category} onChange={v => set("category", v)} />
          </div>
          <div>
            <label className="section-label">Brand</label>
            <BrandAutocomplete value={form.brand} onChange={v => set("brand", v)} />
          </div>
        </div>

        {/* ── Row 2: Shade + Hex ───────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="section-label">Shade / Product Name</label>
            <input
              type="text"
              value={form.shade}
              onChange={e => set("shade", e.target.value)}
              placeholder="e.g. Pillow Talk, 45W"
              className="input-field"
            />
          </div>
          <div>
            <label className="section-label">Shade Colour Swatch</label>
            <HexSwatchPicker value={form.shadeHex} onChange={v => set("shadeHex", v)} />
          </div>
        </div>

        {/* ── Finish ───────────────────────────────────── */}
        <div>
          <label className="section-label">Finish</label>
          <ChipSelector
            options={FINISHES}
            value={form.finish}
            onChange={v => set("finish", v)}
          />
        </div>

        {/* ── Formula ──────────────────────────────────── */}
        {showFormula && (
          <div>
            <label className="section-label">Formula</label>
            <ChipSelector
              options={FORMULAS}
              value={form.formula}
              onChange={v => set("formula", v)}
            />
          </div>
        )}

        {/* ── Coverage ─────────────────────────────────── */}
        {showCoverage && (
          <div>
            <label className="section-label">Coverage</label>
            <ChipSelector
              options={COVERAGES}
              value={form.coverage}
              onChange={v => set("coverage", v)}
            />
          </div>
        )}

        {/* ── Notes ────────────────────────────────────── */}
        <div>
          <label className="section-label">Notes</label>
          <input
            type="text"
            value={form.notes}
            onChange={e => set("notes", e.target.value)}
            placeholder="e.g. oxidises slightly, smells amazing…"
            className="input-field"
          />
        </div>

        {/* ── Advanced (collapsible) ────────────────────── */}
        <Section title="💰 Price & Expiry (optional)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="section-label">Price Paid</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nude-400 text-sm font-sans">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => set("price", e.target.value)}
                  placeholder="0.00"
                  className="input-field pl-7"
                />
              </div>
            </div>
          </div>
          <ExpiryPicker
            openedDate={form.openedDate}
            onOpenedDate={v => set("openedDate", v)}
            expiryMonths={form.expiryMonths}
            onExpiryMonths={v => set("expiryMonths", v)}
          />
        </Section>

        {/* ── Actions ──────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          <ButtonPrimary onClick={handleSubmit}>Save Product</ButtonPrimary>
          <ButtonSecondary onClick={onClose}>Cancel</ButtonSecondary>
        </div>
      </div>
    </div>
  );
}
