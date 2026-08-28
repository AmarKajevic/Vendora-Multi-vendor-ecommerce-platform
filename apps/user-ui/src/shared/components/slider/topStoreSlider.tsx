"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  BadgeCheck,
  MapPin,
  Users,
  Loader2,
} from "lucide-react";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";

// ----- Tipovi -----
type Shop = {
  id: string;
  name: string;
  coverBanner: string | null;
  avatar: { url: string } | null;
  address: string;
  ratings: number;
  followers: number | null;
  category: string;
  sellers?: string;
  products?: any[];
};

type ApiResponse = {
  shops: Shop[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
};

// ----- Komponenta za dohvatanje proizvoda po prodavnici -----
function ShopProducts({ shopId }: { shopId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["shop-products", shopId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/api/get-shop-products`, {
        params: { shopId }, // Ako endpoint očekuje shopId kao query param
      });
      return res.data.products || [];
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!shopId,
  });

  if (isLoading) {
    return (
      <div className="col-span-3 flex items-center justify-center py-4">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const products = data || [];
  const sampleProducts = products.slice(0, 3);

  if (sampleProducts.length === 0) {
    return (
      <div className="col-span-3 flex items-center justify-center py-4 text-xs text-muted-foreground">
        No Products
      </div>
    );
  }

  return (
    <>
      {sampleProducts.map((product: any, index:number) => (
        <div key={index} className="overflow-hidden rounded-lg border border-border bg-secondary">
          <img
            src={product.images?.[0]?.url || "/placeholder-product.jpg"}
            alt={product.title || "Product"}
            width={200}
            height={200}
            loading="lazy"
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ))}
    </>
  );
}

// ----- Glavna komponenta -----
export default function TopStores() {
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: ["filtered-shops", page, limit],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/product/api/get-filtered-shops?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const shops = data?.shops || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const scrollBy = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const getLogo = (shop: Shop) => {
    if (shop.avatar?.url) {
      return <img src={shop.avatar.url} alt={shop.name} className="size-full object-cover rounded-xl" />;
    }
    return <span className="text-lg font-extrabold">{shop.name.charAt(0)}</span>;
  };

  const getLocation = (address: string) => {
    const parts = address.split(",").map((s) => s.trim());
    return parts.length > 1 ? parts[parts.length - 1] : address;
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-[1500px] px-4 py-8 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="size-8 animate-spin text-accent" />
          <span className="ml-3 text-muted-foreground">Loading Shops...</span>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-[1500px] px-4 py-8 lg:px-8">
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-8 text-center">
          <p className="text-destructive">Error while loading shops...</p>
          <p className="text-sm text-muted-foreground">{error?.message || "Pokušajte ponovo kasnije."}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-foreground hover:brightness-95"
          >
            Try Again.
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="stores" className="mx-auto max-w-[1500px] px-4 py-8 lg:px-8">
      <div className="rounded-xl border border-border bg-card p-4 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold lg:text-2xl">
              Shops ({pagination?.total || 0})
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Find Shops
            </p>
          </div>
          <div className="flex items-center gap-2">
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

        <div ref={scrollRef} className="rail mt-5 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {shops.map((shop) => (
            <Link
              key={shop.id}
              href={`/store/${shop.id}`}
              className="card-hover group flex w-[88%] min-w-[300px] flex-col overflow-hidden rounded-xl border border-border bg-card sm:w-[360px] flex-shrink-0"
            >
              <div className="relative h-28 overflow-hidden bg-secondary">
                <img
                  src={shop.coverBanner || "/placeholder-banner.jpg"}
                  alt={`${shop.name} banner`}
                  width={1024}
                  height={512}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3">
                  <div className="flex size-14 items-center justify-center rounded-xl border-2 border-card bg-accent text-lg font-extrabold text-accent-foreground shadow-lg overflow-hidden">
                    {getLogo(shop)}
                  </div>
                  <div className="flex-1 pb-0.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-base font-bold">{shop.name}</h3>
                      {shop.sellers && (
                        <BadgeCheck className="size-4 shrink-0 text-accent" aria-label="Verified store" />
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5 font-semibold text-foreground">
                        <Star className="size-3 fill-star text-star" />
                        {shop.ratings?.toFixed(1) || "N/A"}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="size-3" /> {getLocation(shop.address)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" /> {shop.followers || 0} followers
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <ShopProducts shopId={shop.id} />
                </div>

                <div className="mt-4 flex items-center justify-between">
            
                  <span className="ml-auto text-sm font-bold text-accent">Visit Shop →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:pointer-events-none hover:bg-secondary"
            >
              Prethodna
            </button>
            <span className="text-sm text-muted-foreground">
              Strana {page} od {totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:pointer-events-none hover:bg-secondary"
            >
              Sledeća
            </button>
          </div>
        )}
      </div>
    </section>
  );
}