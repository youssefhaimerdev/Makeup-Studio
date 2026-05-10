"use client";

const STORAGE_KEY = "mis_dark_mode";
const DARK_CLASS  = "dark";

export function loadDarkMode() {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === "true";
  // Respect OS preference on first visit
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function saveDarkMode(enabled) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

export function applyDarkMode(enabled) {
  if (typeof document === "undefined") return;
  if (enabled) {
    document.documentElement.classList.add(DARK_CLASS);
  } else {
    document.documentElement.classList.remove(DARK_CLASS);
  }
}

export function toggleDarkMode(current) {
  const next = !current;
  saveDarkMode(next);
  applyDarkMode(next);
  return next;
}
