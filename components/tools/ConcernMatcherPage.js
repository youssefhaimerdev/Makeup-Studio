"use client";
import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { SKIN_CONCERNS } from "@/lib/constants";
import { PAGES } from "@/lib/routes";
const ROUTINES = {
  dark_circles: { title:"Dark Circle Routine", intro:"Neutralise before concealing — the corrector step is what most people skip.", steps:[{step:"Colour correct",detail:"Peach or salmon corrector pressed only onto the darkest area. Neutralises the blue-grey before concealer fights it.",categories:["Color Corrector"]},{step:"Concealer",detail:"1–2 shades lighter than foundation in inverted triangle. Blend with damp sponge pressing motions.",categories:["Concealer"]},{step:"Set lightly",detail:"Yellow-toned powder under eyes only. Avoid bright white — it amplifies grey cast.",categories:["Setting Powder"]}], tip:"One change: use a peach corrector before concealer. Eliminates more dark circle failures than anything else." },
  acne: { title:"Acne-Friendly Coverage", intro:"Coverage that conceals without emphasising texture or clogging pores.", steps:[{step:"Mattifying primer",detail:"Pore-filling primer on breakout areas. Creates a base that prevents foundation settling into texture.",categories:["Primer","Pore Primer"]},{step:"Build in layers",detail:"Light layer everywhere first, then build coverage only over breakouts with a flat brush pressing motion.",categories:["Foundation","BB Cream"]},{step:"Spot conceal",detail:"Full-coverage concealer with a fine brush directly on each spot only. Blend the very outer edge.",categories:["Concealer"]},{step:"Set to last",detail:"Light press of setting powder over T-zone and covered spots only.",categories:["Setting Powder","Setting Spray"]}], tip:"Over breakouts, thin layers beat one heavy layer every time." },
  redness: { title:"Redness & Rosacea Routine", intro:"Neutralise at the prep stage — not the coverage stage.", steps:[{step:"Green correct",detail:"Green-tinted primer or CC cream on red areas only. A tiny dot is sufficient — less than you think.",categories:["Color Corrector","Primer"]},{step:"Foundation",detail:"Apply over corrected areas. If correction was right, you need surprisingly little foundation.",categories:["Foundation","CC Cream"]},{step:"Set and lock",detail:"Setting powder and spray create a barrier that slows re-flushing throughout the day.",categories:["Setting Powder","Setting Spray"]}], tip:"Less foundation with a proper corrector always looks better than more foundation without one." },
  large_pores: { title:"Minimise Pores Routine", intro:"Pores can't be closed — but they can be physically filled.", steps:[{step:"Silicone primer",detail:"Pore-filling primer with fingertip pressing motions. Let dry completely — 90 seconds minimum.",categories:["Primer","Pore Primer"]},{step:"Lightweight foundation",detail:"Medium-coverage liquid with damp sponge pressing motions. Never a brush over porous areas.",categories:["Foundation","Skin Tint"]},{step:"Press powder",detail:"Press — don't sweep — finely milled powder over porous areas to prevent oil breakthrough.",categories:["Setting Powder"]}], tip:"Pore-filling primer is non-negotiable. More foundation without it makes pores look worse." },
  dry_patches: { title:"Dry Skin & Patches Routine", intro:"The fix is at the skincare stage, not by using more foundation.", steps:[{step:"Prep and absorb",detail:"Hydrating serum then richer moisturiser over dry areas. Wait a full 5 minutes.",categories:["Skincare Prep"]},{step:"Hydrating primer",detail:"Water-based hydrating primer — helps liquid foundation glide rather than cling.",categories:["Primer"]},{step:"Dewy foundation",detail:"Dewy or luminous formula only. Apply with fingers or damp sponge. Never matte over dry patches.",categories:["Foundation","Skin Tint","Tinted Moisturiser"]},{step:"Setting spray only",detail:"Setting spray replaces powder. Never powder over dry patches.",categories:["Setting Spray"]}], tip:"Short on time: skip foundation and use tinted moisturiser with fingers." },
  fine_lines: { title:"Fine Lines & Ageing Skin", intro:"The biggest enemies: excess powder and heavy matte products.", steps:[{step:"Plumping skincare",detail:"Hyaluronic acid serum and rich moisturiser. Wait 5 minutes. Plumped skin makes lines appear shallower.",categories:["Skincare Prep"]},{step:"Illuminating primer",detail:"Luminous primer — not mattifying. Adds the radiance that makes skin look youthful.",categories:["Primer"]},{step:"Light dewy foundation",detail:"Medium coverage maximum, dewy finish. Apply only where needed. Let skin show through.",categories:["Foundation","Tinted Moisturiser"]},{step:"Setting spray not powder",detail:"Fine mist of setting spray. Powder settles into lines and emphasises them.",categories:["Setting Spray"]}], tip:"Over 35: powder sparingly and only where needed. Dewy ages backwards; matte ages forwards." },
  oiliness: { title:"Oily Skin Long-Wear", intro:"The solution is layered prevention, not more product.", steps:[{step:"Mattifying primer",detail:"Silicone-based mattifying primer on T-zone. Creates a barrier between skin oils and foundation.",categories:["Primer","Pore Primer"]},{step:"Matte foundation",detail:"Oil-control foundation applied thin. Build in layers — one thin full-face then targeted.",categories:["Foundation"]},{step:"Bake under eyes",detail:"Generous press of loose powder, let sit 3–5 minutes then brush away. Sets significantly longer.",categories:["Setting Powder","Concealer"]},{step:"Setting spray",detail:"Long-wear setting spray in X-then-T pattern. Most important final step for oily skin.",categories:["Setting Spray"]}], tip:"Mid-day: blot first, then lightly press powder. Never powder over shine without blotting first." },
  hyperpigmentation: { title:"Hyperpigmentation Coverage", intro:"Targeted correction and coverage — not all-over heavy foundation.", steps:[{step:"Colour correct",detail:"Orange or peach corrector on dark spots only. Deeper spot = more orange corrector.",categories:["Color Corrector"]},{step:"Foundation",detail:"Medium-to-full coverage over corrected areas. Correction underneath reduces how much you need.",categories:["Foundation"]},{step:"Targeted concealer",detail:"Full-coverage concealer on remaining visible spots with fine brush. Press — never rub.",categories:["Concealer"]},{step:"Set",detail:"Setting powder presses coverage into place and prevents transfer.",categories:["Setting Powder","Setting Spray"]}], tip:"Colour correction is the only technique that genuinely reduces foundation needed for hyperpigmentation." },
  dullness: { title:"Dull Skin Glow Routine", intro:"Add radiance at every layer, not just at the highlighter stage.", steps:[{step:"Illuminating primer",detail:"Pearl-tinted illuminating primer under foundation. Radiance from underneath is more convincing.",categories:["Primer"]},{step:"Luminous foundation",detail:"Never matte on dull skin. Serum foundation or dewy-finish reflects light from the base up.",categories:["Foundation","Skin Tint"]},{step:"Cream blush",detail:"Cream blush with fingers — fuses with skin in a way powder can't replicate.",categories:["Blush","Cream Blush"]},{step:"Precise highlight",detail:"Liquid highlighter pressed with fingertip on cheekbones, bridge, cupid's bow only.",categories:["Highlighter"]}], tip:"Illuminating primer is the most effective anti-dullness technique — makes the whole face glow before any colour." },
  eczema: { title:"Sensitive / Eczema-Friendly", intro:"Minimal, fragrance-free, hypoallergenic products are non-negotiable.", steps:[{step:"Barrier cream",detail:"Fragrance-free barrier cream over any active patches before any makeup.",categories:["Skincare Prep"]},{step:"Minimal base",detail:"Skin tint or tinted moisturiser — fewest ingredients possible. Patch test 48 hours before.",categories:["Skin Tint","Tinted Moisturiser"]},{step:"Setting spray",detail:"Alcohol-free setting spray rather than powder — powder can irritate sensitised skin.",categories:["Setting Spray"]}], tip:"Three ingredients most likely to cause reactions: fragrance, alcohol denat., and methylisothiazolinone." },
};
export default function ConcernMatcherPage({ setPage }) {
  const { profile, inventory } = useApp();
  const [selected, setSelected] = useState(profile?.skinConcerns?.[0] || null);
  const routine = selected ? ROUTINES[selected] : null;
  const concern = SKIN_CONCERNS.find(c => c.id === selected);
  const owned = new Set(inventory.map(p => p.category));
  return (
    <div className="page-container max-w-2xl">
      <button onClick={() => setPage(PAGES.TOOLS)} className="text-xs font-sans cursor-pointer bg-transparent border-none mb-5" style={{ color:"var(--text-muted)" }}>← Back to Tools</button>
      <h1 className="page-title">🎯 Concern Matcher</h1>
      <p className="page-subtitle">Select a skin concern — get a targeted routine from your stash.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        {SKIN_CONCERNS.filter(c => ROUTINES[c.id]).map(c => (
          <button key={c.id} onClick={() => setSelected(c.id)} className="flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer text-left transition-all" style={{ background:selected===c.id?"#fff1f2":"var(--bg-card)", borderColor:selected===c.id?"#fecdd3":"var(--border)" }}>
            <span className="text-base shrink-0">{c.icon}</span>
            <p className="text-xs font-bold font-sans" style={{ color:selected===c.id?"#e11d48":"var(--text-primary)" }}>{c.label}</p>
          </button>
        ))}
      </div>
      {routine && concern && (
        <div>
          <div className="p-5 rounded-2xl border mb-5" style={{ background:"linear-gradient(135deg,#fff1f2,#fdf4f0)", borderColor:"#fecdd3" }}>
            <div className="flex items-center gap-2 mb-2"><span className="text-xl">{concern.icon}</span><h2 className="font-serif text-xl font-bold" style={{ color:"var(--text-primary)" }}>{routine.title}</h2></div>
            <p className="text-sm font-sans leading-relaxed" style={{ color:"var(--text-muted)" }}>{routine.intro}</p>
          </div>
          <div className="flex flex-col gap-3 mb-6">
            {routine.steps.map((step, i) => (
              <div key={i} className="rounded-xl border px-4 py-4" style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-rose-600 text-white text-xs font-bold font-sans flex items-center justify-center shrink-0">{i+1}</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold font-sans mb-1" style={{ color:"var(--text-primary)" }}>{step.step}</p>
                    <p className="text-sm font-sans leading-relaxed mb-2" style={{ color:"var(--text-muted)" }}>{step.detail}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {step.categories.map(cat => { const has = owned.has(cat); return <span key={cat} className="px-2 py-0.5 rounded-full text-[10px] font-semibold font-sans border" style={has?{background:"#f0fdf4",borderColor:"#bbf7d0",color:"#16a34a"}:{background:"var(--bg-subtle)",borderColor:"var(--border)",color:"var(--text-faint)"}}>{has?"✓":""} {cat}</span>; })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl border" style={{ background:"var(--bg-subtle)", borderColor:"var(--border-mid)" }}>
            <p className="text-xs font-bold uppercase tracking-wide font-sans mb-1" style={{ color:"var(--text-muted)" }}>💡 Key insight</p>
            <p className="text-sm font-sans leading-relaxed italic" style={{ color:"var(--text-secondary)" }}>"{routine.tip}"</p>
          </div>
        </div>
      )}
      {!selected && <div className="text-center py-10"><div className="text-4xl mb-3 opacity-40">🎯</div><p className="font-sans text-sm" style={{ color:"var(--text-muted)" }}>Select a concern above.</p></div>}
    </div>
  );
}
