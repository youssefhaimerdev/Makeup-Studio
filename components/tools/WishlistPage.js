"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { loadWishlist, addToWishlist, removeFromWishlist, togglePurchased, clearPurchased, getGapSuggestions } from "@/lib/wishlist";
import { CATEGORIES } from "@/lib/constants";
import { PAGES } from "@/lib/routes";
export default function WishlistPage({ setPage }) {
  const { inventory } = useApp();
  const [items, setItems] = useState([]);
  const [newCat, setNewCat] = useState("Foundation");
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);
  useEffect(() => { setItems(loadWishlist()); }, []);
  const gaps = getGapSuggestions(inventory);
  const pending = items.filter(i => !i.purchased);
  const purchased = items.filter(i => i.purchased);
  return (
    <div className="page-container max-w-2xl">
      <button onClick={() => setPage(PAGES.TOOLS)} className="text-xs font-sans cursor-pointer bg-transparent border-none mb-5" style={{ color:"var(--text-muted)" }}>← Back to Tools</button>
      <h1 className="page-title">🛍 Wishlist</h1>
      <p className="page-subtitle">Track products to buy next. Auto-filled from your stash gaps.</p>
      {gaps.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl border" style={{ background:"var(--bg-secondary)", borderColor:"var(--border)" }}>
          <p className="text-xs font-bold uppercase tracking-widest font-sans mb-3" style={{ color:"var(--text-muted)" }}>✦ Detected gaps</p>
          <div className="flex flex-col gap-2">
            {gaps.map(gap => {
              const added = items.some(i => i.category === gap.category);
              return (
                <div key={gap.category} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border" style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}>
                  <div><span className="text-sm font-semibold font-sans" style={{ color:"var(--text-primary)" }}>{gap.category}</span><span className="text-xs font-sans ml-2" style={{ color:"var(--text-muted)" }}>{gap.reason}</span></div>
                  <button onClick={() => !added && setItems(addToWishlist({ ...gap, name: gap.category }))} disabled={added}
                    className="text-xs font-bold font-sans px-3 py-1 rounded-full cursor-pointer border disabled:opacity-40"
                    style={added ? { background:"var(--bg-subtle)", color:"var(--text-faint)", borderColor:"var(--border)" } : { background:"#fff1f2", color:"#e11d48", borderColor:"#fecdd3" }}>
                    {added ? "Added" : "+ Add"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="mb-5">
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="btn-primary">+ Add Item</button>
        ) : (
          <div className="p-4 rounded-2xl border" style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div><label className="section-label">Category</label><select value={newCat} onChange={e => setNewCat(e.target.value)} className="input-field">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className="section-label">Product Name</label><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Charlotte Tilbury Pillow Talk" className="input-field"/></div>
            </div>
            <div className="flex gap-3">
              <button className="btn-primary" onClick={() => { setItems(addToWishlist({ category:newCat, name:newName||newCat, priority:"medium" })); setNewName(""); setShowForm(false); }}>Add</button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      {pending.length > 0 && <div className="mb-6"><p className="section-label mb-3">To buy ({pending.length})</p><div className="flex flex-col gap-2">{pending.map(item => (<div key={item.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}><button onClick={() => setItems(togglePurchased(item.id))} className="w-5 h-5 rounded-full border-2 shrink-0 cursor-pointer flex items-center justify-center" style={{ borderColor:"#fb7185", background:"transparent" }}/><span className="flex-1 text-sm font-sans" style={{ color:"var(--text-primary)" }}>{item.name || item.category}</span><span className="text-xs font-sans" style={{ color:"var(--text-muted)" }}>{item.priority}</span><button onClick={() => setItems(removeFromWishlist(item.id))} className="text-sm cursor-pointer bg-transparent border-none" style={{ color:"var(--text-faint)" }}>✕</button></div>))}</div></div>}
      {purchased.length > 0 && <div><div className="flex items-center justify-between mb-3"><p className="section-label">Purchased ({purchased.length})</p><button onClick={() => setItems(clearPurchased())} className="text-xs font-sans cursor-pointer bg-transparent border-none text-rose-400">Clear all</button></div><div className="flex flex-col gap-2">{purchased.map(item => (<div key={item.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border opacity-50" style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}><div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div><span className="flex-1 text-sm font-sans line-through" style={{ color:"var(--text-muted)" }}>{item.name || item.category}</span><button onClick={() => setItems(removeFromWishlist(item.id))} className="text-sm cursor-pointer bg-transparent border-none" style={{ color:"var(--text-faint)" }}>✕</button></div>))}</div></div>}
      {items.length === 0 && gaps.length === 0 && <div className="text-center py-12"><div className="text-4xl mb-3 opacity-40">🛍</div><p className="font-serif text-lg" style={{ color:"var(--text-secondary)" }}>Wishlist is empty</p></div>}
    </div>
  );
}
