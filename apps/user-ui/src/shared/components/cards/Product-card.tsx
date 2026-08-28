"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Eye, Heart, ShoppingCart, Star, Truck } from "lucide-react";
import ProductDetailsCard from "./Product-details-card";
import { useStore } from "apps/user-ui/src/store";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";

interface ProductCardProps {
  product: any;
  isEvent?: boolean;
  className?: string;
}

const ProductCard = ({ product, isEvent = false, className = "" }: ProductCardProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);

  const isWishlisted = wishlist.some((item: any) => item.id === product.id);
  const isInCart = cart.some((item: any) => item.id === product.id);

  const discount =
    product.regular_price && product.sale_price
      ? Math.round((1 - product.sale_price / product.regular_price) * 100)
      : null;

  const tag = isEvent ? "OFFER" : product.tag || null;
  const isChoice = product.isChoice || false;
  const freeShipping = product.freeShipping || false;

  useEffect(() => {
    if (isEvent && product?.ending_date) {
      const interval = setInterval(() => {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft("Expired");
          clearInterval(interval);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m left`);
      }, 1000);

      return () => clearInterval(interval);
    }
    return ;
  }, [isEvent, product?.ending_date]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id, user, location, deviceInfo);
    } else {
      addToWishlist({ ...product, quantity: 1 }, user, location, deviceInfo);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInCart) {
      addToCart({ ...product, quantity: 1 }, user, location, deviceInfo);
    }
  };

  return (
    <>
      <article
        className={`card-hover group flex flex-col overflow-hidden rounded-lg border border-border bg-card ${className}`}
      >
        <Link
          href={`/product/${product?.slug}`}
          className="relative block bg-secondary"
        >
          <Image
            src={product?.images?.[0]?.url || "https://ik.imagekit.io/amark97/products/product-1784307296585_79hubvSRb.jpg?updatedAt=1784307298543"}
            alt={product?.title || "Product image"}
            width={1024}
            height={1024}
            loading="lazy"
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {tag && (
            <span className="deal-gradient absolute left-0 top-2 rounded-r-full px-2.5 py-1 text-[11px] font-bold text-deal-foreground">
              {tag}
            </span>
          )}

          {isChoice && (
            <span className="absolute bottom-2 left-2 rounded-sm bg-choice px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-choice-foreground">
              Choice
            </span>
          )}

          {product?.stock <= 5 && product?.stock > 0 && (
            <span className="absolute bottom-2 right-2 rounded-sm bg-yellow-400 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-700">
              Limited Stock
            </span>
          )}

          <button
            type="button"
            onClick={toggleWishlist}
            className="absolute right-2 top-2 rounded-full bg-white p-1.5 shadow-md transition hover:scale-110"
            aria-label="Toggle wishlist"
          >
            <Heart
              size={20}
              fill={isWishlisted ? "red" : "transparent"}
              stroke={isWishlisted ? "red" : "#4B5563"}
            />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPreviewOpen(true);
            }}
            className="absolute inset-x-2 bottom-2 hidden items-center justify-center gap-1.5 rounded-full bg-white/65 py-2 text-xs font-bold shadow-[var(--shadow-card)] transition-opacity group-hover:flex md:flex md:opacity-0 md:group-hover:opacity-100"
          >
            <Eye className="size-3.5" /> Preview
          </button>
        </Link>

        <div className="flex flex-1 flex-col p-3">
          <Link
            href={`/product/${product?.slug}`}
            className="clamp-2 text-sm leading-snug hover:text-accent"
          >
            {product?.title}
          </Link>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-deal">
              ${product?.sale_price?.toFixed(2)}
            </span>
            {product?.regular_price && (
              <span className="text-xs text-muted-foreground line-through">
                ${product?.regular_price?.toFixed(2)}
              </span>
            )}
            {discount !== null && discount > 0 && (
              <span className="text-xs font-bold text-deal">-{discount}%</span>
            )}
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5 font-semibold text-foreground">
              <Star className="size-3 fill-star text-star" />
              {product?.ratings || 0}
            </span>
            <span>·</span>
            <span>{product?.totalSales || 0} sold</span>
          </div>

          {freeShipping && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <Truck className="size-3.5" /> Free shipping
            </p>
          )}

          <Link
            href={`/shop/${product?.Shop?.id}`}
            className="mt-2 truncate text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            {product?.Shop?.name}
          </Link>

          {isEvent && timeLeft && (
            <div className="mt-2">
              <span className="inline-block rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-400">
                {timeLeft}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`mt-2.5 flex items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-bold transition-colors ${
              isInCart
                ? "cursor-not-allowed border-muted-foreground/30 text-muted-foreground/50"
                : "border-accent text-accent hover:bg-accent/10"
            }`}
          >
            <ShoppingCart className="size-3.5" />
            {isInCart ? "In Cart" : "Add to cart"}
          </button>
        </div>
      </article>

      {/* Modal rendered outside the card, fixed over the viewport */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <ProductDetailsCard data={product} setOpen={setPreviewOpen} />
        </div>
      )}
    </>
  );
};

export default ProductCard;