const KEYS = {
  INVENTORY: "mis_inventory",
  PROFILE: "mis_profile",
};

export function loadFromStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn("localStorage write failed");
  }
}

export function loadInventory() {
  return loadFromStorage(KEYS.INVENTORY, []);
}

export function saveInventory(items) {
  saveToStorage(KEYS.INVENTORY, items);
}

export function loadProfile() {
  return loadFromStorage(KEYS.PROFILE, {});
}

export function saveProfile(profile) {
  saveToStorage(KEYS.PROFILE, profile);
}
