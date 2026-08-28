"use client";

import React from "react";
import Link from "next/link";
import ProductCard from "../cards/Product-card";


interface PromoGridProps {
  products: any[];
  title?: string;
  subtitle?: string;
  viewMoreLink?: string;
  promoImage?: string;
}

export function PromoGrid({
  products,
  title = "Best sellers this week",
  subtitle = "Top-selling items across all vendor stores",
  viewMoreLink = "/products",
  promoImage = "https://ik.imagekit.io/amark97/products/promo-tall.jpg", // Zameni sa svojom slikom
}: PromoGridProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1500px] px-4 pb-8 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[500px_1fr]">
        {/* Leva kolona – promo banner */}
        <aside className="relative overflow-hidden rounded-xl bg-ink">
          <img
            src={promoImage}
            alt="Coupon promotion with gift boxes and a shopping cart"
            width={1024}
            height={1536}
            loading="lazy"
            className="h-full min-h-[300px] w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/80 to-transparent p-6">
            <p className="eyebrow text-ink-foreground/80">Coupon center</p>
            <h2 className="mt-2 text-2xl font-extrabold leading-tight text-ink-foreground">
              Collect coupons,
              <br /> stack the savings
            </h2>
            <p className="mt-2 text-sm text-ink-foreground/70">
              Store coupons + platform coupons apply to the same order.
            </p>
            <a
              href="#"
              className="mt-4 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground"
            >
              Get coupons
            </a>
          </div>
        </aside>

        {/* Desna kolona – proizvodi */}
        <div className="rounded-xl border border-border bg-card p-4 lg:p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold lg:text-2xl">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <Link
              href={viewMoreLink}
              className="shrink-0 text-sm font-semibold text-accent hover:underline"
            >
              See all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {products.slice(0, 6).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}