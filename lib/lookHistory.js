import { loadFromStorage, saveToStorage } from "./storage";
const KEY = "mis_look_diary";
export function loadDiary() { return loadFromStorage(KEY, []); }
export function addDiaryEntry(entry) {
  const existing = loadDiary();
  const updated = [{ id: Date.now(), date: new Date().toISOString(), ...entry }, ...existing].slice(0, 50);
  saveToStorage(KEY, updated); return updated;
}
export function deleteDiaryEntry(id) { const u = loadDiary().filter(e => e.id !== id); saveToStorage(KEY, u); return u; }
export function updateDiaryEntry(id, changes) { const u = loadDiary().map(e => e.id === id ? { ...e, ...changes } : e); saveToStorage(KEY, u); return u; }
export function formatDiaryDate(iso) {
  const d = new Date(iso), today = new Date(), yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
export function getDiaryStats(entries) {
  if (!entries.length) return null;
  const occasions = {}, looks = {};
  entries.forEach(e => {
    if (e.occasion) occasions[e.occasion] = (occasions[e.occasion] || 0) + 1;
    if (e.lookName) looks[e.lookName] = (looks[e.lookName] || 0) + 1;
  });
  return { totalEntries: entries.length, topOccasion: Object.entries(occasions).sort((a,b)=>b[1]-a[1])[0], topLook: Object.entries(looks).sort((a,b)=>b[1]-a[1])[0] };
}
