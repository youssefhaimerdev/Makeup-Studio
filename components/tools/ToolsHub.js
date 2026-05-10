"use client";
import { PAGES } from "@/lib/routes";
const TOOLS = [
  { page: PAGES.WISHLIST, icon:"🛍", title:"Wishlist", desc:"Track what to buy next based on stash gaps. Auto-generates from missing categories.", colour:"#fff1f2", border:"#fecdd3" },
  { page: PAGES.DIARY,    icon:"📓", title:"Look Diary", desc:"Log every look with notes and ratings. Find out what you wore last Friday.", colour:"#f8f2f7", border:"#dfc0d8" },
  { page: PAGES.ROUTINE,  icon:"🌅", title:"Routine Builder", desc:"Build and save AM and PM routines from your inventory.", colour:"#fdf4f0", border:"#f6cdb5" },
  { page: PAGES.EXPIRY,   icon:"⏰", title:"Expiry Tracker", desc:"Mascara lasts 3 months. Foundation lasts 12. See what's expiring soon.", colour:"#fefce8", border:"#fde68a" },
  { page: PAGES.CONCERNS, icon:"🎯", title:"Concern Matcher", desc:"Select a skin concern — get a targeted routine from your stash.", colour:"#f0fdf4", border:"#bbf7d0" },
  { page: PAGES.SEASONAL, icon:"🌸", title:"Seasonal Calendar", desc:"Spring pastels, summer bronze, autumn berry, holiday glam.", colour:"#fff1f2", border:"#fecdd3" },
  { page: PAGES.DUPES,    icon:"💡", title:"Dupe Finder", desc:"Own MAC Ruby Woo? Find drugstore alternatives at a fraction of the price.", colour:"#f8f2f7", border:"#dfc0d8" },
  { page: PAGES.PALETTE,  icon:"🎨", title:"Palette Visualiser", desc:"Build a colour palette and preview it on a face before applying.", colour:"#fdf4f0", border:"#f6cdb5" },
];
export default function ToolsHub({ setPage }) {
  return (
    <div className="page-container max-w-4xl">
      <h1 className="page-title">Tools</h1>
      <p className="page-subtitle">Track, plan, discover, and visualise — everything beyond the look generator.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOOLS.map(t => (
          <button key={t.page} onClick={() => setPage(t.page)}
            className="group text-left rounded-2xl p-5 border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: t.colour, borderColor: t.border }}>
            <div className="flex items-start gap-4">
              <span className="text-3xl shrink-0">{t.icon}</span>
              <div>
                <h3 className="font-serif text-lg font-bold mb-1" style={{ color:"var(--text-primary)" }}>{t.title}</h3>
                <p className="text-sm font-sans leading-relaxed" style={{ color:"var(--text-muted)" }}>{t.desc}</p>
                <span className="text-xs font-semibold font-sans text-rose-600 mt-2 block group-hover:underline">Open →</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
