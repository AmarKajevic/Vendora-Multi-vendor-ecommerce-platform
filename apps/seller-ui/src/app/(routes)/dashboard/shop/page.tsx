"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import React, { useState, useEffect } from "react";
import { Pencil, Star, MapPin, Users, Package } from "lucide-react";

// --- Dohvati podatke o prodavnici ---
const fetchShopData = async () => {
  const res = await axiosInstance.get("/seller/api/get-shop");
  return res?.data?.shop;
};

// --- Dohvati proizvode prodavnice ---
const fetchProducts = async () => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  console.log("Raw products from API:", res.data.products);
  return res?.data?.products || [];
};

const Page = () => {
  // Stanje za upload i prikaz
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCoverBanner, setIsUploadingCoverBanner] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [coverBanner, setCoverBanner] = useState<string | null>(null);

  // 1. Query za podatke o prodavnici
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["seller-shop"],
    queryFn: fetchShopData,
    staleTime: 1000 * 60 * 5,
  });

  // 2. Query za proizvode (bez initialData da ne blokira)
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  console.log("Products in component:", products); // proveri da li su ovde

  // 3. Kada se shop podaci učitaju, postavi avatar i cover banner
  useEffect(() => {
    if (shop) {
      // Obavezno proveri da li je URL string
      const avatarUrl = shop.avatar?.url;
      const bannerUrl = shop.coverBanner;
      setAvatar(typeof avatarUrl === "string" ? avatarUrl : null);
      setCoverBanner(typeof bannerUrl === "string" ? bannerUrl : null);
    }
  }, [shop]);

  // --- Upload avatara ---
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        setIsUploadingAvatar(true);
        const res = await axiosInstance.post("/seller/api/upload-avatar", {
          fileName: file.name,
          fileData: base64,
        });
        // Backend vraća { file_url, fileId }
        setAvatar(res.data.file_url);
      } catch (error) {
        console.error("Error uploading avatar:", error);
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Upload cover bannera ---
  const handleUploadCoverBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        setIsUploadingCoverBanner(true);
        const res = await axiosInstance.post("/seller/api/upload-coverBanner", {
          fileName: file.name,
          fileData: base64,
        });
        setCoverBanner(res.data.coverBanner);
      } catch (error) {
        console.error("Error uploading cover banner:", error);
      } finally {
        setIsUploadingCoverBanner(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (shopLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-white">
        Učitavanje...
      </div>
    );
  }

  if (productsError) {
    console.error("Products error:", productsError);
  }

  return (
    <div className="min-h-screen bg-surface text-white p-4 md:p-6">
      {/* --- BANNER SEKCIJA --- */}
      <div className="relative h-52 overflow-hidden rounded-xl bg-secondary lg:h-72">
        {coverBanner ? (
          <img
            src={coverBanner}
            alt="Cover banner"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gray-700 text-gray-400">
            Nema cover bannera
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        <label className="absolute bottom-4 right-4 cursor-pointer rounded-full bg-black/50 p-2 hover:bg-black/70 transition-colors">
          <Pencil className="size-5 text-white" />
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadCoverBanner}
            className="hidden"
            disabled={isUploadingCoverBanner}
          />
        </label>

        {isUploadingCoverBanner && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm">
              Uploading...
          </div>
        )}
      </div>

      {/* --- INFO O PRODAVNICI --- */}
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8 ">
        <div className="-mt-16 rounded-xl border border-border bg-card p-5 shadow-sm lg:p-6">
          <div className="flex flex-wrap items-start gap-5">
            {/* Avatar sa edit dugmetom */}
            <div className="relative">
              <div className="grid size-20 place-items-center rounded-2xl bg-accent text-2xl font-extrabold text-accent-foreground shadow-lg overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="size-full object-cover" />
                ) : (
                  <span>{shop?.name?.charAt(0) || "S"}</span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-black/50 p-1.5 hover:bg-black/70 transition-colors">
                <Pencil className="size-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </label>
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 text-xs text-white">
                  ...
                </div>
              )}
            </div>

            {/* Detalji prodavnice */}
            <div className="min-w-[220px] flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold lg:text-3xl">
                  {shop?.name || "Moja prodavnica"}
                </h1>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Star className="size-4 fill-star text-star" /> {shop?.ratings || 0} ratings
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" /> {shop?.address || "without address"}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-4" /> {shop?.followers || 0} followers
                </span>
                <span className="flex items-center gap-1">
                  <Package className="size-4" /> {shop?.productsCount || 0} products
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- LISTA PROIZVODA --- */}
        <div className="mt-8">
          <h2 className="text-lg font-extrabold mb-4">Your Products</h2>
          {products.length === 0 ? (
            <p className="text-muted-foreground">Still doesn't have a product.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product: any) => {
                // Sigurno dohvatanje slike
                let imageUrl = "/placeholder.png";
                if (product.images && product.images.length > 0) {
                  const firstImage = product.images[0];
                  if (typeof firstImage === "string") {
                    imageUrl = firstImage;
                  } else if (firstImage?.url && typeof firstImage.url === "string") {
                    imageUrl = firstImage.url;
                  }
                }

                // Cena – preferiraj sale_price, inače regular_price
                const price = product.sale_price ?? product.regular_price ?? "N/A";

                return (
                  <div
                    key={product.id}
                    className="rounded-xl border border-border bg-card p-3 hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={imageUrl}
                      alt={product.title || "Product"}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <h3 className="mt-2 font-semibold line-clamp-2">
                      {product.title || "Bez naziva"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {typeof price === "number" ? `${price} RSD` : price}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;