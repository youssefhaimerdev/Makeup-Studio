"use client";
import { useState, useEffect } from "react";
import { PAGES } from "@/lib/routes";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
const NAV_LINKS = [
  { id:PAGES.INVENTORY, label:"Products" },
  { id:PAGES.PROFILE,   label:"Profile" },
  { id:PAGES.LIBRARY,   label:"Library" },
  { id:PAGES.GENERATE,  label:"Generate" },
  { id:PAGES.TOOLS,     label:"Tools" },
  { id:PAGES.FIX,       label:"Fix" },
  { id:PAGES.EVALUATE,  label:"AI", badge:"AI" },
  { id:PAGES.LEARN,     label:"Learn" },
];
function Logo() {
  return (
    <svg width="116" height="28" viewBox="0 0 116 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fb7185"/><stop offset="100%" stopColor="#b87aaa"/></linearGradient></defs>
      <polygon points="11,2 19,2 23,11 15,24 7,11" fill="url(#lg)"/>
      <polygon points="11,2 15,9 7,11" fill="rgba(255,255,255,0.3)"/>
      <text x="29" y="19.5" fontFamily="Playfair Display,Georgia,serif" fontSize="16.5" fontWeight="600" style={{ fill:"var(--text-primary)" }}>Lumière</text>
    </svg>
  );
}
export default function NavBar({ currentPage, setPage, isDark, onToggleDark }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 8); window.addEventListener("scroll", fn, { passive:true }); return () => window.removeEventListener("scroll", fn); }, []);
  function go(id) { setPage(id); setMenuOpen(false); }
  return (
    <nav className="sticky top-0 z-50 transition-all duration-300" style={{ background:"var(--bg-card)", borderBottom:`1px solid var(--border)`, boxShadow:scrolled?"0 1px 12px rgba(0,0,0,0.06)":"none" }}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between" style={{ height:"var(--nav-height)" }}>
        <button onClick={() => go(PAGES.HOME)} className="bg-transparent border-none cursor-pointer flex items-center"><Logo /></button>
        <div className="hidden xl:flex items-center gap-0.5">
          {NAV_LINKS.map(link => (
            <button key={link.id} onClick={() => go(link.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium cursor-pointer transition-all duration-200 border font-sans ${currentPage===link.id?"bg-rose-50 border-rose-200 text-rose-600":"bg-transparent border-transparent hover:bg-nude-50"}`}
              style={{ color:currentPage===link.id?undefined:"var(--text-muted)" }}>
              {link.label}
              {link.badge && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500 text-white uppercase tracking-wide leading-none">{link.badge}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => go(PAGES.GENERATE)} className="hidden md:flex btn-primary !py-2 !px-4 !text-xs !shadow-none">✨ Generate</button>
          <DarkModeToggle isDark={isDark} onToggle={onToggleDark} />
          <button onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu" className="xl:hidden flex flex-col justify-center gap-[5px] w-7 h-7 cursor-pointer bg-transparent border-none p-0.5">
            <span className={`block h-0.5 rounded origin-center transition-all duration-300 ${menuOpen?"rotate-45 translate-y-[7px]":""}`} style={{ background:"var(--text-secondary)" }}/>
            <span className={`block h-0.5 rounded transition-all duration-200 ${menuOpen?"opacity-0 scale-x-0":""}`} style={{ background:"var(--text-secondary)" }}/>
            <span className={`block h-0.5 rounded origin-center transition-all duration-300 ${menuOpen?"-rotate-45 -translate-y-[7px]":""}`} style={{ background:"var(--text-secondary)" }}/>
          </button>
        </div>
      </div>
      <div className={`xl:hidden transition-all duration-300 ease-in-out overflow-hidden ${menuOpen?"max-h-[520px]":"max-h-0"}`} style={{ borderTop:menuOpen?`1px solid var(--border)`:"none" }}>
        <div className="px-4 py-3 flex flex-col gap-1" style={{ background:"var(--bg-card)" }}>
          {[{id:PAGES.HOME,label:"🏠 Home"},...NAV_LINKS].map(link => (
            <button key={link.id} onClick={() => go(link.id)} className="flex items-center gap-2 w-full text-left rounded-xl px-4 py-2.5 text-[14px] cursor-pointer transition-colors border-none font-sans font-medium" style={{ background:currentPage===link.id?"var(--rose-50)":"transparent", color:currentPage===link.id?"var(--rose-600)":"var(--text-secondary)" }}>
              {link.label}{link.badge&&<span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500 text-white uppercase">AI</span>}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
