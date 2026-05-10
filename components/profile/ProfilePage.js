"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import {
  SKIN_TONES, UNDERTONES, SKIN_TYPES, FACE_SHAPES,
  SKIN_CONCERNS, EYE_COLOURS, HAIR_COLOURS,
} from "@/lib/constants";
import { ButtonPrimary } from "@/components/ui/Button";

// ── Completion score ──────────────────────────────────────────────────────
const PROFILE_FIELDS = [
  { key: "skinTone",    label: "Skin Tone",      weight: 2 },
  { key: "undertone",   label: "Undertone",      weight: 2 },
  { key: "skinType",    label: "Skin Type",      weight: 1 },
  { key: "skinConcerns",label: "Skin Concerns",  weight: 1 },
  { key: "eyeColour",   label: "Eye Colour",     weight: 1 },
  { key: "hairColour",  label: "Hair Colour",    weight: 1 },
  { key: "faceShape",   label: "Face Shape",     weight: 1 },
];

function calcCompletion(local) {
  const total = PROFILE_FIELDS.reduce((s, f) => s + f.weight, 0);
  const done  = PROFILE_FIELDS.reduce((s, f) => {
    const v = local[f.key];
    const filled = Array.isArray(v) ? v.length > 0 : !!v;
    return s + (filled ? f.weight : 0);
  }, 0);
  return Math.round((done / total) * 100);
}

