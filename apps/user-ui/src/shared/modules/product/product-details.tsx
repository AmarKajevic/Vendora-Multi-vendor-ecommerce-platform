"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import {
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Heart,
  BadgeCheck,
  ChevronRight,
  Store as StoreIcon,
  MessageSquareText,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Hookovi i store

import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import { useStore } from "apps/user-ui/src/store";
import useRequireAuth from "apps/user-ui/src/hooks/useRequiredAuth";
import { isProtected } from "apps/user-ui/src/utils/protected";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";

// Komponente

import ProductCard from "../../components/cards/Product-card";
import ProductImageZoom from "../../components/product-image-zoom/ProductImageZoom";

// Mapa za pretvaranje hex kodova u nazive boja
const colorMap: Record<string, string> = {
  "#0000FF": "Blue",
  "#FF0000": "Red",
  "#FFFF00": "Yellow",
  "#FF00FF": "Magenta",
  "#00FFFF": "Cyan",
  "#000000": "Black",
  "#FFFFFF": "White",
  "#00FF00": "Green",
  "#FFA500": "Orange",
  "#800080": "Purple",
  "#FFC0CB": "Pink",
  "#A52A2A": "Brown",
  "#808080": "Gray",
  "#008000": "Dark Green",
  "#FFD700": "Gold",
  "#C0C0C0": "Silver",
  // Dodaj po potrebi
};

interface ProductDetailsProps {
  productDetails: any;
}

