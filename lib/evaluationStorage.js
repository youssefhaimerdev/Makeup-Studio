import { loadFromStorage, saveToStorage } from "./storage";

const KEY = "mis_evaluations";
const MAX_SAVED = 10;

export function loadEvaluations() {
  return loadFromStorage(KEY, []);
}

export function saveEvaluation(evaluation) {
  const existing = loadEvaluations();
  // Prepend newest, cap at MAX_SAVED
  const updated = [evaluation, ...existing].slice(0, MAX_SAVED);
  saveToStorage(KEY, updated);
  return updated;
}

export function deleteEvaluation(id) {
  const updated = loadEvaluations().filter((e) => e.id !== id);
  saveToStorage(KEY, updated);
  return updated;
}

export function clearEvaluations() {
  saveToStorage(KEY, []);
}
