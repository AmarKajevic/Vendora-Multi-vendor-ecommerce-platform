import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Heart, X, Star, Truck, ShieldCheck, RotateCcw, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import { useStore } from "apps/user-ui/src/store";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { isProtected } from "apps/user-ui/src/utils/protected";


const ProductDetailsCard = ({ data, setOpen }: { data: any; setOpen: (open: boolean) => void }) => {
  const [activeImage, setActiveImage] = useState(0);
  const router = useRouter();
  const [isSelected, setIsSelected] = useState(data?.colors?.[0] || "");
  const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);

  const isWishlisted = wishlist.some((item: any) => item.id === data.id);
  const isInCart = cart.some((item: any) => item.id === data.id);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  const discount =
    data.regular_price && data.sale_price
      ? Math.round((1 - data.sale_price / data.regular_price) * 100)
      : null;

  // Lock scroll when modal opens
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [setOpen]);

  const handleChat = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await axiosInstance.post(
        "/chatting/api/create-user-conversationGroup",
        { sellerId: data?.Shop?.sellerId },
        isProtected
      );
      router.push(`/inbox?conversationId=${res.data.conversation.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (isInCart) return;
    addToCart(
      {
        ...data,
        quantity,
        selectedOptions: {
          color: isSelected,
          size: isSizeSelected,
        },
      },
      user,
      location,
      deviceInfo
    );
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(data.id, user, location, deviceInfo);
    } else {
      addToWishlist(
        {
          ...data,
          quantity,
          selectedOptions: {
            color: isSelected,
            size: isSizeSelected,
          },
        },
        user,
        location,
        deviceInfo
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick preview: ${data?.title || "Product"}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-background shadow-[var(--shadow-hover)] sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-bold">Quick preview</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close preview"
            className="grid size-8 place-items-center rounded-md hover:bg-secondary"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content grid */}
        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6">
          {/* Left: Image gallery */}
          <div>
            <div className="overflow-hidden rounded-xl bg-secondary">
              <Image
                src={data?.images?.[activeImage]?.url || "https://ik.imagekit.io/amark97/products/product-1784307296585_79hubvSRb.jpg?updatedAt=1784307298543"}
                alt={data?.title || "Product image"}
                width={400}
                height={400}
                className="aspect-square w-full object-cover"
              />
            </div>
            {data?.images?.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {data.images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                      activeImage === idx ? "border-accent" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img.url || "https://ik.imagekit.io/amark97/products/iphone%2017.webp"}
                      alt={`Thumbnail ${idx}`}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">
            <h2 className="text-base font-bold leading-snug">{data?.title}</h2>

            {/* Rating and sold */}
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5 font-semibold text-foreground">
                <Star className="size-3.5 fill-star text-star" />
                {data?.ratings || 0}
              </span>
              <span>·</span>
              <span>{data?.totalSales || 0} sold</span>
            </div>

            {/* Price */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-deal">
                ${data?.sale_price?.toFixed(2)}
              </span>
              {data?.regular_price && (
                <span className="text-sm text-muted-foreground line-through">
                  ${data.regular_price.toFixed(2)}
                </span>
              )}
              {discount !== null && discount > 0 && (
                <span className="text-sm font-bold text-deal">-{discount}%</span>
              )}
            </div>

            {/* Short description */}
            {data?.short_description && (
              <p className="mt-2 text-xs text-muted-foreground">{data.short_description}</p>
            )}

            {/* Brand */}
            {data?.brand && (
              <p className="mt-1 text-xs">
                <strong>Brand:</strong> {data.brand}
              </p>
            )}

            {/* Color */}
            {data?.colors?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground">Color</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {data.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setIsSelected(color)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        isSelected === color
                          ? "border-accent font-semibold text-accent"
                          : "border-border text-muted-foreground"
                      }`}
                      style={{ backgroundColor: color, color: "#fff" }} // white text for contrast
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {data?.sizes?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground">Size</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {data.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setIsSizeSelected(size)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        isSizeSelected === size
                          ? "border-accent font-semibold text-accent"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and store */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="grid size-9 place-items-center"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="grid size-9 place-items-center"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <Link
                href={`/shop/${data?.Shop?.id}`}
                className="truncate text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                {data?.Shop?.name}
              </Link>
            </div>

            {/* Shipping & return info */}
            <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Truck className="size-3.5 text-emerald-600" />
                {data?.freeShipping ? "Free shipping · 7–15 days" : "Standard shipping · 7–15 days"}
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="size-3.5" /> 90-day free returns
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-3.5" /> Buyer protection on every order
              </li>
            </ul>

            {/* Stock status */}
            <div className="mt-2 text-xs">
              {data?.stock > 0 ? (
                <span className="font-semibold text-green-600">In Stock</span>
              ) : (
                <span className="font-semibold text-red-600">Out of Stock</span>
              )}
              <span className="ml-3 text-muted-foreground">
                Est. delivery: <strong>{estimatedDelivery.toDateString()}</strong>
              </span>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isInCart || data?.stock <= 0}
                className={`deal-gradient w-full rounded-full py-3 text-sm font-bold text-deal-foreground transition ${
                  isInCart || data?.stock <= 0
                    ? "cursor-not-allowed opacity-60"
                    : "hover:opacity-90"
                }`}
              >
                {isInCart ? "In Cart" : "Add to cart"}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={toggleWishlist}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border py-2.5 text-sm font-bold text-muted-foreground hover:bg-secondary"
                >
                  <Heart
                    size={18}
                    fill={isWishlisted ? "red" : "transparent"}
                    stroke={isWishlisted ? "red" : "currentColor"}
                  />
                  {isWishlisted ? "Wishlisted" : "Wishlist"}
                </button>

                <button
                  onClick={handleChat}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-sky-500 py-2.5 text-sm font-bold text-white hover:bg-sky-600 disabled:opacity-60"
                >
                  Chat with Seller
                </button>
              </div>

              <Link
                href={`/product/${data?.slug}`}
                onClick={() => setOpen(false)}
                className="w-full rounded-full border border-accent py-3 text-center text-sm font-bold text-accent hover:bg-accent/10"
              >
                View full details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;