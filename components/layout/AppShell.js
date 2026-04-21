"use client";

import { useState } from "react";
import { AppProvider } from "@/lib/AppContext";
import NavBar from "./NavBar";
import HomePage from "@/components/HomePage";
import InventoryPage from "@/components/inventory/InventoryPage";
import ProfilePage from "@/components/profile/ProfilePage";
import GeneratePage from "@/components/generator/GeneratePage";
import FixPage from "@/components/fix/FixPage";
import PairingsPage from "@/components/pairings/PairingsPage";
import LearnPage from "@/components/learn/LearnPage";

export const PAGES = {
  HOME: "home",
  INVENTORY: "inventory",
  PROFILE: "profile",
  GENERATE: "generate",
  FIX: "fix",
  PAIRINGS: "pairings",
  LEARN: "learn",
};

const TOOL_PAGES = [PAGES.GENERATE, PAGES.FIX, PAGES.PAIRINGS];

export default function AppShell() {
  const [page, setPage] = useState(PAGES.HOME);

  function navigate(target) {
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderPage() {
    switch (page) {
      case PAGES.HOME:      return <HomePage setPage={navigate} />;
      case PAGES.INVENTORY: return <InventoryPage />;
      case PAGES.PROFILE:   return <ProfilePage />;
      case PAGES.GENERATE:  return <GeneratePage />;
      case PAGES.FIX:       return <FixPage />;
      case PAGES.PAIRINGS:  return <PairingsPage />;
      case PAGES.LEARN:     return <LearnPage setPage={navigate} />;
      default:              return <HomePage setPage={navigate} />;
    }
  }

  return (
    <AppProvider>
      <div className="min-h-screen" style={{ background: "#fdfaf8" }}>
        <NavBar currentPage={page} setPage={navigate} />

        {TOOL_PAGES.includes(page) && (
          <div className="bg-white border-b border-nude-100">
            <div className="max-w-5xl mx-auto px-6 flex gap-0">
              {[
                { id: PAGES.GENERATE, label: "Generate Look" },
                { id: PAGES.FIX,      label: "Fix Makeup" },
                { id: PAGES.PAIRINGS, label: "Smart Pairings" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.id)}
                  className={`px-4 py-3 text-sm cursor-pointer border-b-2 transition-all duration-150 font-medium
                    ${page === tab.id
                      ? "border-rose-400 text-rose-600"
                      : "border-transparent text-nude-500 hover:text-nude-700"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <main>{renderPage()}</main>

        <footer className="border-t border-nude-100 mt-20 py-10 px-6 text-center">
          <div className="max-w-5xl mx-auto">
            <p className="font-serif text-nude-600 text-base mb-1">✦ Makeup Intelligence Studio</p>
            <p className="text-nude-400 text-xs mb-4">
              Your personal makeup assistant. All data is stored locally on your device — never shared.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {Object.entries(PAGES).map(([, id]) => (
                <button
                  key={id}
                  onClick={() => navigate(id)}
                  className="text-nude-400 hover:text-rose-500 text-xs capitalize cursor-pointer bg-transparent border-none transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
