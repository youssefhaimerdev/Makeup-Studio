"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loadInventory, saveInventory, loadProfile, saveProfile } from "./storage";
import { loadDarkMode, applyDarkMode, toggleDarkMode } from "./darkMode";

const ONBOARDING_KEY = "mis_onboarding_seen";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [inventory,       setInventoryState] = useState([]);
  const [profile,         setProfileState]   = useState({});
  const [hydrated,        setHydrated]       = useState(false);
  const [toast,           setToast]          = useState(null);
  const [isDark,          setIsDark]         = useState(false);
  const [showOnboarding,  setShowOnboarding] = useState(false);
  const [confettiActive,  setConfettiActive] = useState(false);
  const [firstLookDone,   setFirstLookDone]  = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const inv     = loadInventory();
    const prof    = loadProfile();
    const dark    = loadDarkMode();
    const seen    = localStorage.getItem(ONBOARDING_KEY) === "true";
    const looked  = localStorage.getItem("mis_first_look_done") === "true";

    setInventoryState(inv);
    setProfileState(prof);
    setIsDark(dark);
    setFirstLookDone(looked);
    applyDarkMode(dark);

    // Show onboarding if first visit (no products, no profile, never seen)
    if (!seen && inv.length === 0 && !prof?.skinTone) {
      setTimeout(() => setShowOnboarding(true), 800);
    }

    setHydrated(true);
  }, []);

  // ── Toast ──────────────────────────────────────────────────────────────────
  function showToast(message, type = "success") {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 2800);
  }

  // ── Dark mode ─────────────────────────────────────────────────────────────
  function handleToggleDark() {
    const next = toggleDarkMode(isDark);
    setIsDark(next);
  }

  // ── Onboarding ────────────────────────────────────────────────────────────
  function dismissOnboarding() {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, "true");
  }

  // ── Confetti ──────────────────────────────────────────────────────────────
  function triggerConfetti() {
    setConfettiActive(true);
    // Auto-clear after animation
    setTimeout(() => setConfettiActive(false), 3500);
  }

  function onConfettiDone() {
    setConfettiActive(false);
  }

  // ── Mark first look ───────────────────────────────────────────────────────
  function markFirstLook() {
    if (!firstLookDone) {
      setFirstLookDone(true);
      localStorage.setItem("mis_first_look_done", "true");
      triggerConfetti();
      showToast("🎉 Your first look is ready!", "success");
    }
  }

  // ── Inventory actions ─────────────────────────────────────────────────────
  function addProduct(product) {
    const newProduct = {
      id:        Date.now(),
      favourite: false,
      addedAt:   new Date().toISOString(),
      ...product,
    };
    const updated = [...inventory, newProduct];
    setInventoryState(updated);
    saveInventory(updated);
    showToast(`${product.category} added to your stash ✓`);
    // Close onboarding nudge once they add first product
    if (updated.length === 1) dismissOnboarding();
  }

  function removeProduct(id) {
    const product = inventory.find(p => p.id === id);
    const updated = inventory.filter(p => p.id !== id);
    setInventoryState(updated);
    saveInventory(updated);
    showToast(`${product?.brand || product?.category || "Product"} removed`, "info");
  }

  function updateProduct(id, changes) {
    const updated = inventory.map(p => p.id === id ? { ...p, ...changes } : p);
    setInventoryState(updated);
    saveInventory(updated);
  }

  function toggleFavourite(id) {
    const updated = inventory.map(p =>
      p.id === id ? { ...p, favourite: !p.favourite } : p
    );
    setInventoryState(updated);
    saveInventory(updated);
    const p = updated.find(x => x.id === id);
    showToast(p?.favourite ? "❤️ Added to favourites" : "Removed from favourites", "info");
  }

  // ── Profile actions ───────────────────────────────────────────────────────
  function updateProfile(updates) {
    const updated = { ...profile, ...updates };
    setProfileState(updated);
    saveProfile(updated);
    showToast("Profile saved ✓");
  }

  return (
    <AppContext.Provider value={{
      // Data
      inventory, addProduct, removeProduct, updateProduct, toggleFavourite,
      profile, updateProfile,
      // UI state
      hydrated, toast,
      isDark, toggleDark: handleToggleDark,
      showOnboarding, dismissOnboarding,
      confettiActive, onConfettiDone, markFirstLook,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
