import { loadFromStorage, saveToStorage } from "./storage";
import { ESSENTIAL_CATEGORIES } from "./constants";
const KEY = "mis_wishlist";
export function loadWishlist() { return loadFromStorage(KEY, []); }
export function addToWishlist(item) {
  const existing = loadWishlist();
  if (existing.find(i => i.category === item.category && i.name === item.name)) return existing;
  const updated = [{ id: Date.now(), addedAt: new Date().toISOString(), purchased: false, ...item }, ...existing];
  saveToStorage(KEY, updated); return updated;
}
export function togglePurchased(id) {
  const updated = loadWishlist().map(i => i.id === id ? { ...i, purchased: !i.purchased, purchasedAt: !i.purchased ? new Date().toISOString() : null } : i);
  saveToStorage(KEY, updated); return updated;
}
export function removeFromWishlist(id) { const u = loadWishlist().filter(i => i.id !== id); saveToStorage(KEY, u); return u; }
export function clearPurchased() { const u = loadWishlist().filter(i => !i.purchased); saveToStorage(KEY, u); return u; }
export function getGapSuggestions(inventory) {
  const owned = new Set(inventory.map(p => p.category));
  return ESSENTIAL_CATEGORIES.filter(c => !owned.has(c)).map(c => ({
    category: c, name: c, priority: ["Foundation","Mascara","Eyebrow","Concealer"].includes(c) ? "high" : "medium",
    reason: { Foundation:"Core base product", Concealer:"Spot coverage & brightening", Mascara:"Highest impact per second", Eyebrow:"Frames the entire face", Blush:"Adds life and dimension", Lipstick:"Completes any look", "Setting Powder":"Extends wear", Primer:"Doubles foundation longevity" }[c] || "Missing from stash",
  }));
}