const ProductDetails = ({ productDetails }: ProductDetailsProps) => {
  const router = useRouter();
  const { user } = useRequireAuth() as { user: any; isLoading: boolean };
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  // State za slike, varijante, količinu
  const [ setCurrentImage] = useState(
    productDetails?.images?.[0]?.url || "",
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    productDetails?.colors?.[0] || "",
  );
  const [selectedSize, setSelectedSize] = useState(
    productDetails?.sizes?.[0] || "",
  );
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Store akcije
  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);
  const productView = useStore((state: any) => state.trackProductView);

  const isWishlisted = wishlist.some(
    (item: any) => item.id === productDetails.id,
  );
  const isInCart = cart.some((item: any) => item.id === productDetails.id);

  // Popust
  const discountPercentage =
    productDetails.regular_price && productDetails.sale_price
      ? Math.round(
          ((productDetails.regular_price - productDetails.sale_price) /
            productDetails.regular_price) *
            100,
        )
      : null;

  // Galerija slika
  const gallery = productDetails?.images
    ? productDetails.images.map((img: any) => img.url)
    : [];
  const activeImage = gallery[currentIndex] || gallery[0] || "";

  // Navigacija kroz slike
  // const prevImage = () => {
  //   if (currentIndex > 0) {
  //     setCurrentIndex(currentIndex - 1);
  //     setCurrentImage(gallery[currentIndex - 1]);
  //   }
  // };
  // const nextImage = () => {
  //   if (currentIndex < gallery.length - 1) {
  //     setCurrentIndex(currentIndex + 1);
  //     setCurrentImage(gallery[currentIndex + 1]);
  //   }
  // };

  // Dohvati preporučene proizvode
  const fetchRecommended = async () => {
    try {
      const res = await axiosInstance.get(
        `/product/api/get-filtered-products?priceRange=${productDetails.sale_price},1199&page=1&limit=5`,
      );
      setRecommendedProducts(res.data.products || []);
    } catch (error) {
      console.error("Failed to fetch recommended:", error);
    }
  };

  useEffect(() => {
    fetchRecommended();
  }, [productDetails.sale_price]);

  // Praćenje pregleda proizvoda
  useEffect(() => {
    if (user?.id && productDetails?.id) {
      productView(
        { id: productDetails.id, shopId: productDetails.Shop?.id },
        user,
        location,
        deviceInfo,
      );
    }
  }, [productDetails?.id, user?.id]);

  // Chat sa prodavcem
  const handleChat = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await axiosInstance.post(
        "/chatting/api/create-user-conversationGroup",
        { sellerId: productDetails?.Shop?.sellerId },
        isProtected,
      );
      router.push(`/inbox?conversationId=${res.data.conversation.id}`);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-5">
      <div className="mx-auto w-[90%] lg:w-[80%]">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1 text-xs text-gray-500">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="truncate text-gray-800">
            {productDetails?.title}
          </span>
        </nav>

        {/* Glavna mreža */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_320px]">
          {/* Galerija */}
          <div>
            <div className="overflow-hidden rounded-xl border border-border bg-white">
              <ProductImageZoom src={activeImage} />
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIndex(i);
                    setCurrentImage(img);
                  }}
                  className={`size-16 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white ${
                    i === currentIndex ? "border-sky-500" : "border-gray-200"
                  }`}
                >
                  <img src={img} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Informacije o proizvodu */}
          <div className="flex flex-col bg-white p-4 rounded-xl">
            {productDetails?.isChoice && (
              <span className="mb-2 w-fit rounded-sm bg-choice px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-choice-foreground">
                Choice
              </span>
            )}
            <h1 className="text-xl font-bold leading-snug lg:text-2xl">
              {productDetails?.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1 font-semibold text-gray-800">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                {productDetails?.rating || 0}
              </span>
              <span>·</span>
              <span>{productDetails?.totalSales || 0} sold</span>
              <span>·</span>
              <span>0 reviews</span>
            </div>

            <div className="mt-4 rounded-xl bg-gray-50 p-4">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-extrabold text-orange-500">
                  ${productDetails?.sale_price?.toFixed(2)}
                </span>
                {productDetails?.regular_price && (
                  <span className="pb-1 text-sm text-gray-400 line-through">
                    ${productDetails?.regular_price?.toFixed(2)}
                  </span>
                )}
                {discountPercentage !== null && discountPercentage > 0 && (
                  <span className="deal-gradient mb-1 rounded-full px-2 py-0.5 text-xs font-bold text-white">
                    -{discountPercentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Boje – prikaz naziva umesto hex koda */}
            {productDetails?.colors?.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-bold">
                  Color:{" "}
                  <span className="font-normal text-gray-500">
                    {colorMap[selectedColor] || selectedColor}
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {productDetails.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-full border px-3 py-1.5 text-sm ${
                        color === selectedColor
                          ? "border-sky-500 bg-sky-50 font-semibold text-sky-600"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      style={{ backgroundColor: color, color: "#fff" }}
                    >
                      {colorMap[color] || color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Veličine – prikaz naziva */}
            {productDetails?.sizes?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-bold">
                  Size:{" "}
                  <span className="font-normal text-gray-500">
                    {selectedSize}
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {productDetails.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-md border px-4 py-1.5 text-sm ${
                        size === selectedSize
                          ? "border-sky-500 bg-sky-50 font-semibold text-sky-600"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STATIČKI BLOK – informacije o isporuci */}
            <div className="mt-6 space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
              <p className="flex items-center gap-2 text-gray-700">
                <Truck className="size-4 text-sky-500" />
                Ships from a verified vendor warehouse
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <RotateCcw className="size-4 text-sky-500" />
                90-day free returns on eligible orders
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <ShieldCheck className="size-4 text-sky-500" />
                Buyer protection on every order
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Truck className="size-4 text-sky-500" />
                Delivery in 7–15 business days
              </p>
            </div>
            {/* SPECIFIKACIJE (brand, warranty, ships from, return policy, stock) */}
            {(productDetails?.brand ||
              productDetails?.warranty ||
              productDetails?.ships_from ||
              productDetails?.return_policy ||
              productDetails?.stock !== undefined) && (
              <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
                <h2 className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold">
                  Specifications
                </h2>
                <dl className="divide-y divide-gray-200 text-sm">
                  {productDetails?.brand && (
                    <div className="flex justify-between gap-4 px-4 py-2.5">
                      <dt className="text-gray-500">Brand</dt>
                      <dd className="font-medium">{productDetails.brand}</dd>
                    </div>
                  )}
                  {productDetails?.warranty && (
                    <div className="flex justify-between gap-4 px-4 py-2.5">
                      <dt className="text-gray-500">Warranty</dt>
                      <dd className="font-medium">{productDetails.warranty}</dd>
                    </div>
                  )}
                  {productDetails?.ships_from && (
                    <div className="flex justify-between gap-4 px-4 py-2.5">
                      <dt className="text-gray-500">Ships from</dt>
                      <dd className="font-medium">
                        {productDetails.ships_from}
                      </dd>
                    </div>
                  )}
                  {productDetails?.return_policy && (
                    <div className="flex justify-between gap-4 px-4 py-2.5">
                      <dt className="text-gray-500">Return policy</dt>
                      <dd className="font-medium">
                        {productDetails.return_policy}
                      </dd>
                    </div>
                  )}
                  {productDetails?.stock !== undefined && (
                    <div className="flex justify-between gap-4 px-4 py-2.5">
                      <dt className="text-gray-500">Stock</dt>
                      <dd className="font-medium">
                        {productDetails.stock} units
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          {/* Kupovina i prodavac */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-bold text-emerald-600">
                {productDetails?.freeShipping
                  ? "Free shipping"
                  : "Shipping from $2.99"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Delivery: 7–15 business days
              </p>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm font-semibold">Quantity</span>
                <div className="flex items-center rounded-full border border-gray-200">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="size-8 rounded-full text-lg leading-none hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="size-8 rounded-full text-lg leading-none hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Total:{" "}
                <span className="text-xl font-extrabold text-orange-500">
                  ${((productDetails?.sale_price || 0) * quantity).toFixed(2)}
                </span>
              </p>

              <button
                className="deal-gradient mt-4 w-full rounded-full py-3 font-bold text-white"
                onClick={() =>
                  addToCart(
                    {
                      ...productDetails,
                      quantity,
                      selectedOptions: {
                        color: selectedColor,
                        size: selectedSize,
                      },
                    },
                    user,
                    location,
                    deviceInfo,
                  )
                }
                disabled={isInCart || productDetails?.stock === 0}
              >
                {isInCart ? "In Cart" : "Buy now"}
              </button>
              <button
                className="mt-2 w-full rounded-full border border-sky-500 py-3 font-bold text-sky-500 hover:bg-sky-50"
                onClick={() =>
                  addToCart(
                    {
                      ...productDetails,
                      quantity,
                      selectedOptions: {
                        color: selectedColor,
                        size: selectedSize,
                      },
                    },
                    user,
                    location,
                    deviceInfo,
                  )
                }
                disabled={isInCart || productDetails?.stock === 0}
              >
                {isInCart ? "Already in Cart" : "Add to cart"}
              </button>
              <button
                className="mt-2 flex w-full items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-sky-500"
                onClick={() =>
                  isWishlisted
                    ? removeFromWishlist(
                        productDetails.id,
                        user,
                        location,
                        deviceInfo,
                      )
                    : addToWishlist(
                        {
                          ...productDetails,
                          quantity,
                          selectedOptions: {
                            color: selectedColor,
                            size: selectedSize,
                          },
                        },
                        user,
                        location,
                        deviceInfo,
                      )
                }
              >
                <Heart
                  className="size-4"
                  fill={isWishlisted ? "red" : "transparent"}
                  color={isWishlisted ? "red" : "currentColor"}
                />
                {isWishlisted ? "Remove from wishlist" : "Save for later"}
              </button>

              <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-xs text-gray-500">
                <p className="flex items-center gap-2">
                  <Truck className="size-4" /> Tracked worldwide delivery
                </p>
                <p className="flex items-center gap-2">
                  <RotateCcw className="size-4" /> 90-day free returns
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="size-4" /> Secure payments & buyer
                  protection
                </p>
              </div>
            </div>

            {/* Prodavac */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-xl bg-sky-500 font-extrabold text-white">
                  {productDetails?.Shop?.name?.slice(0, 2).toUpperCase() ||
                    "ST"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-bold">
                      {productDetails?.Shop?.name || "Unknown Store"}
                    </p>
                    <BadgeCheck className="size-4 shrink-0 text-sky-500" />
                  </div>
                  <p className="text-xs text-gray-500">Verified seller</p>
                </div>
              </div>
              <Link
                href={`/shop/${productDetails?.Shop?.id}`}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 py-2.5 text-sm font-bold hover:bg-gray-50"
              >
                <StoreIcon className="size-4" /> Visit store
              </Link>
              <button
                onClick={handleChat}
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 py-2.5 text-sm font-bold hover:bg-gray-50"
              >
                <MessageSquareText className="size-4" /> Chat Now
              </button>
            </div>
          </aside>
        </div>

        {/* PRODUCT DETAILS (detaljan opis) – iz detailed_description */}
        {productDetails?.detailed_description && (
         <div className="mt-8 bg-white rounded-xl p-6 shadow-sm overflow-x-auto w-full">
  <h2 className="text-lg font-bold mb-3">Product Details</h2>
  <div
    className="prose prose-sm max-w-full text-gray-700 break-words"
    dangerouslySetInnerHTML={{
      __html: productDetails.detailed_description,
    }}
  />
</div>
        )}

        {/* Preporučeni proizvodi */}
        <div className="mt-12">
          <h2 className="text-lg font-extrabold lg:text-xl">
            You may also like
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {recommendedProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