// ── Reusable sub-components ───────────────────────────────────────────────
function SectionBlock({ title, badge, children }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xs font-bold text-nude-500 uppercase tracking-widest">{title}</h2>
        {badge && (
          <span className="pill bg-rose-50 text-rose-500">{badge}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function SelectionGrid({ items, value, onChange, cols = "flex flex-wrap gap-3", renderItem }) {
  return <div className={cols}>{items.map(item => renderItem(item, value, onChange))}</div>;
}

// ── Undertone test helper ─────────────────────────────────────────────────
function UndertoneTest() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="text-xs text-rose-500 font-semibold font-sans cursor-pointer bg-transparent
                   border-none underline underline-offset-2 hover:text-rose-700"
      >
        {open ? "Hide" : "Not sure? Take the quick test →"}
      </button>
      {open && (
        <div className="mt-3 p-4 bg-nude-50 border border-nude-100 rounded-xl font-sans">
          <p className="text-xs font-bold text-nude-700 mb-2">The vein test — look at your inner wrist in natural light:</p>
          <ul className="space-y-1.5">
            {[
              ["🟡 Blue / purple veins", "Cool undertone"],
              ["🟢 Green / olive veins", "Warm undertone"],
              ["🔵 Blue-green / teal",   "Neutral undertone"],
              ["🫒 Clearly greenish skin","Olive undertone"],
            ].map(([cue, result]) => (
              <li key={cue} className="flex items-start gap-2 text-xs text-nude-600">
                <span className="shrink-0">{cue}</span>
                <span className="text-nude-400">→</span>
                <span className="font-semibold text-nude-700">{result}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-nude-400 mt-2">
            Also: gold jewellery flattering = Warm. Silver flattering = Cool. Both = Neutral.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Face shape SVGs ───────────────────────────────────────────────────────
const FACE_SVGS = {
  oval:    <ellipse cx="32" cy="34" rx="18" ry="24" fill="currentColor"/>,
  round:   <ellipse cx="32" cy="34" rx="20" ry="20" fill="currentColor"/>,
  square:  <rect x="13" y="12" width="38" height="42" rx="6" fill="currentColor"/>,
  heart:   <path d="M32 54 C20 42 10 32 10 22 C10 14 17 10 24 12 C28 13 32 18 32 18 C32 18 36 13 40 12 C47 10 54 14 54 22 C54 32 44 42 32 54Z" fill="currentColor"/>,
  oblong:  <ellipse cx="32" cy="34" rx="15" ry="26" fill="currentColor"/>,
  diamond: <path d="M32 8 L54 30 L32 58 L10 30 Z" fill="currentColor"/>,
};

function FaceShapeButton({ shape, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 px-3 py-3 rounded-xl cursor-pointer
                  transition-all duration-200 border w-full
        ${isActive
          ? "border-rose-400 bg-rose-50 shadow-sm"
          : "border-nude-100 bg-white hover:border-rose-200 hover:bg-rose-50/40"
        }`}
    >
      <svg width="44" height="56" viewBox="0 0 64 64"
           className={`transition-colors ${isActive ? "text-rose-400" : "text-nude-300"}`}>
        {FACE_SVGS[shape.id]}
      </svg>
      <div>
        <div className={`text-xs font-bold font-sans ${isActive ? "text-rose-600" : "text-nude-700"}`}>
          {shape.label}
        </div>
        <div className="text-[10px] text-nude-400 font-sans leading-tight text-center mt-0.5">
          {shape.desc}
        </div>
      </div>
    </button>
  );
}

// ── Eye colour picker ─────────────────────────────────────────────────────
function EyeColourPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {EYE_COLOURS.map(eye => (
        <button
          key={eye.id}
          type="button"
          onClick={() => onChange(eye.id)}
          className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border cursor-pointer
                      transition-all duration-150 bg-white
            ${value === eye.id ? "border-rose-400 shadow-sm" : "border-nude-100 hover:border-rose-200"}`}
        >
          {/* Iris illustration */}
          <svg width="30" height="30" viewBox="0 0 30 30">
            <circle cx="15" cy="15" r="13" fill="white" stroke="#e3d5c5" strokeWidth="1"/>
            <circle cx="15" cy="15" r="9" fill={eye.hex}/>
            <circle cx="15" cy="15" r="5" fill="#1a0a00"/>
            <circle cx="12" cy="12" r="2" fill="white" opacity="0.85"/>
          </svg>
          <span className={`text-[10px] font-sans whitespace-nowrap
            ${value === eye.id ? "text-rose-600 font-bold" : "text-nude-500"}`}>
            {eye.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Hair colour picker ────────────────────────────────────────────────────
function HairColourPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {HAIR_COLOURS.map(hair => (
        <button
          key={hair.id}
          type="button"
          onClick={() => onChange(hair.id)}
          className={`flex flex-col items-center gap-1.5 px-2.5 py-2.5 rounded-xl border cursor-pointer
                      transition-all duration-150 bg-white
            ${value === hair.id ? "border-rose-400 shadow-sm" : "border-nude-100 hover:border-rose-200"}`}
        >
          <div
            className="w-7 h-7 rounded-full border border-black/10 shadow-sm"
            style={{ background: hair.hex }}
          />
          <span className={`text-[10px] font-sans text-center leading-tight max-w-[48px]
            ${value === hair.id ? "text-rose-600 font-bold" : "text-nude-500"}`}>
            {hair.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Skin concerns multi-select ────────────────────────────────────────────
function SkinConcernGrid({ value = [], onChange }) {
  function toggle(id) {
    onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id]);
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {SKIN_CONCERNS.map(concern => {
        const active = value.includes(concern.id);
        return (
          <button
            key={concern.id}
            type="button"
            onClick={() => toggle(concern.id)}
            className={`flex items-start gap-3 text-left px-3.5 py-3 rounded-xl border cursor-pointer
                        transition-all duration-150
              ${active
                ? "border-rose-300 bg-rose-50 shadow-sm"
                : "border-nude-100 bg-white hover:border-rose-200 hover:bg-rose-50/30"
              }`}
          >
            <span className="text-lg shrink-0 mt-0.5">{concern.icon}</span>
            <div>
              <div className={`text-xs font-bold font-sans
                ${active ? "text-rose-700" : "text-nude-700"}`}>
                {concern.label}
              </div>
              <div className="text-[11px] text-nude-400 font-sans leading-snug mt-0.5">
                {concern.desc}
              </div>
            </div>
            {active && (
              <div className="ml-auto shrink-0 w-4 h-4 rounded-full bg-rose-500 flex items-center
                              justify-center text-white text-[9px] font-bold">
                ✓
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Glasses toggle ────────────────────────────────────────────────────────
function GlassesToggle({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {[
        { id: false, label: "No glasses",       icon: "👁", desc: "Standard eye placement" },
        { id: true,  label: "I wear glasses",   icon: "👓", desc: "Adapted eye technique tips" },
      ].map(opt => (
        <button
          key={String(opt.id)}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer
                      transition-all duration-150 flex-1 min-w-[160px]
            ${value === opt.id
              ? "border-rose-300 bg-rose-50 shadow-sm"
              : "border-nude-100 bg-white hover:border-rose-200"
            }`}
        >
          <span className="text-2xl">{opt.icon}</span>
          <div>
            <div className={`text-sm font-bold font-sans
              ${value === opt.id ? "text-rose-700" : "text-nude-700"}`}>
              {opt.label}
            </div>
            <div className="text-[11px] text-nude-400 font-sans">{opt.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Completion ring ───────────────────────────────────────────────────────
function CompletionRing({ pct }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#e11d48" : "#a88c65";
  return (
    <div className="flex items-center gap-3">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#f2ece5" strokeWidth="5"/>
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * circ} ${circ}`}
                transform="rotate(-90 28 28)"
                style={{ transition: "stroke-dasharray 0.6s ease-out" }}/>
        <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="700"
              fill={color} fontFamily="DM Sans, sans-serif">
          {pct}%
        </text>
      </svg>
      <div>
        <div className="text-sm font-bold font-sans text-nude-800">
          Profile {pct < 40 ? "just started" : pct < 80 ? "coming together" : "complete!"}
        </div>
        <div className="text-xs text-nude-400 font-sans">
          {pct < 100 ? "More detail = better results" : "Your profile is fully personalised ✦"}
        </div>
      </div>
    </div>
  );
}

// ── Concern-to-makeup advice ──────────────────────────────────────────────
function ConcernAdvice({ concerns = [] }) {
  const tips = {
    acne:             "Use non-comedogenic products and avoid heavy powder over active spots — it can emphasise texture.",
    dark_circles:     "A peach or salmon colour corrector under concealer neutralises blue-grey shadows most effectively.",
    hyperpigmentation:"A colour corrector matched to the spot type (orange for deep spots, green for redness) before foundation minimises the need for heavy coverage.",
    redness:          "A green-tinted primer or CC cream neutralises redness before any base. Avoid heavy powder which can look blotchy.",
    large_pores:      "A silicone-based pore primer fills and smooths before foundation. Avoid heavy liquid foundations which can settle into pores.",
    fine_lines:       "Avoid baking or heavy setting powder — it settles into lines. A setting spray instead of powder keeps makeup looking fresh.",
    eczema:           "Stick to fragrance-free, hypoallergenic formulas. Patch-test any new product before full-face use.",
    dry_patches:      "Prep flaky areas with a hydrating serum and let it fully absorb before base. Avoid powder directly over dry patches.",
    oiliness:         "A mattifying primer on the T-zone, powder foundation, and a setting spray with alcohol extend wear dramatically.",
    dullness:         "A luminous or dewy primer adds radiance before foundation. A strategic highlighter on cheekbones and inner corners lifts a dull complexion.",
  };

  const relevant = concerns.filter(c => tips[c]);
  if (!relevant.length) return null;

  return (
    <div className="mt-4 p-4 bg-nude-50 border border-nude-100 rounded-xl">
      <p className="text-xs font-bold text-nude-600 uppercase tracking-wide mb-3 font-sans">
        ✦ Personalised tips for your concerns
      </p>
      <ul className="space-y-2">
        {relevant.map(id => {
          const concern = SKIN_CONCERNS.find(c => c.id === id);
          return (
            <li key={id} className="flex items-start gap-2">
              <span className="text-base shrink-0">{concern?.icon}</span>
              <p className="text-xs text-nude-600 font-sans leading-relaxed">{tips[id]}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Eye colour → shadow advice ────────────────────────────────────────────
function EyeColourAdvice({ eyeColour }) {
  const advice = {
    brown:      "Almost every shadow colour flatters brown eyes. Purple, copper, and teal make them appear more vibrant.",
    dark_brown: "Gold, bronze, and earthy terracotta warm up dark brown eyes beautifully. Navy and deep plum create contrast.",
    hazel:      "Hazel eyes shift colour based on shadow. Purple pulls out green tones; olive/khaki intensifies the brown; coral enhances both.",
    green:      "Reddish, copper, and burgundy tones are complementary to green. Avoid heavy green shadows — they mute the iris.",
    blue:       "Warm tones (bronze, copper, terracotta, orange-brown) contrast with blue eyes and make them pop. Avoid blue on blue.",
    grey:       "Grey eyes are chameleon-like. Purple, lilac, and mauve deepen them. Pink brightens. Charcoal intensifies.",
    amber:      "Deep purples, navy, and forest green complement amber's warmth. Avoid orange shadows — they blend into the iris.",
  };
  if (!eyeColour || !advice[eyeColour]) return null;
  const eye = EYE_COLOURS.find(e => e.id === eyeColour);
  return (
    <div className="mt-4 p-4 rounded-xl border border-nude-100 bg-white flex gap-3 items-start">
      <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" fill="white" stroke="#e3d5c5" strokeWidth="1"/>
        <circle cx="12" cy="12" r="7" fill={eye?.hex || "#6b3a2a"}/>
        <circle cx="12" cy="12" r="4" fill="#1a0a00"/>
        <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.9"/>
      </svg>
      <p className="text-xs text-nude-600 font-sans leading-relaxed">{advice[eyeColour]}</p>
    </div>
  );
}

// ── Hair → brow advice ────────────────────────────────────────────────────
function HairBrowAdvice({ hairColour }) {
  const advice = {
    black:        "Use a dark brown or soft black brow product — pure black can look harsh. A micro-blade pencil gives the most natural result.",
    dark_brown:   "A dark or medium taupe brow shade 1–2 tones lighter than your hair creates defined but natural brows.",
    medium_brown: "A medium taupe or soft brown is your most flattering brow shade. Avoid going too dark, which looks drawn-on.",
    light_brown:  "A light taupe or ash-brown pencil builds natural density. A clear brow gel alone can be enough for a clean look.",
    dirty_blonde: "A light taupe or blonde brow pencil — never go darker than medium taupe. A clear soap brow gel works beautifully.",
    blonde:       "A blonde or ash-blonde brow product keeps the face balanced. Avoid brown — it creates a disconnected look.",
    platinum:     "A very light blonde or taupe brow product. Consider tinted brow gel for a soft, effortless result.",
    red:          "A warm auburn or light brown brow shade that matches the warmth of your hair. Avoid cool greys.",
    auburn:       "A warm medium brown or auburn brow pencil mirrors your hair's warmth perfectly.",
    grey:         "A soft grey, taupe, or greige brow product blends with grey hair naturally. Avoid warm browns.",
    coloured:     "Match brow intensity to your natural root colour rather than your dyed shade for the most cohesive look.",
  };
  if (!hairColour || !advice[hairColour]) return null;
  return (
    <div className="mt-4 p-4 rounded-xl border border-nude-100 bg-white">
      <p className="text-xs font-bold text-nude-600 uppercase tracking-wide mb-1.5 font-sans">Brow tip</p>
      <p className="text-xs text-nude-600 font-sans leading-relaxed">{advice[hairColour]}</p>
    </div>
  );
}

// ── Glasses advice ────────────────────────────────────────────────────────
function GlassesAdvice({ wearsGlasses }) {
  if (!wearsGlasses) return null;
  return (
    <div className="mt-4 p-4 bg-mauve-50 border border-mauve-200 rounded-xl">
      <p className="text-xs font-bold text-mauve-700 uppercase tracking-wide mb-2 font-sans">Glasses makeup tips</p>
      <ul className="space-y-1.5">
        {[
          "Lenses magnify — so precise liner and blended shadow matter more than intensity.",
          "Avoid undereye concealer that is too bright — magnified lenses emphasise any colour mismatch.",
          "Define brows clearly; frames draw the eye upward so brows become a focal point.",
          "Use waterproof mascara — lenses trap heat and cause smudging faster.",
          "Frames add structure, so a minimal base and a bold lip balances the face beautifully.",
        ].map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-mauve-700 font-sans">
            <span className="text-mauve-400 shrink-0 mt-0.5">✦</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main ProfilePage ──────────────────────────────────────────────────────
export default function ProfilePage() {
  const { profile, updateProfile, hydrated } = useApp();
  const [local, setLocal] = useState({
    skinConcerns: [],
    wearsGlasses: false,
    ...profile,
  });
  const [saved,    setSaved]    = useState(false);
  const [activeTab, setActiveTab] = useState("skin"); // skin | features | concerns

  // Sync when profile loads from storage
  useEffect(() => {
    if (hydrated) {
      setLocal({ skinConcerns: [], wearsGlasses: false, ...profile });
    }
  }, [hydrated]);

  function set(field, value) {
    setLocal(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    updateProfile(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const completion = calcCompletion(local);

  const TABS = [
    { id: "skin",     label: "Skin",     emoji: "✦" },
    { id: "features", label: "Features", emoji: "👁" },
    { id: "concerns", label: "Concerns", emoji: "🌸" },
  ];

  if (!hydrated) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="page-title">Skin Profile</h1>
          <p className="page-subtitle">
            Personalises your generated looks, harmony tips, and diagnoses.
          </p>
        </div>
        <CompletionRing pct={completion} />
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <div className="flex gap-0 border-b border-nude-100 mb-7">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium font-sans
                        cursor-pointer border-none bg-transparent border-b-2 transition-all
              ${activeTab === tab.id
                ? "border-rose-400 text-rose-600"
                : "border-transparent text-nude-500 hover:text-nude-700"
              }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB: SKIN
      ════════════════════════════════════════════════════════════ */}
      {activeTab === "skin" && (
        <div className="flex flex-col gap-8">

          {/* Skin Tone */}
          <SectionBlock title="Skin Tone">
            <div className="flex flex-wrap gap-3">
              {SKIN_TONES.map(tone => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => set("skinTone", tone.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-2.5
                              cursor-pointer transition-all duration-150 border bg-white
                    ${local.skinTone === tone.id
                      ? "border-rose-400 shadow-sm"
                      : "border-nude-100 hover:border-rose-200"}`}
                >
                  <div className="w-9 h-9 rounded-full border border-black/10 shadow-sm"
                       style={{ background: tone.hex }}/>
                  <span className={`text-[11px] whitespace-nowrap font-sans
                    ${local.skinTone === tone.id ? "text-rose-600 font-bold" : "text-nude-500"}`}>
                    {tone.label}
                  </span>
                </button>
              ))}
            </div>
          </SectionBlock>

          {/* Undertone */}
          <SectionBlock title="Undertone">
            <div className="flex flex-wrap gap-3">
              {UNDERTONES.map(ut => (
                <button
                  key={ut.id}
                  type="button"
                  onClick={() => set("undertone", ut.id)}
                  className={`text-left rounded-2xl px-4 py-3 cursor-pointer
                              transition-all duration-150 border bg-white min-w-[130px]
                    ${local.undertone === ut.id
                      ? "border-rose-300 bg-rose-50"
                      : "border-nude-100 hover:border-rose-200"}`}
                >
                  <div className={`text-sm font-bold font-sans mb-0.5
                    ${local.undertone === ut.id ? "text-rose-600" : "text-nude-700"}`}>
                    {ut.id}
                  </div>
                  <div className="text-xs text-nude-400 font-sans">{ut.desc}</div>
                </button>
              ))}
            </div>
            <UndertoneTest />
          </SectionBlock>

          {/* Skin Type */}
          <SectionBlock title="Skin Type">
            <div className="flex flex-wrap gap-2">
              {SKIN_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set("skinType", type)}
                  className={`rounded-full px-4 py-2 text-sm cursor-pointer
                              transition-all duration-150 border font-sans font-medium
                    ${local.skinType === type
                      ? "bg-rose-50 border-rose-300 text-rose-600"
                      : "bg-white border-nude-100 text-nude-600 hover:border-rose-200"}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </SectionBlock>

          {/* Face Shape */}
          <SectionBlock title="Face Shape" badge="optional">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {FACE_SHAPES.map(shape => (
                <FaceShapeButton
                  key={shape.id}
                  shape={shape}
                  isActive={local.faceShape === shape.id}
                  onClick={() => set("faceShape", shape.id)}
                />
              ))}
            </div>
          </SectionBlock>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB: FEATURES
      ════════════════════════════════════════════════════════════ */}
      {activeTab === "features" && (
        <div className="flex flex-col gap-8">

          {/* Eye Colour */}
          <SectionBlock title="Eye Colour">
            <EyeColourPicker value={local.eyeColour} onChange={v => set("eyeColour", v)} />
            <EyeColourAdvice eyeColour={local.eyeColour} />
          </SectionBlock>

          {/* Hair Colour */}
          <SectionBlock title="Hair Colour">
            <HairColourPicker value={local.hairColour} onChange={v => set("hairColour", v)} />
            <HairBrowAdvice hairColour={local.hairColour} />
          </SectionBlock>

          {/* Glasses */}
          <SectionBlock title="Glasses">
            <GlassesToggle value={local.wearsGlasses} onChange={v => set("wearsGlasses", v)} />
            <GlassesAdvice wearsGlasses={local.wearsGlasses} />
          </SectionBlock>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB: CONCERNS
      ════════════════════════════════════════════════════════════ */}
      {activeTab === "concerns" && (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-nude-500 font-sans -mt-2 leading-relaxed">
            Select all that apply. Your concerns shape the tips and product recommendations
            in your generated looks and Fix My Makeup diagnoses.
          </p>
          <SkinConcernGrid
            value={local.skinConcerns || []}
            onChange={v => set("skinConcerns", v)}
          />
          <ConcernAdvice concerns={local.skinConcerns || []} />
        </div>
      )}

      {/* ── Save button ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mt-10 pt-6 border-t border-nude-100">
        <ButtonPrimary onClick={handleSave}>Save Profile</ButtonPrimary>
        {saved && (
          <span className="text-sm text-rose-500 font-medium font-sans animate-pulse">
            ✓ Profile saved
          </span>
        )}
        <span className="ml-auto text-xs text-nude-400 font-sans">
          {completion}% complete
        </span>
      </div>
    </div>
  );
}
