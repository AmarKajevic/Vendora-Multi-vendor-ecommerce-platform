"use client";

import useLayout from "apps/user-ui/src/hooks/useLayout";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Ticket } from "lucide-react";

// Predlošci za sadržaj – možeš ih prilagoditi
const DEFAULT_SLIDES = [
  {
    eyebrow: "Starting from 40$",
    title: "The best watch\nCollection 2025",
    text: "Exclusive offer 10% this week",
    cta: "Shop Now",
    coupon: "WATCH10",
  },
  {
    eyebrow: "New Arrival",
    title: "Smart Tech\nfor Your Wrist",
    text: "Up to 30% off on all smartwatches",
    cta: "Explore",
    coupon: "SMART30",
  },
  {
    eyebrow: "Limited Edition",
    title: "Premium\nLuxury Watches",
    text: "Handcrafted with Swiss precision",
    cta: "Discover",
    coupon: "LUXURY20",
  },
];

const Hero = () => {
  const { layout } = useLayout();
  const banners = layout?.banner || []; // niz URL‑ova


  // Ako nema banner-a, koristi statičke (ili prikaži placeholder)
  const slides =
    banners.length > 0
      ? banners.map((url: string, i: number) => ({
          image: url,
          ...DEFAULT_SLIDES[i % DEFAULT_SLIDES.length], // rotiraj sadržaj
        }))
      : DEFAULT_SLIDES.map((s, i) => ({
          ...s,
          image: `https://ik.imagekit.io/amark97/products/product-1783550072790_ACHrvay2v.jpg?updatedAt=1783550076494`, // fallback
        }));

  const [index, setIndex] = useState(0);
  const go = useCallback(
    (n: number) => setIndex((n + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    const t = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5500
    );
    return () => clearInterval(t);
  }, [slides.length]);

  const current = slides[index]!;

  return (
    <section className="mx-auto max-w-[1430px] px-4 pt-4 lg:px-8">
      <div className="group relative h-[300px] overflow-hidden rounded-xl bg-ink sm:h-[360px] lg:h-[420px]">
        {slides.map((s:any, i:any) => (
          <img
            key={s.eyebrow + i}
            src={s.image}
            alt={s.title.replace("\n", " ")}
            width={1920}
            height={1080}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="relative flex h-full max-w-xl flex-col justify-center px-6 lg:px-12">
          <div
            key={index}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <p className="eyebrow text-ink-foreground/80">{current.eyebrow}</p>
            <h1 className="mt-3 whitespace-pre-line text-3xl font-extrabold leading-tight text-ink-foreground sm:text-4xl lg:text-5xl">
              {current.title}
            </h1>
            <p className="mt-3 max-w-sm text-sm text-ink-foreground/75 sm:text-base">
              {current.text}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#recommended"
                className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                {current.cta}
              </a>
              <span className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2.5 text-xs font-bold text-foreground">
                <Ticket className="size-4 text-deal" />
                {current.coupon}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => go(index - 1)}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={() => go(index + 1)}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <ChevronRight className="size-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((s:any, i:any) => (
            <button
              key={s.cta + i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-7 bg-accent" : "w-2 bg-background/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;