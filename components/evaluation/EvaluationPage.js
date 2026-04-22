"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/lib/AppContext";
import { prepareImage, analyzeImage } from "@/lib/makeupAnalysis";
import { detectLandmarks }            from "@/lib/faceMesh";
import { loadEvaluations, saveEvaluation } from "@/lib/evaluationStorage";
import { loadFromStorage }             from "@/lib/storage";

import AIUpload         from "./AIUpload";
import AnalysisProgress from "./AnalysisProgress";
import ScoreCircle      from "./ScoreCircle";
import ScoreBreakdown   from "./ScoreBreakdown";
import SuggestionCards  from "./SuggestionCards";
import EvaluationHistory from "./EvaluationHistory";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/Button";

const LOOK_KEY = "mis_last_look";

// ── Status machine ─────────────────────────────────────────────────────────
const STATUS = {
  IDLE:      "idle",
  READY:     "ready",      // image chosen, not yet analysed
  LOADING:   "loading",    // FaceMesh + analysis running
  DONE:      "done",       // results ready
  ERROR:     "error",
  NO_FACE:   "no_face",
};

export default function EvaluationPage() {
  const { profile, inventory, hydrated } = useApp();

  const [status,      setStatus]      = useState(STATUS.IDLE);
  const [imageFile,   setImageFile]   = useState(null);
  const [stage,       setStage]       = useState(0);
  const [result,      setResult]      = useState(null);
  const [errorMsg,    setErrorMsg]    = useState("");
  const [evaluations, setEvaluations] = useState([]);
  const [look,        setLook]        = useState(null);
  const [viewingPast, setViewingPast] = useState(null);

  // Restore saved evaluations and last generated look
  useEffect(() => {
    if (!hydrated) return;
    setEvaluations(loadEvaluations());
    const saved = loadFromStorage(LOOK_KEY, null);
    if (saved) setLook(saved);
  }, [hydrated]);

  const handleImageReady = useCallback((file) => {
    setImageFile(file);
    setStatus(STATUS.READY);
    setResult(null);
    setViewingPast(null);
  }, []);

  async function runAnalysis() {
    if (!imageFile) return;
    setStatus(STATUS.LOADING);
    setStage(1);
    setErrorMsg("");

    try {
      // Step 1 — compress image
      setStage(1);
      const { canvas } = await prepareImage(imageFile, 640);

      // Step 2 — load FaceMesh + detect landmarks
      setStage(2);
      const landmarks = await detectLandmarks(canvas);

      if (!landmarks || landmarks.length < 100) {
        setStatus(STATUS.NO_FACE);
        return;
      }

      // Step 3 — pixel analysis
      setStage(3);
      // Small yield to keep UI responsive
      await new Promise((r) => setTimeout(r, 100));

      // Step 4 — score
      setStage(4);
      const evaluation = analyzeImage(canvas, landmarks, profile, look);

      // Step 5 — persist and display
      setStage(5);
      await new Promise((r) => setTimeout(r, 400));

      const updated = saveEvaluation(evaluation);
      setEvaluations(updated);
      setResult(evaluation);
      setStatus(STATUS.DONE);
      setStage(0);

    } catch (err) {
      console.error("Analysis error:", err);
      setErrorMsg(err.message || "Analysis failed. Please try a clearer photo.");
      setStatus(STATUS.ERROR);
      setStage(0);
    }
  }

  function reset() {
    setImageFile(null);
    setResult(null);
    setStatus(STATUS.IDLE);
    setViewingPast(null);
    setErrorMsg("");
  }

  const displayed = viewingPast || result;
  const isLoading = status === STATUS.LOADING;

  if (!hydrated) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-full px-3 py-1 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
          <span className="text-xs text-rose-600 font-semibold uppercase tracking-wide">AI Feature</span>
        </div>
        <h1 className="font-serif text-3xl text-nude-800 mb-1">AI Makeup Evaluation</h1>
        <p className="text-nude-500 text-sm leading-relaxed">
          Upload a selfie after applying your makeup. The AI analyses your face using{" "}
          <strong className="font-semibold text-nude-700">MediaPipe FaceMesh</strong> — 468 facial landmarks —
          then scores each zone and gives you specific improvement tips.
        </p>
      </div>

      {/* ── Context banner (look + profile) ───────────────────────────── */}
      {(look || profile?.skinTone) && !displayed && !isLoading && (
        <div className="bg-nude-50 border border-nude-100 rounded-xl px-4 py-3 mb-6 flex flex-wrap gap-3">
          {look?.occasion && (
            <span className="text-xs text-nude-600">
              🎨 <strong>Look:</strong> {look.occasion} · {look.intensity?.label}
            </span>
          )}
          {profile?.skinTone && (
            <span className="text-xs text-nude-600">
              ✦ <strong>Profile:</strong> {profile.skinTone} · {profile.undertone} undertone
            </span>
          )}
          {!look && (
            <span className="text-xs text-nude-400 italic">
              Tip: Generate a look first for profile-matched feedback
            </span>
          )}
        </div>
      )}

      {/* ── Main panel ─────────────────────────────────────────────────── */}
      {!displayed && !isLoading && (
        <div className="bg-white border border-nude-100 rounded-2xl p-6 mb-6">
          <AIUpload onImageReady={handleImageReady} disabled={isLoading} />

          {status === STATUS.READY && (
            <div className="mt-5 flex gap-3 flex-wrap">
              <ButtonPrimary onClick={runAnalysis}>
                ✦ Analyse My Makeup
              </ButtonPrimary>
              <ButtonSecondary onClick={reset}>
                Clear
              </ButtonSecondary>
            </div>
          )}

          {status === STATUS.NO_FACE && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-100">
              <p className="text-sm text-rose-700 font-semibold mb-1">No face detected</p>
              <p className="text-sm text-rose-600">
                Make sure your face is clearly visible, well-lit, and centred. Try a front-facing photo in good natural light.
              </p>
            </div>
          )}

          {status === STATUS.ERROR && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-100">
              <p className="text-sm text-rose-700 font-semibold mb-1">Analysis failed</p>
              <p className="text-sm text-rose-500">{errorMsg}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Loading animation ──────────────────────────────────────────── */}
      {isLoading && <AnalysisProgress stage={stage} />}

      {/* ── Results ───────────────────────────────────────────────────── */}
      {displayed && !isLoading && (
        <div className="flex flex-col gap-5">
          {/* Past result notice */}
          {viewingPast && (
            <div className="flex items-center justify-between bg-nude-50 border border-nude-100 rounded-xl px-4 py-2.5">
              <span className="text-sm text-nude-500">
                Viewing past evaluation — {new Date(viewingPast.timestamp).toLocaleDateString()}
              </span>
              <ButtonSecondary onClick={() => setViewingPast(null)} className="!px-3 !py-1.5 !text-xs">
                Back
              </ButtonSecondary>
            </div>
          )}

          {/* Score header */}
          <div
            className="rounded-2xl p-6 border border-rose-200 flex flex-col sm:flex-row items-center gap-6"
            style={{ background: "linear-gradient(135deg, #fff1f2, #f8f2f7)" }}
          >
            <ScoreCircle score={displayed.overall} size={150} />
            <div className="text-center sm:text-left">
              <h2 className="font-serif text-xl text-nude-800 mb-1">
                {displayed.overall >= 80 ? "Impressive application!" :
                 displayed.overall >= 65 ? "Looking great!" :
                 displayed.overall >= 50 ? "Good start!" : "Room to grow!"}
              </h2>
              {displayed.look && (
                <p className="text-sm text-nude-500 mb-2">
                  Evaluated for: <strong>{displayed.look.occasion}</strong> · {displayed.look.intensity}
                </p>
              )}
              <p className="text-sm text-nude-400 leading-relaxed">
                Based on {Object.keys(displayed.subscores).length} makeup zones
                analysed with 468 facial landmark points.
              </p>
              <div className="mt-3 flex gap-2 flex-wrap justify-center sm:justify-start">
                <ButtonPrimary onClick={reset} className="!px-5 !py-2 !text-sm">
                  ↺ Evaluate Again
                </ButtonPrimary>
              </div>
            </div>
          </div>

          {/* Breakdown bars */}
          <ScoreBreakdown subscores={displayed.subscores} />

          {/* Suggestion cards */}
          <SuggestionCards suggestions={displayed.suggestions} />
        </div>
      )}

      {/* ── History ────────────────────────────────────────────────────── */}
      {evaluations.length > 0 && !isLoading && (
        <div className="mt-8">
          <EvaluationHistory
            evaluations={evaluations}
            onUpdate={setEvaluations}
            onSelect={(ev) => { setViewingPast(ev); setResult(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        </div>
      )}

      {/* ── Privacy note ──────────────────────────────────────────────── */}
      <div className="mt-8 text-center">
        <p className="text-xs text-nude-300 leading-relaxed">
          🔒 Your photo is processed entirely in your browser — it is never uploaded to any server.
          Analysis uses the MediaPipe FaceMesh model loaded from Google's CDN.
        </p>
      </div>
    </div>
  );
}
