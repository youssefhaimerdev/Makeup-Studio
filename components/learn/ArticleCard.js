"use client";

export default function ArticleCard({ article, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-nude-100 rounded-2xl p-6 cursor-pointer
                 hover:border-rose-200 hover:-translate-y-0.5 hover:shadow-sm
                 transition-all duration-200"
    >
      <span className="pill pill-rose inline-block mb-3">{article.readTime} read</span>
      <h3 className="font-serif text-lg text-nude-800 leading-snug mb-2">
        {article.title}
      </h3>
      <p className="text-sm text-nude-400 leading-relaxed mb-4">{article.preview}</p>
      <span className="text-sm text-rose-600 font-semibold">Read article →</span>
    </div>
  );
}
