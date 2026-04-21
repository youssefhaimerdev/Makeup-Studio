"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { loadInventory, saveInventory, loadProfile, saveProfile } from "./storage";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [inventory, setInventoryState] = useState([]);
  const [profile, setProfileState] = useState({});
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once mounted (client only)
  useEffect(() => {
    setInventoryState(loadInventory());
    setProfileState(loadProfile());
    setHydrated(true);
  }, []);

  function addProduct(product) {
    const updated = [...inventory, { id: Date.now(), ...product }];
    setInventoryState(updated);
    saveInventory(updated);
  }

  function removeProduct(id) {
    const updated = inventory.filter((p) => p.id !== id);
    setInventoryState(updated);
    saveInventory(updated);
  }

  function updateProfile(updates) {
    const updated = { ...profile, ...updates };
    setProfileState(updated);
    saveProfile(updated);
  }

  return (
    <AppContext.Provider
      value={{ inventory, addProduct, removeProduct, profile, updateProfile, hydrated }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
