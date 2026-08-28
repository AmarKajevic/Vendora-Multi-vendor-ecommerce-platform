"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import ProductCard from "../cards/Product-card";


interface FeaturedSliderProps {
  products: any[];
  title?: string;
  viewMoreLink?: string;
}

export function FeaturedSlider({
  products,
  title = "Recommended for you",
  viewMoreLink = "/products",
}: FeaturedSliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (!products || products.length === 0) {
    return null; // ili prikaži placeholder
  }

  return (
    <section id="recommended" className="mx-auto max-w-[1500px] px-4 py-8 lg:px-8">
      <div className="rounded-xl border border-border bg-card p-4 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="size-6 text-deal" />
            <h2 className="text-xl font-extrabold lg:text-2xl">{title}</h2>
            <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground sm:inline">
              Based on top-rated vendors
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a href={viewMoreLink} className="text-sm font-semibold text-accent hover:underline">
              View more
            </a>
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div ref={ref} className="rail mt-5 flex gap-4 overflow-x-auto scroll-smooth">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              className="w-[46%] min-w-[160px] flex-shrink-0 sm:w-[210px]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}