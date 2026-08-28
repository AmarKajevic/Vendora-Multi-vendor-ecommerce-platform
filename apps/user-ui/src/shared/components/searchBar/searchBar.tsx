// apps/user-ui/src/components/SearchBar.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Store as StoreIcon,
  ArrowUpRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useDebounce } from "apps/user-ui/src/hooks/useDebounce";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";

// --- Konstantni podaci (recent, trending) ---
const TRENDING = [
  "wireless headphones",
  "smart watch",
  "camera drone",
  "laptop backpack",
  "led desk lamp",
  "skincare set",
];
const RECENT_KEY = "vendora.recent-searches";

// ----- Pomocne funkcije -----
function useRecent() {
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);
  const push = (term: string) => {
    const next = [term, ...recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };
  const clear = () => {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      /* ignore */
    }
  };
  return { recent, push, clear };
}

function highlight(text: string, q: string) {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (!q || i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-bold text-accent">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ----- Tipovi -----
type Suggestion =
  | { kind: "product"; product: any }
  | { kind: "store"; store: any }
  | { kind: "category"; name: string }
  | { kind: "term"; term: string };

// ----- Glavna komponenta -----
export default function SearchBar({
  variant = "desktop",
  onDone,
}: {
  variant?: "desktop" | "mobile";
  onDone?: () => void;
}) {
  const { recent, push, clear } = useRecent();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const q = term.trim();
  const debouncedSearch = useDebounce(q, 300);

  // ----- 1. API za pretragu proizvoda -----
  const {
    data: searchData,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        return { products: [] };
      }
      const res = await axiosInstance.get(
        `product/api/search-products?q=${encodeURIComponent(debouncedSearch)}`
      );
      return res.data; // { products: [...] }
    },
    enabled: debouncedSearch.length >= 2,
    staleTime: 1000 * 30,
  });

  const apiProducts = searchData?.products || [];

  // ----- 2. API za kategorije (jednom) -----
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("product/api/get-categories");
      return res.data; // { categories: [...], subCategories: { ... } }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // Pripremi kategorije + subkategorije za pretragu
  const categoryItems = useMemo(() => {
    if (!categoriesData) return [];
    const cats = categoriesData.categories || [];
    const subs = categoriesData.subCategories || {};
    const result: string[] = [];
    cats.forEach((cat: string) => {
      result.push(cat);
      const subList = subs[cat] || [];
      subList.forEach((sub: string) => result.push(sub));
    });
    return result;
  }, [categoriesData]);

  // ----- 3. API za top prodavnice (jednom) -----
  const {
    data: topShopsData,
    isLoading: storesLoading,
    isError: storesError,
  } = useQuery({
    queryKey: ["top-shops"],
    queryFn: async () => {
      const res = await axiosInstance.get("product/api/get-filtered-shops");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const topShops = topShopsData?.shops || [];


  // ----- Izgradnja suggestions (kombinacija svega) -----
  const suggestions = useMemo<Suggestion[]>(() => {
    if (!q) return [];

    const lower = q.toLowerCase();

    // 1. proizvodi iz API-ja
    const products = apiProducts.slice(0, 5).map((p: any) => {
      const imageUrl = p.images?.[0]?.url || p.image || "/placeholder.png";
      const price = p.sale_price ?? p.regular_price ?? 0;
      return {
        kind: "product" as const,
        product: {
          id: p.id,
          slug: p.slug || p.id, // koristi slug ako postoji, inače id
          name: p.title || p.name,
          image: imageUrl,
          price: price,
          sold: p.totalSales ?? p.sold ?? 0,
          choice: p.choice ?? false,
        },
      };
    });

    // 2. kategorije (iz API-ja) – uključujemo i kategorije i subkategorije
    const matchedCategories = categoryItems
      .filter((name) => name.toLowerCase().includes(lower))
      .slice(0, 4)
      .map((name) => ({
        kind: "category" as const,
        name,
      }));

    // 3. prodavnice (iz API-ja top-shops) – filtriramo po nazivu
    const matchedStores = topShops
      .filter((store: any) => store.name.toLowerCase().includes(lower))
      .slice(0, 3)
      .map((store: any) => ({
        kind: "store" as const,
        store: {
          id: store.id,
          name: store.name,
          slug: store.slug || slugify(store.name),
          banner: store.coverBanner || store.avatar?.url || "/placeholder-store.jpg",
          rating: store.ratings || 0,
          totalSales: store.totalSales || 0,
        },
      }));

    // 4. na kraju dodaj "Search term" kao prvu opciju
    return [
      { kind: "term" as const, term: q },
      ...products,
      ...matchedCategories,
      ...matchedStores,
    ];
  }, [q, apiProducts, categoryItems, topShops]);

  // ----- Keyboard & outside click -----
  useEffect(() => setCursor(-1), [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // ----- Akcije (koriste window.location) -----
  const goSearch = (value: string) => {
    const v = value.trim();
    if (v) push(v);
    setOpen(false);
    setTerm(v);
    onDone?.();
    window.location.href = `/products?q=${encodeURIComponent(v)}&store=&sort=relevance`;
  };

  // Zatvaranje dropdown-a nakon klika na Link
  const closeDropdown = () => {
    setOpen(false);
    onDone?.();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      input.current?.blur();
      return;
    }
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && cursor >= 0) {
      e.preventDefault();
      const s = suggestions[cursor];
      if (s) {
        if (s.kind === "product") {
          push(s.product.name);
          window.location.href = `/product/${s.product.slug}`;
        } else if (s.kind === "store") {
          push(s.store.name);
          window.location.href = `/store/${s.store.slug}`;
        } else if (s.kind === "category") {
          goSearch(s.name);
        } else {
          goSearch(s.term);
        }
        closeDropdown();
      }
    }
  };

  const isMobile = variant === "mobile";

  // Ukupno loading / error
  const isLoading = productsLoading || categoriesLoading || storesLoading;
  const isError = productsError || categoriesError || storesError;

  // ----- UI -----
  return (
    <div ref={wrap} className={`relative ${isMobile ? "w-full" : "hidden flex-1 md:block"}`} >
      {/* glow frame */}
      <div
        className={`pointer-events-none absolute -inset-[3px] rounded-full opacity-0 blur-md transition-opacity duration-300 ${
          open ? "opacity-70" : ""
        }`}
        style={{ background: "linear-gradient(90deg, var(--accent), var(--deal), var(--accent))" }}
        aria-hidden
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (cursor >= 0 && suggestions[cursor]) {
            const s = suggestions[cursor];
            if (s.kind === "product") {
              push(s.product.name);
              window.location.href = `/product/${s.product.slug}`;
            } else if (s.kind === "store") {
              push(s.store.name);
              window.location.href = `/store/${s.store.slug}`;
            } else if (s.kind === "category") {
              goSearch(s.name);
            } else {
              goSearch(s.term);
            }
            closeDropdown();
          } else {
            goSearch(term);
          }
        }}
        className={`relative flex items-center rounded-full border-2 bg-background transition-[border-color,box-shadow] duration-200 ${
          open ? "border-accent shadow-[var(--shadow-card)]" : "border-accent/70"
        } ${isMobile ? "pl-3" : "pl-4"}`}
      >
        <Search className={`size-4 shrink-0 transition-colors ${open ? "text-accent" : "text-muted-foreground"}`} />
        <input
          ref={input}
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label="Search products"
          role="combobox"
          aria-expanded={open}
          placeholder={isMobile ? "Search products…" : "Search for headphones, drones, sneakers…"}
          className={`min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground ${
            isMobile ? "px-2 py-2" : "px-3 py-2.5"
          }`}
        />
        {term && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setTerm("");
              input.current?.focus();
            }}
            className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
        {!isMobile && !term && (
          <kbd className="mr-1 hidden rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground lg:block">
            ⌘K
          </kbd>
        )}
        <button
          className={`m-1 rounded-full bg-accent font-bold text-accent-foreground transition-transform hover:brightness-95 active:scale-95 ${
            isMobile ? "px-4 py-1.5 text-sm" : "px-6 py-2 text-sm"
          }`}
        >
          {isMobile ? "Go" : "Search"}
        </button>
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-border bg-background shadow-[0_24px_60px_-20px_oklch(0_0_0/0.35)]">
          {q ? (
            <ul className="max-h-[70vh] overflow-y-auto py-2">
              {isLoading ? (
                <li className="flex items-center justify-center py-8">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {productsLoading ? "Searching..." : "Loading products..."}
                  </span>
                </li>
              ) : isError ? (
                <li className="px-4 py-8 text-center text-sm text-destructive">
                  Error while searching. Try again.
                </li>
              ) : (
                suggestions.map((s, i) => {
                  const activeRow = i === cursor;
                  const base = `flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                    activeRow ? "bg-secondary" : "hover:bg-secondary/70"
                  }`;

                  if (s.kind === "term")
                    return (
                      <li key="term">
                        <button
                          className={base}
                          onMouseEnter={() => setCursor(i)}
                          onClick={() => {
                            goSearch(s.term);
                            closeDropdown();
                          }}
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                            <Search className="size-4" />
                          </span>
                          <span className="flex-1 font-semibold">
                            Search “{s.term}” in all products
                          </span>
                          <ArrowUpRight className="size-4 text-muted-foreground" />
                        </button>
                      </li>
                    );

                  if (s.kind === "product")
                    return (
                      <li key={s.product.id}>
                        <Link
                          href={`/product/${s.product.slug}`}
                          className={base}
                          onClick={closeDropdown}
                          onMouseEnter={() => setCursor(i)}
                        >
                          <img
                            src={s.product.image}
                            alt={s.product.name}
                            loading="lazy"
                            className="size-11 shrink-0 rounded-lg border border-border object-cover"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-1 block font-medium">
                              {highlight(s.product.name, q)}
                            </span>
                            <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-bold text-accent">
                                ${s.product.price.toFixed(2)}
                              </span>
                              <span>· {s.product.sold}</span>
                              {s.product.choice && (
                                <span className="inline-flex items-center gap-0.5 rounded bg-accent/10 px-1 font-bold text-accent">
                                  <Sparkles className="size-3" /> Choice
                                </span>
                              )}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );

                  if (s.kind === "store")
                    return (
                      <li key={s.store.id}>
                        <Link
                          href={`/store/${s.store.slug}`}
                          className={base}
                          onClick={closeDropdown}
                          onMouseEnter={() => setCursor(i)}
                        >
                          <img
                            src={s.store.banner}
                            alt={s.store.name}
                            loading="lazy"
                            className="size-11 shrink-0 rounded-lg border border-border object-cover"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-1 block font-medium">{highlight(s.store.name, q)}</span>
                            <span className="text-xs text-muted-foreground">
                              Store · {s.store.rating} ★ rating · {s.store.totalSales} sales
                            </span>
                          </span>
                          <StoreIcon className="size-4 text-muted-foreground" />
                        </Link>
                      </li>
                    );

                  // category
                  return (
                    <li key={s.name}>
                      <button
                        className={base}
                        onMouseEnter={() => setCursor(i)}
                        onClick={() => {
                          goSearch(s.name);
                          closeDropdown();
                        }}
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                          <TrendingUp className="size-4" />
                        </span>
                        <span className="flex-1">{highlight(s.name, q)}</span>
                        <span className="text-xs text-muted-foreground">Category</span>
                      </button>
                    </li>
                  );
                })
              )}
              {!isLoading && !isError && suggestions.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nema rezultata za "{q}"
                </li>
              )}
            </ul>
          ) : (
            <div className="p-4">
              {recent.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      <Clock className="size-3.5" /> Recent
                    </span>
                    <button onClick={clear} className="text-xs font-semibold text-accent hover:underline">
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          goSearch(r);
                          closeDropdown();
                        }}
                        className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-accent hover:text-accent"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <TrendingUp className="size-3.5" /> Trending now
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      goSearch(t);
                      closeDropdown();
                    }}
                    className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}