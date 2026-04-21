"use client";

export default function DiagnosisResult({ result }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Diagnosis card */}
      <div
        className="rounded-2xl p-5 border border-rose-200"
        style={{ background: "linear-gradient(135deg, #fff1f2, #fdf4f0)" }}
      >
        <div className="flex gap-3 items-start mb-2">
          <span className="text-xl">🔍</span>
          <h3 className="font-serif text-lg text-nude-800">Diagnosis</h3>
        </div>
        <p className="text-sm text-nude-600 leading-relaxed">{result.diagnosis}</p>
      </div>

      {/* Steps */}
      <div className="bg-white border border-nude-100 rounded-2xl p-5">
        <h3 className="font-serif text-lg text-nude-800 mb-4">Correction Steps</h3>
        <ol className="flex flex-col gap-3">
          {result.steps.map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold
                              flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-nude-600 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Profile tip */}
      {result.profileNote && (
        <div className="rounded-xl px-4 py-3 border border-mauve-200 bg-mauve-50/50">
          <p className="text-sm text-mauve-800">
            <span className="font-semibold">Your profile:</span> {result.profileNote}
          </p>
        </div>
      )}

      {/* Pro tip */}
      {result.tip && (
        <div className="rounded-xl px-4 py-3 border border-nude-200 bg-nude-50">
          <p className="text-sm text-nude-700">
            <span className="font-semibold">💡 Pro tip:</span> {result.tip}
          </p>
        </div>
      )}

      {/* Relevant products */}
      {result.products.length > 0 && (
        <div className="bg-white border border-nude-100 rounded-xl p-5">
          <h4 className="text-sm font-bold text-nude-700 mb-3">
            Relevant products from your stash
          </h4>
          <ul className="flex flex-col gap-2">
            {result.products.map((p, i) => (
              <li
                key={i}
                className="text-sm text-nude-600 py-2 border-b border-nude-50 last:border-0"
              >
                <span className="font-semibold">{p.category}</span>
                {p.brand && ` · ${p.brand}`}
                {p.shade && ` — ${p.shade}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
