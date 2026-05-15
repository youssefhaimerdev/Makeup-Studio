"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ── Conversational scripts — sounds like a real makeup artist ─────────
const SCRIPTS = {
  "Foundation": "Okay, we're starting with foundation. Pump a small amount — seriously, less than you think — onto the back of your hand. Dot it on your forehead, both cheeks, your nose, and chin. Now take your damp sponge and bounce it outward from the centre. Don't drag. Bounce. Work downward toward your jaw and blend it into your neck so there's no line.",
  "BB Cream": "BB cream is your easiest base step. Squeeze a pea-sized amount onto your fingertips, warm it up for a second, then press and blend it outward from the centre of your face. Fingers actually work better than a brush for this — the warmth helps it melt into your skin.",
  "CC Cream": "CC cream goes on just like BB cream — fingertips or a damp sponge, starting from the centre and blending outward. The colour-correcting part works underneath everything else, so don't pile too much on top.",
  "Skin Tint": "This is your lightest base option. Just press it in with your fingertips — it's designed to look like nothing, so don't overthink it. Build it up only where you actually need it.",
  "Concealer": "Concealer goes on after foundation, not before. Under the eyes, draw a small triangle pointing downward — this brightens your whole face, not just the dark circles. Dab with your ring finger using a pressing motion, never rubbing. Set it lightly afterwards.",
  "Color Corrector": "A tiny amount — I mean tiny. This product only needs to neutralise, not cover. Peach or salmon goes on dark circles. Green goes on any redness. Press it in gently and let it fully dry before foundation goes on top.",
  "Primer": "Let your moisturiser fully absorb first — two full minutes. Then take a pea-sized amount of primer and press it into your T-zone and any pores you want blurred. Wait another sixty seconds before you touch foundation. This step is what makes your makeup last.",
  "Setting Powder": "Tap your brush firmly on the back of your hand to knock off the excess — you want much less than you think. Now press the brush into your T-zone rather than sweeping. Pressing sets better than sweeping. Under the eyes, use a damp sponge and press it in.",
  "Setting Spray": "Close your eyes and hold the bottle about twenty-five centimetres from your face. Spray in an X pattern — diagonal from top-left to bottom-right — then a T across the middle. Let it dry completely on its own. Don't touch your face while it's drying.",
  "Blush": "Smile slightly — and I mean slightly — to find your cheeks. Now sweep your brush from the apples of your cheeks upward and outward toward your temples. Always move upward. Never downward. Tap excess off the brush first, build slowly, because blush is very hard to remove once it's on.",
  "Blush Stick": "Swipe the blush stick in a small C-shape on your cheekbone — from the top of your cheek down to just below it. Now tap and blend with your fingertips using circular motions. The warmth from your fingers melts it into skin beautifully.",
  "Cream Blush": "Dab cream blush on your cheekbone with one or two fingertips. Then blend it out using small circular tapping motions. Work quickly because cream products start to set, and once they've set they're much harder to blend.",
  "Bronzer": "This goes where the sun would naturally hit you. That means your forehead, the top of your cheeks, and lightly along your jaw. Think of a loose number three on each side of your face. Use a big fluffy brush and tap the excess off first — too much bronzer is the fastest way to look muddy.",
  "Cream Bronzer": "Take a tiny amount on two fingers and press it onto your cheekbones, temples, and lightly along your jaw. Blend with your fingers in small circular motions. Cream bronzer is more forgiving than powder, but you still want to build it slowly.",
  "Contour": "Feel for the hollow beneath your cheekbones — suck your cheeks in slightly and you'll feel the indentation. That's where your contour goes. Apply with a small angled brush, then blend upward toward your temples with a fluffy brush. It should look like shadow, not like a stripe of brown.",
  "Highlighter": "Less is more with highlighter. Apply only to the very highest points of your cheekbones, the tip of your nose bridge, and your cupid's bow. Use your ring finger to press it in rather than a brush — the warmth from your finger is what gives it that glowing lit-from-within effect instead of just shimmer sitting on top.",
  "Eyeshadow": "Tap your brush into the shadow and tap off any excess on the back of your hand. Then pack it onto your lid using gentle pressing motions — don't sweep back and forth. Build the colour slowly. Go darker in the outer corner and along the crease, lighter on the inner lid.",
  "Loose Pigment": "Be very careful with this one — it's intensely pigmented and goes everywhere. Tap a tiny amount onto a flat brush, hold your brush horizontally and tap off excess over a tissue. Then press it onto your lid. Do not blow on the brush. Press, don't sweep.",
  "Eyeliner": "Start from the inner corner and work outward in small, short strokes rather than one long line — unless you're very practised. Stay as close to your lash line as possible. For a wing, rest your elbow on a table for steadiness, look down into a mirror rather than straight ahead, and flick upward following the angle of your lower lash line.",
  "Eye Primer": "Tap a tiny amount of eye primer onto your lid and blend it out with your fingertip. Let it set for thirty seconds, then dust a very light layer of translucent powder over it. This double-sets the base and gives your eyeshadow maximum grip.",
  "Mascara": "Wipe the excess off the wand before it touches your lashes — that alone solves most clumping. Start at the base of your lashes and wiggle the wand slightly before dragging upward. Let the first coat dry for twenty seconds before adding another. Two good coats beats three clumpy ones.",
  "Eyebrow": "Use short, hair-like strokes in the direction your brows grow — never fill them in with one solid line. Go one to two shades lighter than your actual hair colour. After filling, brush through your brows with a spoolie to blend and soften any harsh marks.",
  "Brow Lamination Gel": "Brush upward through your brows from the root — really get the gel all the way to the base of each hair. Then shape them into place. Work quickly because the gel sets fast. Overdoing it looks crunchy, so one pass is usually enough.",
  "Lipstick": "Line your lips first — it makes the lipstick last dramatically longer. Then apply your lipstick from the centre outward. Blot once with a tissue, then reapply a second coat. That double layer is what gives you real staying power.",
  "Lip Gloss": "Apply from the centre of your lips outward, building up in the middle for dimension. A tiny extra dab in the very centre of your lower lip makes your lips look fuller. Don't rub your lips together — dab them lightly instead.",
  "Lip Liner": "Follow your natural lip line — don't overdraw unless you're deliberately going for a fuller look. After outlining, fill in your entire lip with the liner before adding lipstick. This creates a base that makes your colour last twice as long.",
  "Lip Oil": "Apply directly from the applicator and press your lips together lightly. Lip oil is very forgiving — it blurs and hydrates without looking heavy. Reapply whenever you need to.",
  "Lip Stain": "Apply quickly and blend immediately — stains grab fast. You have about ten seconds to blend before it starts setting. For a natural flush, dab it on with your finger and blend outward. For more intensity, build it in layers after each one sets.",
};

