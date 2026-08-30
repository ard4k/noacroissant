"use client";

import React, { useRef, useEffect } from "react";
import { Category } from "@/lib/types";
import { Language, translateCategory } from "@/lib/i18n/translations";

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  language?: Language;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelectCategory,
  language = "tr",
}: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll active tab into view
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector<HTMLElement>(
      `[data-category-id="${activeCategoryId}"]`
    );
    if (activeEl) {
      const container = scrollRef.current;
      const left =
        activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2;
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [activeCategoryId]);

  return (
    <nav
      aria-label="Menü Kategorileri"
      className="w-full bg-[#F8F1EB]/95 backdrop-blur-md py-3.5 border-b border-[#D1A37A]/25 shadow-2xs"
    >
      <div
        ref={scrollRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              data-category-id={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 px-5 py-2 noa-brand-pill ${
                isActive ? "active" : ""
              }`}
            >
              <span>{translateCategory(cat.name, language)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
