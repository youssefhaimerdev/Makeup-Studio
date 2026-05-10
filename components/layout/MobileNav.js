"use client";
import { PAGES } from "@/lib/routes";
const TABS = [
  { id:PAGES.HOME,     icon:"🏠", label:"Home"    },
  { id:PAGES.LIBRARY,  icon:"📚", label:"Library" },
  { id:PAGES.GENERATE, icon:"✨", label:"Generate"},
  { id:PAGES.TOOLS,    icon:"🛠", label:"Tools"   },
  { id:PAGES.EVALUATE, icon:"🤖", label:"AI"      },
];
export default function MobileNav({ currentPage, setPage }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t" style={{ background:"var(--bg-card)", borderColor:"var(--border)", height:"var(--mobile-nav-height)" }}>
      <div className="flex h-full">
        {TABS.map(tab => {
          const active = currentPage === tab.id;
          return (
            <button key={tab.id} onClick={() => setPage(tab.id)} className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer border-none transition-all duration-150 ${active?"":"bg-transparent"}`} style={{ background:active?"var(--rose-50)":"transparent" }}>
              <span className={`text-xl transition-transform duration-150 ${active?"scale-110":""}`}>{tab.icon}</span>
              <span className={`text-[10px] font-semibold font-sans tracking-wide ${active?"text-rose-600":"" }`} style={{ color:active?undefined:"var(--text-faint)" }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