const DEFAULT_SCRIPT = "Pick up your product and apply it with gentle, controlled motions. Build slowly — you can always add more, but removing product always disturbs what's underneath.";

const STEP_DURATIONS = {
  "Skincare Prep":60,"Primer":45,"Foundation":90,"Concealer":60,"Color Corrector":45,
  "Setting Powder":45,"Setting Spray":20,"Blush":30,"Blush Stick":30,"Cream Blush":30,
  "Bronzer":30,"Cream Bronzer":30,"Contour":45,"Highlighter":20,"Eyeshadow":120,
  "Eyeliner":60,"Mascara":45,"Eyebrow":60,"Brow Lamination Gel":30,
  "Lipstick":30,"Lip Gloss":15,"Lip Oil":15,"Lip Stain":30,"Lip Liner":45,
  "Eye Primer":30,
};

function useCountdown(seconds, onDone) {
  const [remaining, setRemaining] = useState(seconds);
  const [running,   setRunning]   = useState(false);
  const ref = useRef(null);
  useEffect(() => { setRemaining(seconds); setRunning(false); }, [seconds]);
  useEffect(() => {
    if (!running) { clearInterval(ref.current); return; }
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(ref.current); setRunning(false); onDone?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running, onDone]);
  return { remaining, running, start: () => setRunning(true), pause: () => setRunning(false), reset: () => { setRunning(false); setRemaining(seconds); } };
}

function speak(text, rate = 0.9) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate  = rate;
  utt.pitch = 1.05;
  utt.volume = 1;
  // Try to use a female voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.lang.startsWith("en") && (v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Victoria") || v.name.includes("Moira"))
  ) || voices.find(v => v.lang.startsWith("en"));
  if (preferred) utt.voice = preferred;
  window.speechSynthesis.speak(utt);
}

function ProgressRing({ remaining, total, size = 84 }) {
  const r = (size/2) - 6, circ = 2*Math.PI*r;
  const pct = total > 0 ? remaining/total : 0;
  const colour = remaining <= 5 ? "#ef4444" : remaining <= 15 ? "#f59e0b" : "#e11d48";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-mid)" strokeWidth="5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={colour} strokeWidth="5"
              strokeLinecap="round" strokeDasharray={`${pct*circ} ${circ}`}
              transform={`rotate(-90 ${size/2} ${size/2})`}
              style={{ transition:"stroke-dasharray 0.95s linear, stroke 0.3s" }}/>
      <text x="50%" y="55%" textAnchor="middle" fontSize={size*0.23}
            fontWeight="700" fontFamily="DM Sans, sans-serif" fill={colour}>{remaining}</text>
    </svg>
  );
}

