"use client";

import { PAGES } from "@/lib/routes";

export default function ArticleView({ article, onBack, setPage }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-nude-400 hover:text-rose-500
                   bg-transparent border-none cursor-pointer mb-6 transition-colors"
      >
        ← Back to Learn
      </button>

      {/* Header */}
      <div className="mb-8">
        <span className="pill pill-rose inline-block mb-3">{article.readTime} read</span>
        <h1 className="font-serif text-3xl text-nude-800 leading-tight mb-2">
          {article.title}
        </h1>
        <p className="text-nude-400 text-base leading-relaxed">{article.preview}</p>
      </div>

      {/* Body */}
      <article className="prose-custom">
        {article.sections.map((section, i) => (
          <section key={i} className="mb-8">
            <h2 className="font-serif text-xl text-nude-800 mb-3 leading-snug">
              {section.heading}
            </h2>
            <p className="text-nude-600 text-[15px] leading-relaxed">{section.body}</p>
          </section>
        ))}
      </article>

      {/* CTA */}
      <div
        className="mt-10 rounded-xl px-5 py-4 border border-rose-100"
        style={{ background: "#fff1f2" }}
      >
        <p className="text-sm text-rose-700">
          ✨ Ready to apply this?{" "}
          <button
            onClick={() => setPage(PAGES.GENERATE)}
            className="font-bold underline cursor-pointer bg-transparent border-none
                       text-rose-600 text-sm"
          >
            Generate a look using your products →
          </button>
        </p>
      </div>
    </div>
  );
}
