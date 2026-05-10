"use client";
import { useState } from "react";
import { AppProvider, useApp } from "@/lib/AppContext";
import { PAGES } from "@/lib/routes";
import NavBar from "./NavBar";
import MobileNav from "./MobileNav";
import PageTransition from "@/components/ui/PageTransition";
import Toast from "@/components/ui/Toast";
import Confetti from "@/components/ui/Confetti";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import HomePage from "@/components/HomePage";
import InventoryPage from "@/components/inventory/InventoryPage";
import ProfilePage from "@/components/profile/ProfilePage";
import GeneratePage from "@/components/generator/GeneratePage";
import FixPage from "@/components/fix/FixPage";
import PairingsPage from "@/components/pairings/PairingsPage";
import LearnPage from "@/components/learn/LearnPage";
import EvaluationPage from "@/components/evaluation/EvaluationPage";
import LibraryPage from "@/components/library/LibraryPage";
import ToolsHub from "@/components/tools/ToolsHub";
import WishlistPage from "@/components/tools/WishlistPage";
import LookDiaryPage from "@/components/tools/LookDiaryPage";
import RoutineBuilderPage from "@/components/tools/RoutineBuilderPage";
import ExpiryTrackerPage from "@/components/tools/ExpiryTrackerPage";
import ConcernMatcherPage from "@/components/tools/ConcernMatcherPage";
import SeasonalCalendarPage from "@/components/tools/SeasonalCalendarPage";
import DupeFinderPage from "@/components/tools/DupeFinderPage";
import PaletteVisualiserPage from "@/components/tools/PaletteVisualiserPage";

const TOOL_PAGES = [PAGES.GENERATE, PAGES.FIX, PAGES.PAIRINGS];

function AppContent({ page, navigate }) {
  const { toast, isDark, toggleDark, showOnboarding, dismissOnboarding, confettiActive, onConfettiDone, inventory, profile } = useApp();
  function renderPage() {
    switch (page) {
      case PAGES.HOME:      return <HomePage setPage={navigate} />;
      case PAGES.INVENTORY: return <InventoryPage />;
      case PAGES.PROFILE:   return <ProfilePage />;
      case PAGES.GENERATE:  return <GeneratePage />;
      case PAGES.FIX:       return <FixPage />;
      case PAGES.PAIRINGS:  return <PairingsPage />;
      case PAGES.LEARN:     return <LearnPage setPage={navigate} />;
      case PAGES.EVALUATE:  return <EvaluationPage />;
      case PAGES.LIBRARY:   return <LibraryPage setPage={navigate} />;
      case PAGES.TOOLS:     return <ToolsHub setPage={navigate} />;
      case PAGES.WISHLIST:  return <WishlistPage setPage={navigate} />;
      case PAGES.DIARY:     return <LookDiaryPage setPage={navigate} />;
      case PAGES.ROUTINE:   return <RoutineBuilderPage setPage={navigate} />;
      case PAGES.EXPIRY:    return <ExpiryTrackerPage setPage={navigate} />;
      case PAGES.CONCERNS:  return <ConcernMatcherPage setPage={navigate} />;
      case PAGES.SEASONAL:  return <SeasonalCalendarPage setPage={navigate} />;
      case PAGES.DUPES:     return <DupeFinderPage setPage={navigate} />;
      case PAGES.PALETTE:   return <PaletteVisualiserPage setPage={navigate} />;
      default:              return <HomePage setPage={navigate} />;
    }
  }
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background:"var(--bg)" }}>
      <NavBar currentPage={page} setPage={navigate} isDark={isDark} onToggleDark={toggleDark} />
      {TOOL_PAGES.includes(page) && (
        <div className="border-b" style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}>
          <div className="max-w-5xl mx-auto px-6 flex gap-0">
            {[{id:PAGES.GENERATE,label:"Generate Look"},{id:PAGES.FIX,label:"Fix Makeup"},{id:PAGES.PAIRINGS,label:"Smart Pairings"}].map(tab => (
              <button key={tab.id} onClick={() => navigate(tab.id)} className={`px-4 py-3 text-sm cursor-pointer border-b-2 transition-all duration-150 font-medium font-sans bg-transparent border-l-0 border-r-0 border-t-0 ${page===tab.id?"border-rose-400 text-rose-600":"border-transparent"}`} style={{ color:page===tab.id?undefined:"var(--text-muted)" }}>{tab.label}</button>
            ))}
          </div>
        </div>
      )}
      <main><PageTransition pageKey={page}>{renderPage()}</PageTransition></main>
      <footer className="hidden md:block border-t mt-20 py-10 px-6 text-center" style={{ borderColor:"var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="font-serif text-base mb-1" style={{ color:"var(--text-secondary)" }}>✦ Lumière — AI Makeup Studio</p>
          <p className="text-xs mb-4 font-sans" style={{ color:"var(--text-faint)" }}>All data stored locally — never shared.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {[PAGES.HOME,PAGES.INVENTORY,PAGES.LIBRARY,PAGES.GENERATE,PAGES.TOOLS,PAGES.LEARN,PAGES.EVALUATE].map(id => (
              <button key={id} onClick={() => navigate(id)} className="text-xs capitalize cursor-pointer bg-transparent border-none transition-colors font-sans hover:text-rose-500" style={{ color:"var(--text-faint)" }}>{id}</button>
            ))}
          </div>
        </div>
      </footer>
      <MobileNav currentPage={page} setPage={navigate} />
      <Toast toast={toast} />
      <Confetti active={confettiActive} onDone={onConfettiDone} />
      {showOnboarding && <OnboardingModal inventory={inventory} profile={profile} onNavigate={navigate} onDismiss={dismissOnboarding} />}
    </div>
  );
}

export default function AppShell() {
  const [page, setPage] = useState(PAGES.HOME);
  function navigate(target) { setPage(target); window.scrollTo({ top:0, behavior:"smooth" }); }
  return <AppProvider><AppContent page={page} navigate={navigate} /></AppProvider>;
}