export default function TutorialMode({ steps, onClose }) {
  const validSteps = steps.filter(s => s.product);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [voiceOn,    setVoiceOn]    = useState(false);
  const [voiceRate,  setVoiceRate]  = useState(0.9);
  const [completed,  setCompleted]  = useState(new Set());
  const [scriptOpen, setScriptOpen] = useState(true);

  const current  = validSteps[currentIdx];
  const duration = current ? (STEP_DURATIONS[current.category] || 30) : 30;
  const isLast   = currentIdx === validSteps.length - 1;
  const allDone  = completed.size === validSteps.length;
  const script   = current ? (SCRIPTS[current.category] || DEFAULT_SCRIPT) : "";

  const handleTimerDone = useCallback(() => {
    if (voiceOn) speak("Step complete. Moving on when you're ready.");
  }, [voiceOn]);

  const { remaining, running, start, pause, reset } = useCountdown(duration, handleTimerDone);

  // Announce when step changes
  useEffect(() => {
    if (!current || !voiceOn) return;
    const prod = current.product;
    const name = prod?.brand ? `${prod.brand}${prod.shade ? `, ${prod.shade}` : ""}` : current.category;
    // Small pause then read the conversational script
    const t = setTimeout(() => speak(`Step ${currentIdx+1}: ${current.category}. Using ${name}. ${script}`, voiceRate), 400);
    return () => clearTimeout(t);
  }, [currentIdx, voiceOn]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; window.speechSynthesis?.cancel(); };
  }, []);

  function goTo(idx) { reset(); setCurrentIdx(idx); setScriptOpen(true); }
  function markDone(idx) { setCompleted(prev => new Set([...prev, idx])); if (!isLast) goTo(idx+1); }

  function toggleVoice() {
    const next = !voiceOn; setVoiceOn(next);
    if (next && current) {
      speak(`Tutorial mode — with audio. ${script}`, voiceRate);
    } else { window.speechSynthesis?.cancel(); }
  }

  function readScript() { if (script) speak(script, voiceRate); }

  if (!validSteps.length) return null;

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="fixed inset-0 z-[151] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
             style={{ background:"var(--bg-card)", maxHeight:"94vh" }}
             onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="px-5 py-4 border-b flex items-center justify-between shrink-0"
               style={{ background:"var(--bg-subtle)", borderColor:"var(--border)" }}>
            <div>
              <p className="text-[10px] font-bold font-sans uppercase tracking-widest" style={{ color:"var(--text-muted)" }}>Tutorial Mode</p>
              <p className="text-sm font-semibold font-sans" style={{ color:"var(--text-primary)" }}>Step {currentIdx+1} of {validSteps.length}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Voice speed */}
              {voiceOn && (
                <select value={voiceRate} onChange={e => { setVoiceRate(parseFloat(e.target.value)); }}
                  className="text-xs border rounded-full px-2 py-1 font-sans cursor-pointer"
                  style={{ background:"var(--bg-card)", borderColor:"var(--border)", color:"var(--text-muted)" }}>
                  <option value={0.7}>Slow</option>
                  <option value={0.9}>Normal</option>
                  <option value={1.1}>Fast</option>
                </select>
              )}
              {/* Voice toggle */}
              {typeof window !== "undefined" && window.speechSynthesis && (
                <button onClick={toggleVoice}
                  className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border transition-all text-sm"
                  style={{ background:voiceOn?"#fff1f2":"var(--bg-card)", borderColor:voiceOn?"#fecdd3":"var(--border)", color:voiceOn?"#e11d48":"var(--text-muted)" }}
                  title={voiceOn?"Mute":"Enable voice"}>
                  {voiceOn ? "🔊" : "🔇"}
                </button>
              )}
              <button onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border text-sm"
                style={{ background:"var(--bg-card)", borderColor:"var(--border)", color:"var(--text-muted)" }}>✕</button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 shrink-0" style={{ background:"var(--border)" }}>
            <div className="h-full transition-all duration-500"
                 style={{ width:`${((currentIdx+(completed.has(currentIdx)?1:0))/validSteps.length)*100}%`, background:"linear-gradient(90deg,#fb7185,#b87aaa)" }}/>
          </div>

          {/* All done */}
          {allDone ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="text-6xl">🎉</div>
              <h2 className="font-serif text-2xl font-bold" style={{ color:"var(--text-primary)" }}>Look complete!</h2>
              <p className="text-sm font-sans" style={{ color:"var(--text-muted)" }}>You've worked through all {validSteps.length} steps.</p>
              <button onClick={onClose} className="btn-primary mt-2">Close Tutorial</button>
            </div>
          ) : current ? (
            <div className="flex-1 overflow-y-auto">
              <div className="p-5">
                {/* Step header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-rose-600 text-white font-bold font-sans flex items-center justify-center shrink-0">{currentIdx+1}</div>
                  <div className="flex-1">
                    <h2 className="font-serif text-xl font-bold mb-0.5" style={{ color:"var(--text-primary)" }}>{current.category}</h2>
                    {current.product && (
                      <div className="flex items-center gap-2">
                        {current.product.shadeHex && <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ background:current.product.shadeHex }}/>}
                        <p className="text-sm font-sans" style={{ color:"var(--text-muted)" }}>
                          {current.product.brand||""}{current.product.brand&&current.product.shade?" — ":""}{current.product.shade||""}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conversational script */}
                <div className="rounded-xl border mb-4 overflow-hidden" style={{ borderColor:"var(--border)" }}>
                  <button onClick={() => setScriptOpen(v=>!v)}
                    className="w-full flex items-center justify-between px-4 py-3 border-none cursor-pointer font-sans"
                    style={{ background:"var(--bg-subtle)" }}>
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color:"var(--text-muted)" }}>
                      💬 Technique guide
                    </span>
                    <span className={`transition-transform duration-200 text-sm ${scriptOpen?"rotate-180":""}`} style={{ color:"var(--text-faint)" }}>▾</span>
                  </button>
                  {scriptOpen && (
                    <div className="px-4 pb-4 pt-2">
                      <p className="text-sm font-sans leading-relaxed" style={{ color:"var(--text-secondary)" }}>{script}</p>
                      {typeof window !== "undefined" && window.speechSynthesis && !voiceOn && (
                        <button onClick={readScript}
                          className="mt-3 flex items-center gap-1.5 text-xs font-semibold font-sans cursor-pointer bg-transparent border-none text-rose-500 hover:text-rose-700">
                          🔊 Read this aloud
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Timer */}
                <div className="flex flex-col items-center gap-3 mb-5 py-3">
                  <ProgressRing remaining={remaining} total={duration} size={90}/>
                  <p className="text-xs font-sans" style={{ color:"var(--text-muted)" }}>
                    {running?"Timer running…":remaining===0?"Time's up!":remaining===duration?`${duration}s suggested`:"Paused"}
                  </p>
                  <div className="flex gap-2">
                    {!running&&remaining>0&&<button onClick={start} className="rounded-full px-4 py-2 text-sm font-semibold font-sans cursor-pointer border" style={{ background:"#fff1f2", borderColor:"#fecdd3", color:"#e11d48" }}>▶ Start Timer</button>}
                    {running&&<button onClick={pause} className="rounded-full px-4 py-2 text-sm font-semibold font-sans cursor-pointer border" style={{ background:"var(--bg-card)", borderColor:"var(--border)", color:"var(--text-muted)" }}>⏸ Pause</button>}
                    <button onClick={reset} className="rounded-full px-4 py-2 text-sm font-semibold font-sans cursor-pointer border" style={{ background:"var(--bg-card)", borderColor:"var(--border)", color:"var(--text-muted)" }}>↺ Reset</button>
                  </div>
                </div>

                {/* Actions */}
                <button onClick={() => markDone(currentIdx)} className="btn-primary w-full justify-center">
                  {isLast?"✓ Finish Look":"✓ Done — Next Step →"}
                </button>
                {currentIdx>0&&<button onClick={()=>goTo(currentIdx-1)} className="w-full mt-2 text-xs font-sans cursor-pointer bg-transparent border-none text-center py-2" style={{ color:"var(--text-faint)" }}>← Back to previous step</button>}
              </div>

              {/* Step dots */}
              <div className="px-5 pb-5">
                <p className="section-label mb-2">Steps overview</p>
                <div className="flex flex-wrap gap-2">
                  {validSteps.map((s,i) => (
                    <button key={i} onClick={()=>goTo(i)}
                      className="w-8 h-8 rounded-full text-xs font-bold font-sans cursor-pointer border transition-all"
                      style={{ background:completed.has(i)?"#e11d48":i===currentIdx?"#fff1f2":"var(--bg-card)", borderColor:completed.has(i)?"#e11d48":i===currentIdx?"#fecdd3":"var(--border)", color:completed.has(i)?"#fff":i===currentIdx?"#e11d48":"var(--text-muted)" }}>
                      {completed.has(i)?"✓":i+1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
