"use client";

import { useQuery } from "@tanstack/react-query";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const CartPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const cart = useStore((state: any) => state.cart);
  const [discountedProductId, setDiscountedProductId] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [error, setError] = useState("");
  const [storeCouponCode, setStoredCouponCode] = useState("");

  const cuoponCodeApplyHandler = async () => {
    setError("");
    if (!couponCode.trim()) {
      setError("Coupon code is required");
      return;
    }
    try {
      const res = await axiosInstance.put("/order/api/verify-coupon", {
        couponCode: couponCode.trim(),
        cart,
      });

      if (res.data.valid) {
        setStoredCouponCode(couponCode.trim());
        setDiscountAmount(parseFloat(res.data.discountAmount));
        setDiscountPercent(res.data.discount);
        setDiscountedProductId(res.data.discountProductId);
        setCouponCode("");
      } else {
        setDiscountAmount(0);
        setDiscountPercent(0);
        setDiscountedProductId("");
        setError(res.data.message || "Coupon not valid for any items in cart.");
      }
    } catch (error: any) {
      setDiscountAmount(0);
      setDiscountPercent(0);
      setDiscountedProductId("");
      setError(error?.response?.data?.message);
    }
  };

  const createPaymentSession = async () => {
    if (addresses?.length === 0) {
      toast.error("Please set your delivery address to create an order!");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/order/api/create-payment-session", {
        cart,
        selectedAddressId,
        coupon: {
          code: storeCouponCode,
          discountAmount,
          discountPercent,
          discountedProductId,
        },
      });
      const sessionId = res.data.sessionId;
      router.push(`/checkout?sessionId=${sessionId}`);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const [loading, setLoading] = useState(false);

  const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };

  const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item
      ),
    }));
  };

  const removeItem = (id: string) => {
    removeFromCart(id, user, location, deviceInfo);
  };

  const subTotal = cart.reduce(
    (total: number, item: any) => total + item.quantity * item.sale_price,
    0
  );

  const { data: addresses = [] } = useQuery<any[], Error>({
    queryKey: ["shipping-addresses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses;
    },
  });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [addresses, selectedAddressId]);

  return (
    <div className="w-full bg-white mb-4">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        {/* Header */}
        <div className="pb-[50px]">
          <h1 className="md:pt-[50px] font-medium text-[44px] leading-[1] mb-[16px] font-jost">
            Shopping Cart
          </h1>
          <Link href={"/"} className="text-[#55585b] hover:underline">
            Home
          </Link>
          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acbo] rounded-full">
            {">"}
          </span>
          <span className="text-[#55585b]">Cart</span>
        </div>

        {cart.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            Your cart is empty! Start adding products.
          </div>
        ) : (
          <div className="lg:flex items-start gap-10">
            {/* Lista proizvoda – kartice umesto tabele */}
            <div className="w-full lg:w-[70%] space-y-4">
              {cart.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
                >
                  {/* Slika */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.images[0]?.url}
                      alt={item.title}
                      width={96}
                      height={96}
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </div>

                  {/* Detalji proizvoda */}
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-gray-800">{item.title}</h3>
                      {item?.selectedOptions && (
                        <div className="text-sm text-gray-500 mt-1">
                          {item.selectedOptions.color && (
                            <span className="inline-flex items-center gap-1">
                              Color{" "}
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.selectedOptions.color }}
                              />
                            </span>
                          )}
                          {item.selectedOptions.size && (
                            <span className="ml-2">Size: {item.selectedOptions.size}</span>
                          )}
                        </div>
                      )}
                      {/* Cena sa popustom */}
                      <div className="mt-1">
                        {item.id === discountedProductId ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 line-through">
                              ${item.sale_price.toFixed(2)}
                            </span>
                            <span className="text-lg font-semibold text-green-600">
                              $
                              {(item.sale_price * (1 - discountPercent / 100)).toFixed(2)}
                            </span>
                            <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              Discount
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-semibold">
                            ${item.sale_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Kontrole količine i uklanjanje */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded-full">
                        <button
                          className="px-3 py-1 text-xl cursor-pointer hover:bg-gray-100 rounded-l-full"
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-center w-8">{item.quantity}</span>
                        <button
                          className="px-3 py-1 text-xl cursor-pointer hover:bg-gray-100 rounded-r-full"
                          onClick={() => increaseQuantity(item.id)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-gray-400 hover:text-red-500 transition"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sažetak – desna kolona */}
            <div className="w-full lg:w-[30%] mt-6 lg:mt-0">
              <div className="p-6 bg-gray-50 rounded-lg shadow-md sticky top-24">
                {discountAmount > 0 && (
                  <div className="flex justify-between text-base font-medium pb-1">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="text-green-600">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-semibold pb-3">
                  <span>Subtotal</span>
                  <span>${(subTotal - discountAmount).toFixed(2)}</span>
                </div>
                <hr className="my-4" />

                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-1">Have a coupon?</h4>
                  <div className="flex">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      className="bg-accent text-accent-foreground transition-colors hover:brightness-95 px-4 rounded-r-md"
                      onClick={cuoponCodeApplyHandler}
                    >
                      Apply
                    </button>
                  </div>
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                <hr className="my-4" />

                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-1">Shipping Address</h4>
                  {addresses?.length > 0 ? (
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                    >
                      {addresses.map((address: any) => (
                        <option key={address.id} value={address.id}>
                          {address.label} - {address.city}, {address.country}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Please add an address from profile.
                    </p>
                  )}
                </div>

                <hr className="my-4" />

                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-1">Payment Method</h4>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="credit_card">Online Payment</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                  </select>
                </div>

                <hr className="my-4" />

                <div className="flex justify-between text-xl font-semibold pb-3">
                  <span>Total</span>
                  <span>${(subTotal - discountAmount).toFixed(2)}</span>
                </div>

                <button
                  onClick={createPaymentSession}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground transition-colors hover:brightness-95 py-2 rounded-md  disabled:opacity-60"
                >
                  {loading && <Loader2 className="animate-spin w-5 h-5" />}
                  {loading ? "Redirecting..." : "Proceed to Checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;