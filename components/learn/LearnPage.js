"use client";

import { useState } from "react";
import { ARTICLES } from "@/lib/articles";
import ArticleCard from "./ArticleCard";
import ArticleView from "./ArticleView";

export default function LearnPage({ setPage }) {
  const [activeSlug, setActiveSlug] = useState(null);

  const activeArticle = ARTICLES.find((a) => a.slug === activeSlug);

  if (activeArticle) {
    return (
      <ArticleView
        article={activeArticle}
        onBack={() => setActiveSlug(null)}
        setPage={setPage}
      />
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Learn</h1>
      <p className="page-subtitle">
        Expert guides on technique, colour theory, and skin science — written for all levels.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ARTICLES.map((article) => (
          <ArticleCard
            key={article.slug}
            article={article}
            onClick={() => setActiveSlug(article.slug)}
          />
        ))}
      </div>
    </div>
  );
}
