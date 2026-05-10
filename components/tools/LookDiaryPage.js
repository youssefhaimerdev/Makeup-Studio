"use client";
import { useState, useEffect } from "react";
import { loadDiary, addDiaryEntry, deleteDiaryEntry, updateDiaryEntry, formatDiaryDate, getDiaryStats } from "@/lib/lookHistory";
import { OCCASIONS } from "@/lib/constants";
import { PAGES } from "@/lib/routes";
const RATINGS = ["😐","🙂","😊","😍","🌟"];
export default function LookDiaryPage({ setPage }) {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [lookName, setLookName] = useState("");
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [notes, setNotes] = useState("");
  useEffect(() => { setEntries(loadDiary()); }, []);
  const stats = getDiaryStats(entries);
  return (
    <div className="page-container max-w-2xl">
      <button onClick={() => setPage(PAGES.TOOLS)} className="text-xs font-sans cursor-pointer bg-transparent border-none mb-5" style={{ color:"var(--text-muted)" }}>← Back to Tools</button>
      <h1 className="page-title">📓 Look Diary</h1>
      <p className="page-subtitle">Log every look with notes and ratings. Remember what worked.</p>
      {stats && <div className="grid grid-cols-3 gap-3 mb-6">{[{n:stats.totalEntries,l:"Logged"},{n:stats.topOccasion?.[0]||"—",l:"Top occasion",sm:true},{n:stats.topLook?.[0]||"—",l:"Fave look",sm:true}].map((s,i)=><div key={i} className="rounded-xl p-3 text-center border" style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}><div className={`font-serif font-bold text-rose-600 ${s.sm?"text-sm leading-tight":"text-2xl"}`}>{s.n}</div><div className="text-[10px] font-sans uppercase tracking-wide mt-0.5" style={{ color:"var(--text-faint)" }}>{s.l}</div></div>)}</div>}
      <div className="mb-6">
        {!showForm ? <button className="btn-primary" onClick={() => setShowForm(true)}>+ Log Today's Look</button> : (
          <div className="p-5 rounded-2xl border" style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}>
            <div className="flex flex-col gap-3">
              <div><label className="section-label">Look Name</label><input value={lookName} onChange={e=>setLookName(e.target.value)} placeholder="e.g. Soft Glam Date Night" className="input-field"/></div>
              <div><label className="section-label">Occasion</label><select value={occasion} onChange={e=>setOccasion(e.target.value)} className="input-field">{OCCASIONS.map(o=><option key={o}>{o}</option>)}</select></div>
              <div><label className="section-label">Notes</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="What worked? What would you change?" rows={3} className="input-field resize-none"/></div>
              <div className="flex gap-3"><button className="btn-primary" onClick={()=>{setEntries(addDiaryEntry({lookName:lookName||"My Look",occasion,notes}));setLookName("");setNotes("");setShowForm(false);}}>Save</button><button className="btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button></div>
            </div>
          </div>
        )}
      </div>
      {entries.length === 0 ? <div className="text-center py-12"><div className="text-4xl mb-3 opacity-40">📓</div><p className="font-serif text-lg" style={{ color:"var(--text-secondary)" }}>No looks logged yet</p></div> : (
        <div className="flex flex-col gap-3">
          {entries.map(entry => (
            <div key={entry.id} className="rounded-2xl border p-4 group" style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold font-sans uppercase tracking-wide" style={{ color:"var(--text-muted)" }}>{formatDiaryDate(entry.date)}</span>
                    {entry.occasion && <span className="pill bg-rose-50 text-rose-600">{entry.occasion}</span>}
                  </div>
                  <h3 className="font-serif text-base font-bold mb-1" style={{ color:"var(--text-primary)" }}>{entry.lookName||"My Look"}</h3>
                  {entry.notes && <p className="text-sm font-sans" style={{ color:"var(--text-muted)" }}>{entry.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button onClick={()=>setEntries(deleteDiaryEntry(entry.id))} className="text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none" style={{ color:"var(--text-faint)" }}>✕</button>
                  <div className="flex gap-0.5">{RATINGS.map((emoji,i)=><button key={i} onClick={()=>setEntries(updateDiaryEntry(entry.id,{rating:i+1}))} className={`text-base cursor-pointer bg-transparent border-none ${entry.rating===i+1?"scale-125":"opacity-40 hover:opacity-80"}`}>{emoji}</button>)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
