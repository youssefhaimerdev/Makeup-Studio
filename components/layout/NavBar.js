"use client";

import { useState } from "react";
import { PAGES } from "@/lib/routes";

const NAV_LINKS = [
  { id: PAGES.INVENTORY, label: "My Products" },
  { id: PAGES.PROFILE,   label: "Skin Profile" },
  { id: PAGES.GENERATE,  label: "Generate Look" },
  { id: PAGES.FIX,       label: "Fix Makeup" },
  { id: PAGES.LEARN,     label: "Learn" },
];

export default function NavBar({ currentPage, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function go(id) {
    setPage(id);
    setMenuOpen(false);
  }

  return (
    <nav className="bg-white border-b border-nude-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-[60px]">
        {/* Logo */}
        <button
          onClick={() => go(PAGES.HOME)}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #fb7185, #b87aaa)" }}
          >
            <span className="text-white text-sm font-bold">✦</span>
          </div>
          <span className="font-serif text-[17px] font-bold text-nude-800 tracking-tight">
            Makeup Studio
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => go(link.id)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] cursor-pointer transition-all duration-150 border
                ${currentPage === link.id
                  ? "bg-rose-50 border-rose-200 text-rose-600 font-semibold"
                  : "bg-transparent border-transparent text-nude-500 hover:text-nude-800"
                }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden bg-transparent border-none text-nude-600 cursor-pointer text-xl p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-nude-100 px-4 py-3">
          {[{ id: PAGES.HOME, label: "Home" }, ...NAV_LINKS].map((link) => (
            <button
              key={link.id}
              onClick={() => go(link.id)}
              className={`block w-full text-left rounded-lg px-3 py-2.5 text-[15px] mb-0.5 cursor-pointer transition-colors border-none
                ${currentPage === link.id
                  ? "bg-rose-50 text-rose-600 font-semibold"
                  : "bg-transparent text-nude-600 hover:bg-nude-50"
                }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
