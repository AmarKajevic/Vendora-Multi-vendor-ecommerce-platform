"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Star,
  BadgeCheck,
  MapPin,
  Users,
  Package,
  ShieldCheck,
  MessageCircle,
  Heart,
  Loader2,
} from "lucide-react";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";



type Product = {
  id: string;
  title: string;
  slug?: string;
  images: { url: string }[] | string[];
  sale_price?: number;
  regular_price?: number;
  ratings?: number;
  totalSales?: number;
};

// ----- Fetch shop by ID (temporary via filter) -----
const fetchShopById = async (id: string) => {
  // Temporary solution: fetch all shops then filter
  // Recommend to create endpoint /shop/api/get-shop/:id
  const res = await axiosInstance.get(`/product/api/get-filtered-shops?limit=100`);
  const shops = res.data.shops || [];
  const shop = shops.find((s: any) => s.id === id);
  if (!shop) throw new Error("Shop not found");
  return shop;
};

// ----- Fetch products for this shop -----
const fetchShopProducts = async (shopId: string) => {
  const res = await axiosInstance.get(`/product/api/get-shop-products?shopId=${shopId}`);
  return res.data.products || [];
};

// ----- Fetch top shops (for "Other top stores") -----
const fetchTopStores = async () => {
  const res = await axiosInstance.get(`/product/api/top-shops`);
  return res.data.shops || [];
};

