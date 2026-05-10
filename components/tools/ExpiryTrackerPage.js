"use client";
import { useApp } from "@/lib/AppContext";
import { PAGES } from "@/lib/routes";
const PAO = { Mascara:3,"Lash Serum":6,Eyeliner:12,Eyeshadow:24,"Loose Pigment":18,Foundation:12,"BB Cream":12,"CC Cream":12,"Skin Tint":12,Concealer:12,"Color Corrector":18,Primer:18,"Pore Primer":18,"Setting Powder":24,"Setting Spray":12,Blush:24,"Blush Stick":18,"Cream Blush":12,Bronzer:24,"Cream Bronzer":18,Contour:24,Highlighter:24,Lipstick:18,"Lip Gloss":12,"Lip Oil":12,"Lip Stain":12,"Lip Liner":18,"Lip Topper":12,Eyebrow:18,"Skincare Prep":6,"SPF / Sunscreen":12,"Face Mist":6,"Eye Primer":12 };
function getStatus(p) {
  const months = p.expiryMonths || PAO[p.category];
  if (!months) return null;
  const ref = p.openedDate ? new Date(p.openedDate) : new Date(p.addedAt || Date.now());
  const exp = new Date(ref); exp.setMonth(exp.getMonth() + months);
  return { days: Math.ceil((exp - new Date()) / 86400000), expiry: exp, hasOpenedDate: !!p.openedDate };
}
export default function ExpiryTrackerPage({ setPage }) {
  const { inventory } = useApp();
  const tracked = inventory.map(p => ({ ...p, status: getStatus(p) })).filter(p => p.status && p.status.days <= 180).sort((a,b) => a.status.days - b.status.days);
  const getLevel = d => d <= 0 ? { label:"Expired", bg:"#fef2f2", border:"#fecaca", text:"#dc2626", dot:"#ef4444" } : d <= 30 ? { label:"Expires soon", bg:"#fff7ed", border:"#fed7aa", text:"#c2410c", dot:"#f97316" } : d <= 90 ? { label:"This quarter", bg:"#fefce8", border:"#fde68a", text:"#92400e", dot:"#f59e0b" } : { label:"This season", bg:"#f0fdf4", border:"#bbf7d0", text:"#166534", dot:"#22c55e" };
  return (
    <div className="page-container max-w-2xl">
      <button onClick={() => setPage(PAGES.TOOLS)} className="text-xs font-sans cursor-pointer bg-transparent border-none mb-5" style={{ color:"var(--text-muted)" }}>← Back to Tools</button>
      <h1 className="page-title">⏰ Expiry Tracker</h1>
      <p className="page-subtitle">Products expiring within 6 months based on PAO guidelines.</p>
      {tracked.length === 0 ? <div className="text-center py-10 rounded-2xl border mb-8" style={{ borderColor:"var(--border)", background:"var(--bg-card)" }}><div className="text-3xl mb-2 opacity-40">✓</div><p className="font-serif text-lg mb-1" style={{ color:"var(--text-secondary)" }}>Nothing expiring soon</p><p className="text-sm font-sans" style={{ color:"var(--text-muted)" }}>Add opening dates to your products for precise tracking.</p></div>
      : <div className="flex flex-col gap-3 mb-8">{tracked.map(p => { const lv = getLevel(p.status.days); return <div key={p.id} className="rounded-xl border px-4 py-3.5" style={{ background:lv.bg, borderColor:lv.border }}><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 mb-0.5"><span className="w-2 h-2 rounded-full shrink-0" style={{ background:lv.dot }}/><span className="text-sm font-bold font-sans" style={{ color:lv.text }}>{p.status.days <= 0 ? `Expired ${Math.abs(p.status.days)} days ago` : `${p.status.days} days left`}</span></div><p className="text-sm font-semibold font-sans" style={{ color:"var(--text-primary)" }}>{p.category}{p.brand?` · ${p.brand}`:""}{p.shade?` — ${p.shade}`:""}</p>{!p.status.hasOpenedDate && <p className="text-[11px] font-sans italic mt-0.5" style={{ color:lv.text, opacity:0.7 }}>Estimated — set an opening date for accuracy</p>}</div><div className="text-right shrink-0"><div className="text-[10px] font-sans" style={{ color:"var(--text-faint)" }}>Expires</div><div className="text-xs font-bold font-sans" style={{ color:lv.text }}>{p.status.expiry.toLocaleDateString("en-US",{month:"short",year:"numeric"})}</div></div></div></div>; })}</div>}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor:"var(--border)" }}>
        <div className="px-5 py-3.5 border-b" style={{ background:"var(--bg-subtle)", borderColor:"var(--border)" }}><p className="text-xs font-bold uppercase tracking-widest font-sans" style={{ color:"var(--text-muted)" }}>📋 PAO Guide</p></div>
        <div className="divide-y" style={{ borderColor:"var(--border)" }}>
          {[["Mascara","3m","Replace at 3 months — bacteria"],["Foundation","12m","Earlier if separates or smells"],["Concealer","12m","Watch for texture change"],["Eyeshadow","24m","Cream: 12 months"],["Lipstick","18m","Gloss: 12m · Stain: 24m"],["Blush powder","24m","Cream blush: 12–18 months"],["Setting Spray","12m","Discard if it smells sour"]].map(([product,months,note])=>(
            <div key={product} className="flex items-start gap-4 px-5 py-3" style={{ background:"var(--bg-card)" }}>
              <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold font-sans shrink-0">{months}</div>
              <div><p className="text-sm font-semibold font-sans" style={{ color:"var(--text-primary)" }}>{product}</p><p className="text-xs font-sans" style={{ color:"var(--text-muted)" }}>{note}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
