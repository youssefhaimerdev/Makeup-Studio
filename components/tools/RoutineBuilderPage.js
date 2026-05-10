"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { CATEGORIES } from "@/lib/constants";
import { PAGES } from "@/lib/routes";
const KEY = "mis_routines";
const AM = ["Skincare Prep","SPF / Sunscreen","Primer","Foundation","Concealer","Blush","Mascara","Eyebrow","Setting Spray"];
const PM = ["Skincare Prep","Foundation","Concealer","Eyeshadow","Eyeliner","Mascara","Contour","Blush","Highlighter","Lipstick","Setting Powder","Setting Spray"];
export default function RoutineBuilderPage({ setPage }) {
  const { inventory } = useApp();
  const [routines, setRoutines] = useState({ am:[], pm:[] });
  const [tab, setTab] = useState("am");
  const [adding, setAdding] = useState(false);
  const [selCat, setSelCat] = useState("Foundation");
  useEffect(() => { setRoutines(loadFromStorage(KEY, { am:[], pm:[] })); }, []);
  function save(updated) { setRoutines(updated); saveToStorage(KEY, updated); }
  function addStep() { const product = inventory.find(p => p.category === selCat); save({ ...routines, [tab]: [...routines[tab], { id:Date.now(), category:selCat, product:product||null }] }); setAdding(false); }
  function removeStep(id) { save({ ...routines, [tab]: routines[tab].filter(s => s.id !== id) }); }
  function moveStep(id, dir) { const arr=[...routines[tab]]; const idx=arr.findIndex(s=>s.id===id); const ni=idx+dir; if(ni<0||ni>=arr.length)return; [arr[idx],arr[ni]]=[arr[ni],arr[idx]]; save({...routines,[tab]:arr}); }
  const suggestions = (tab==="am"?AM:PM).filter(s => !routines[tab].find(r => r.category===s));
  return (
    <div className="page-container max-w-2xl">
      <button onClick={() => setPage(PAGES.TOOLS)} className="text-xs font-sans cursor-pointer bg-transparent border-none mb-5" style={{ color:"var(--text-muted)" }}>← Back to Tools</button>
      <h1 className="page-title">🌅 Routine Builder</h1>
      <p className="page-subtitle">Build AM and PM routines from your inventory.</p>
      <div className="flex gap-0 border-b mb-6" style={{ borderColor:"var(--border)" }}>
        {[{id:"am",label:"☀️ Morning"},{id:"pm",label:"🌙 Evening"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-5 py-3 text-sm font-semibold font-sans cursor-pointer border-none bg-transparent border-b-2 transition-all ${tab===t.id?"border-rose-400 text-rose-600":"border-transparent"}`} style={{ color:tab===t.id?undefined:"var(--text-muted)" }}>{t.label}</button>)}
      </div>
      <div className="flex flex-col gap-2 mb-5">
        {routines[tab].length === 0 ? <div className="text-center py-8 rounded-2xl border border-dashed" style={{ borderColor:"var(--border)" }}><p className="text-sm font-sans" style={{ color:"var(--text-muted)" }}>No steps yet</p></div>
          : routines[tab].map((step,i) => <div key={step.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}>
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold font-sans flex items-center justify-center shrink-0">{i+1}</span>
            <div className="flex-1"><div className="text-sm font-semibold font-sans" style={{ color:"var(--text-primary)" }}>{step.category}</div>{step.product ? <div className="text-xs font-sans" style={{ color:"var(--text-muted)" }}>{step.product.brand||""}{step.product.shade?` — ${step.product.shade}`:""}</div> : <div className="text-xs font-sans text-rose-400">Not in inventory</div>}</div>
            <div className="flex gap-1">
              <button onClick={()=>moveStep(step.id,-1)} disabled={i===0} className="w-6 h-6 rounded bg-transparent border-none cursor-pointer text-xs disabled:opacity-30" style={{ color:"var(--text-muted)" }}>↑</button>
              <button onClick={()=>moveStep(step.id,1)} disabled={i===routines[tab].length-1} className="w-6 h-6 rounded bg-transparent border-none cursor-pointer text-xs disabled:opacity-30" style={{ color:"var(--text-muted)" }}>↓</button>
              <button onClick={()=>removeStep(step.id)} className="w-6 h-6 rounded bg-transparent border-none cursor-pointer text-xs" style={{ color:"var(--text-faint)" }}>✕</button>
            </div>
          </div>)}
      </div>
      {!adding ? <button className="btn-primary" onClick={()=>setAdding(true)}>+ Add Step</button> : (
        <div className="p-4 rounded-2xl border mb-4" style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}>
          <label className="section-label">Category</label>
          <select value={selCat} onChange={e=>setSelCat(e.target.value)} className="input-field mb-3">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
          <div className="flex gap-2"><button className="btn-primary" onClick={addStep}>Add</button><button className="btn-secondary" onClick={()=>setAdding(false)}>Cancel</button></div>
        </div>
      )}
      {suggestions.length > 0 && <div className="mt-6"><p className="section-label mb-2">Quick add</p><div className="flex flex-wrap gap-2">{suggestions.map(s=><button key={s} onClick={()=>{const p=inventory.find(pr=>pr.category===s);save({...routines,[tab]:[...routines[tab],{id:Date.now(),category:s,product:p||null}]});}} className="rounded-full px-3 py-1.5 text-xs font-medium font-sans cursor-pointer transition-all border hover:border-rose-300" style={{ background:"var(--bg-card)", borderColor:"var(--border)", color:"var(--text-muted)" }}>+ {s}</button>)}</div></div>}
    </div>
  );
}
