"use client";

import { useEffect, useRef, useState } from "react";
import {
  Menu,
  ShoppingCart,
  Heart,
  X,
  ChevronRight,
  Globe,
  Store,
  Headphones,
  Smartphone,
  Laptop,
  Home,
  Shirt,
  Sparkles,
  ToyBrick,
  Dumbbell,
  Car,
  Package,
  User2Icon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import SearchBar from "../../components/searchBar/searchBar";
import Link from "next/link";
import Image from "next/image";
import useLayout from "apps/user-ui/src/hooks/useLayout";
import { useStore } from "apps/user-ui/src/store";
import useRequireAuth from "apps/user-ui/src/hooks/useRequiredAuth";
import { User } from "apps/user-ui/src/types/user";
import { navItems } from "apps/user-ui/src/configs/constants";

// ----- Import navItems (pretpostavka da je u config/nav) -----


// Mapa ikona za kategorije
const ICONS: Record<string, any> = {
  Headphones,
  Shirt,
  Home,
  Dumbbell,
  ToyBrick,
  Smartphone,
  Laptop,
  Package,
  Sparkles,
  Car,
};
const FALLBACK_ICON = Package;

// ----- Više ne koristimo QUICK_LINKS, već navItems -----

export function Navbar() {
  const { user, isLoading: userLoading } = useRequireAuth() as { user: User | null; isLoading: boolean };
  const { layout } = useLayout();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);

  const [drawer, setDrawer] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dohvati kategorije i podkategorije
  const { data} = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("product/api/get-categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const categories = data?.categories || [];
  const subCategories = data?.subCategories || {};

  const categoryData = categories.map((cat: string) => ({
    name: cat,
    sub: subCategories[cat] || [],
  }));

  // Zaključaj scroll kada je drawer otvoren
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const open = () => {
    if (timer.current) clearTimeout(timer.current);
    setCatOpen(true);
  };
  const close = () => {
    timer.current = setTimeout(() => setCatOpen(false), 140);
  };

  const wishlistCount = wishlist?.length || 0;
  const cartCount = cart?.length || 0;

  // ----- Helper za renderovanje linkova (interne vs eksterne) -----
  const renderNavLink = (item: { title: string; href: string }) => {
    const isExternal = item.href.startsWith("http://") || item.href.startsWith("https://");
    if (isExternal) {
      return (
        <a
          key={item.title}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-accent"
        >
          {item.title}
        </a>
      );
    }
    return (
      <Link
        key={item.title}
        href={item.href}
        className="shrink-0 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-accent"
      >
        {item.title}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-background shadow-[var(--shadow-card)]">
      {/* Utility bar - isti kao pre */}
      <div className="hidden border-b border-border bg-secondary/60 lg:block">
        <div className="mx-auto flex h-9 max-w-[1500px] items-center gap-5 px-5 text-xs text-muted-foreground lg:px-8">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <Package className="size-3.5" /> Ship to: Wordlwide
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="size-3.5" /> English · USD
          </span>
          <div className="ml-auto flex items-center gap-5">
            <a href="#" className="hover:text-accent">
              Buyer protection
            </a>
            <a href="#" className="hover:text-accent">
              Help center
            </a>
            <a
              href={`${process.env.NEXT_PUBLIC_SELLER_SERVER_URI}/signup`}
              className="flex items-center gap-1.5 font-semibold text-foreground hover:text-accent"
            >
              <Store className="size-3.5" /> Become a seller
            </a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 lg:gap-6 lg:px-8">
        <button
          className="grid size-10 place-items-center rounded-md hover:bg-secondary lg:hidden"
          aria-label="Open categories menu"
          onClick={() => setDrawer(true)}
        >
          <Menu className="size-6" />
        </button>

        <Link href="/" className="shrink-0">
          <Image
            src={layout?.logo || "https://ik.imagekit.io/amark97/products/logo%20vendora.png"}
            width={350}
            height={200}
            alt="Logo"
            className="h-[80px] w-auto object-contain"
          />
        </Link>

        <div className="hidden flex-1 items-center md:flex">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1 lg:gap-2">
          {!userLoading && user ? (
            <Link
              href="/profile"
              className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold hover:bg-secondary lg:flex"
            >
              <User2Icon className="size-5" />
              <span className="flex flex-col leading-tight">
                <span className="text-xs font-normal text-muted-foreground">Hello</span>
                <span>{user.name}</span>
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold hover:bg-secondary lg:flex"
            >
              <User2Icon className="size-5" /> Sign in
            </Link>
          )}

          <Link
            href={user ? "/profile" : "/login"}
            className="grid size-10 place-items-center rounded-md hover:bg-secondary lg:hidden"
            aria-label="Account"
          >
            <User2Icon className="size-5" />
          </Link>

          <Link
            href="/wishlist"
            className="relative grid size-10 place-items-center rounded-md hover:bg-secondary"
            aria-label="Wishlist"
          >
            <Heart className="size-5" />
            {wishlistCount > 0 && (
              <span className="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-deal px-1 text-[10px] font-bold text-deal-foreground">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className="relative grid size-10 place-items-center rounded-md hover:bg-secondary"
            aria-label="Cart"
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-deal px-1 text-[10px] font-bold text-deal-foreground">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobilna pretraga */}
      <div className="px-4 pb-3 md:hidden">
        <SearchBar />
      </div>

      {/* Kategorijski bar - sada koristi navItems umesto QUICK_LINKS */}
      <div className="relative border-t border-border" onMouseLeave={close}>
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-4 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onMouseEnter={open}
            onClick={() =>
              window.innerWidth < 1024 ? setDrawer(true) : setCatOpen((v) => !v)
            }
            className="flex shrink-0 items-center gap-2 py-2.5 pr-4 text-sm font-bold"
          >
            <Menu className="size-4" /> All Categories
          </button>
          {/* ✅ Zamenjeno QUICK_LINKS sa navItems */}
          {navItems.map((item) => renderNavLink(item))}
        </div>

        {/* Desktop mega dropdown (isti kao pre) */}
        <div
          onMouseEnter={open}
          className={`absolute left-0 right-0 top-full hidden border-b border-border bg-background shadow-[var(--shadow-hover)] lg:block ${
            catOpen ? "" : "pointer-events-none opacity-0 z-60"
          } transition-opacity duration-200`}
        >
          <div className="mx-auto grid max-w-[1500px] grid-cols-[280px_1fr] px-8">
            <ul className="border-r border-border py-3">
              {categoryData.map((cat: any, index: number) => {
                const Icon = ICONS[cat.name] || FALLBACK_ICON;
                return (
                  <li key={cat.name}>
                    <button
                      onMouseEnter={() => setActive(index)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm ${
                        active === index
                          ? "bg-secondary font-semibold text-accent"
                          : "hover:bg-secondary"
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1 truncate">{cat.name}</span>
                      <ChevronRight className="size-4 opacity-50" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="p-8">
              <h3 className="text-lg font-bold">{categoryData[active]?.name}</h3>
              <div className="mt-5 grid grid-cols-4 gap-x-8 gap-y-3">
                {categoryData[active]?.sub.length > 0 ? (
                  categoryData[active].sub.map((sub: string) => (
                    <a key={sub} href="/sub" className="text-sm text-muted-foreground hover:text-accent">
                      {sub}
                    </a>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Nema podkategorija</span>
                )}
              </div>
              <div className="mt-8 rounded-lg bg-secondary p-5">
                <p className="eyebrow text-accent">Vendor spotlight</p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Over 180,000 verified sellers ship from 200+ countries with buyer protection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement strip - isti */}
      <div className="overflow-hidden bg-ink py-2 text-ink-foreground/85">
        <div className="marquee-track eyebrow">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="inline-flex gap-10">
              <span className="text-white">Free shipping on 10M+ items</span>
              <span className="text-white">90-day easy returns</span>
              <span className="text-white">Buyer protection on every order</span>
              <span className="text-white">New buyer coupon: extra $4 off $20</span>
              <span className="text-white">Free shipping on 10M+ items</span>
              <span className="text-white">90-day easy returns</span>
              <span className="text-white">Buyer protection on every order</span>
              <span className="text-white">New buyer coupon: extra $4 off $20</span>
            </span>
          ))}
        </div>
      </div>

      {/* Mobile drawer - isti */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${drawer ? "" : "pointer-events-none"}`}
        aria-hidden={!drawer}
      >
        <div
          onClick={() => setDrawer(false)}
          className={`absolute inset-0 bg-ink/50 transition-opacity ${drawer ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-background transition-transform duration-300 ${
            drawer ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="text-xl font-extrabold">
              Vendora<span className="text-accent">.</span>
            </span>
            <button onClick={() => setDrawer(false)} aria-label="Close menu" className="p-2">
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <p className="eyebrow px-5 py-2 text-muted-foreground">All categories</p>
            {categoryData.map((c: any) => {
              const Icon = ICONS[c.name] || FALLBACK_ICON;
              return (
                <details key={c.name} className="border-b border-border/70">
                  <summary className="flex cursor-pointer items-center gap-3 px-5 py-3 text-sm font-semibold">
                    <Icon className="size-4 text-accent" />
                    {c.name}
                  </summary>
                  <ul className="space-y-2 bg-secondary/60 px-12 py-3">
                    {c.sub.map((s: string) => (
                      <li key={s}>
                        <a href="#" className="text-sm text-muted-foreground">
                          {s}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              );
            })}
          </div>
          <div className="border-t border-border p-5">
            <Link
              href={user ? "/profile" : "/login"}
              className="block rounded-full bg-accent py-3 text-center text-sm font-bold text-accent-foreground"
            >
              {user ? `Hello, ${user.name}` : "Sign in / Register"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}