// ----- Main component -----
export default function StorePage() {
  const params = useParams();
  const storeId = params.storeId as string;

  // 1. Fetch shop data
  const {
    data: shop,
    isLoading: shopLoading,
    isError: shopError,
    error: shopErrorObj,
  } = useQuery({
    queryKey: ["shop", storeId],
    queryFn: () => fetchShopById(storeId),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // 2. Fetch shop products
  const {
    data: products = [],
    isLoading: productsLoading,
  } = useQuery({
    queryKey: ["shop-products", storeId],
    queryFn: () => fetchShopProducts(storeId),
    staleTime: 1000 * 60 * 5,
    enabled: !!storeId,
    retry: 2,
  });

  // 3. Fetch top shops (for "Other top stores")
  const {
    data: topStores = [],
    isLoading: topStoresLoading,
  } = useQuery({
    queryKey: ["top-stores"],
    queryFn: fetchTopStores,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // Filter out the current store
  const otherStores = topStores
    .filter((s: any) => s.id !== storeId)
    .slice(0, 4);

  // Loading state
  if (shopLoading || productsLoading || topStoresLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent" />
        <span className="ml-3 text-muted-foreground">Loading store...</span>
      </div>
    );
  }

  // Error state
  if (shopError || !shop) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-extrabold text-destructive">Store not found</h1>
          <p className="mt-2 text-muted-foreground">
            {shopErrorObj?.message || "An error occurred while loading."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-accent px-6 py-2.5 font-bold text-accent-foreground"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // ----- Helper functions for display -----
  const getLogo = () => {
    if (shop.avatar?.url) {
      return (
        <img
          src={shop.avatar.url}
          alt={shop.name}
          className="size-full object-cover rounded-2xl"
        />
      );
    }
    return <span className="text-2xl font-extrabold">{shop.name.charAt(0)}</span>;
  };

  const getLocation = (address: string) => {
    const parts = address.split(",").map((s) => s.trim());
    return parts.length > 1 ? parts[parts.length - 1] : address;
  };

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const first = product.images[0];
      if (typeof first === "string") return first;
      if (first?.url) return first.url;
    }
    return "/placeholder.png";
  };

  const getProductPrice = (product: Product) => {
    return product.sale_price ?? product.regular_price ?? "N/A";
  };

  // ----- UI -----
  return (
    <div className="min-h-screen bg-surface">
      <main>
        {/* Banner */}
        <section className="relative h-52 overflow-hidden bg-secondary lg:h-72">
          <img
            src={shop.coverBanner || "/placeholder-banner.jpg"}
            alt={`${shop.name} store banner`}
            width={1920}
            height={640}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </section>

        <div className="mx-auto max-w-[1500px] px-4 mt-10 lg:px-8 ">
          {/* Store info card */}
          <div className="-mt-16 rounded-xl border border-border bg-card p-5 shadow-sm lg:p-6">
            <div className="flex flex-wrap items-start gap-5">
              {/* Logo / Avatar */}
              <div className="grid size-20 place-items-center rounded-2xl bg-accent text-2xl font-extrabold text-accent-foreground shadow-lg overflow-hidden">
                {getLogo()}
              </div>

              {/* Name and details */}
              <div className="min-w-[220px] flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold lg:text-3xl">{shop.name}</h1>
                  {shop.sellers && (
                    <BadgeCheck className="size-5 text-accent" aria-label="Verified store" />
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Star className="size-4 fill-star text-star" /> {shop.ratings?.toFixed(1) || "N/A"} rating
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" /> {getLocation(shop.address)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-4" /> {shop.followers || 0} followers
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="size-4" /> {products.length} products
                  </span>
                </div>
                {shop.ratings && shop.ratings >= 4.5 && (
                  <span className="mt-3 inline-block rounded-full bg-deal/10 px-2.5 py-1 text-xs font-bold text-deal">
                    Top Rated Seller
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground">
                  <Heart className="size-4" /> Follow store
                </button>
                <button className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-bold hover:bg-secondary">
                  <MessageCircle className="size-4" /> Message
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
              {[
                ["On-time delivery", "98.4%"],
                ["Positive feedback", "96.7%"],
                ["Response rate", "< 12 hours"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-secondary px-4 py-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-extrabold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="mt-6 flex gap-6 overflow-x-auto border-b border-border text-sm font-semibold">
            {["All products", "New arrivals", "Best sellers", "Deals", "About"].map((t, i) => (
              <span
                key={t}
                className={`whitespace-nowrap border-b-2 pb-3 ${
                  i === 0 ? "border-accent text-accent" : "border-transparent text-muted-foreground"
                }`}
              >
                {t}
              </span>
            ))}
          </nav>

          {/* Products grid */}
          <section className="py-8">
            <h2 className="text-lg font-extrabold lg:text-xl">Products from this store</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {products.length === 0 ? (
                <p className="col-span-full text-muted-foreground">No products available.</p>
              ) : (
                products.slice(0, 12).map((product: Product) => {
                  const imageUrl = getProductImage(product);
                  const price = getProductPrice(product);
                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug || product.id}`}
                      className="group rounded-xl border border-border bg-card p-3 hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-square w-full overflow-hidden rounded-lg bg-secondary">
                        <img
                          src={imageUrl}
                          alt={product.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <h3 className="mt-2 line-clamp-2 text-sm font-semibold">{product.title}</h3>
                      <p className="mt-1 text-sm font-bold text-accent">
                        {typeof price === "number" ? `${price} RSD` : price}
                      </p>
                    </Link>
                  );
                })
              )}
            </div>
          </section>

          {/* Buyer protection */}
          <section className="pb-12">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="flex items-center gap-2 text-base font-extrabold">
                <ShieldCheck className="size-5 text-accent" /> Buyer protection
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Every order from {shop.name} is covered by our buyer protection: secure payments,
                full refunds for items not as described, and 90‑day free returns on eligible products.
              </p>
            </div>
          </section>

          {/* Other top stores */}
          <section className="pb-16">
            <h2 className="text-lg font-extrabold lg:text-xl">Other top stores</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {otherStores.length === 0 ? (
                <p className="col-span-full text-muted-foreground">No other stores available.</p>
              ) : (
                otherStores.map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/store/${s.id}`}
                    className="card-hover flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="grid size-12 place-items-center rounded-xl bg-accent font-extrabold text-accent-foreground overflow-hidden">
                      {s.avatar?.url ? (
                        <img src={s.avatar.url} alt={s.name} className="size-full object-cover" />
                      ) : (
                        s.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.ratings?.toFixed(1) || "N/A"} ★ · {s.products?.length || 0} products
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}