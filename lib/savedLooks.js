import { loadFromStorage, saveToStorage } from "./storage";

const KEY     = "mis_saved_looks";
const MAX     = 20;

export function loadSavedLooks() {
  return loadFromStorage(KEY, []);
}

export function saveLook(look, name) {
  const existing = loadSavedLooks();
  const entry = {
    id:        Date.now(),
    name:      name.trim() || "My Look",
    savedAt:   new Date().toISOString(),
    occasion:  look.occasion,
    intensity: look.intensity?.label,
    trendName: look.trendName,
    aesthetic: look.aesthetic,
    palette:   look.palette,
    steps:     look.steps,
    analysis:  look.analysis,
    applyZones:look.applyZones,
    moodDesc:  look.moodDesc,
  };
  const updated = [entry, ...existing].slice(0, MAX);
  saveToStorage(KEY, updated);
  return updated;
}

export function deleteSavedLook(id) {
  const updated = loadSavedLooks().filter(l => l.id !== id);
  saveToStorage(KEY, updated);
  return updated;
}
