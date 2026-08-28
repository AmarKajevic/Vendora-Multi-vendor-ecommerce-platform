"use client";

import { useQuery } from "@tanstack/react-query";
import ProductCard from "apps/user-ui/src/shared/components/cards/Product-card";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Range } from "react-range";

const MIN = 0;
const MAX = 1199;

const Page = () => {
  const router = useRouter();
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1199]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);

  const colors = [
    { name: "Black", code: "#000" },
    { name: "Red", code: "#ff0000" },
    { name: "Green", code: "#00ff00" },
    { name: "Blue", code: "#0000ff" },
    { name: "Yellow", code: "#ffff00" },
    { name: "Magenta", code: "#ff00ff" },
    { name: "Cyan", code: "#00ffff" }, // ispravka
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const updateURL = () => {
    const params = new URLSearchParams();
    params.set("priceRange", priceRange.join(","));
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }
    if (selectedColors.length > 0) {
      params.set("colors", selectedColors.join(","));
    }
    if (selectedSizes.length > 0) {
      params.set("sizes", selectedSizes.join(","));
    }
    params.set("page", page.toString());
    router.replace(`/products?${decodeURIComponent(params.toString())}`);
  };

  const fetchFilteredProducts = async () => {
    setIsProductLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("priceRange", priceRange.join(","));
      if (selectedCategories.length > 0) {
        query.set("categories", selectedCategories.join(","));
      }
      if (selectedColors.length > 0) {
        query.set("colors", selectedColors.join(","));
      }
      if (selectedSizes.length > 0) {
        query.set("sizes", selectedSizes.join(","));
      }
      query.set("page", page.toString());
      query.set("limit", "12");

      const res = await axiosInstance.get(
        `/product/api/get-filtered-products?${query.toString()}`
      );
      setProducts(res.data.products);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.log("Failed to fetch filtered products", error);
    } finally {
      setIsProductLoading(false);
    }
  };

  useEffect(() => {
    updateURL();
    fetchFilteredProducts();
  }, [priceRange, selectedCategories, selectedColors, selectedSizes, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label) ? prev.filter((cat) => cat !== label) : [...prev, label]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="w-full bg-gray-50 pb-10 rounded-md">
      <div className="w-[90%] lg:w-[80%] mx-auto">
        {/* Header */}
        <div className="pb-[10px]">
          <h1 className="md:pt-[40px] font-medium text-[44px] leading-1 mb-[14px] font-jost">
            All Products
          </h1>
          <Link href="/" className="text-[#55585b] hover:underline">
            Home
          </Link>
          <span className="inline-block p-[1.5px] mx-1 bg-[#a9acb0] rounded-full"></span>
          <span className="text-[#55585b]">All Products</span>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* Sidebar – redizajniran */}
          <aside className="w-full lg:w-[270px] bg-white rounded-lg shadow-sm p-5 space-y-6 h-fit">
            {/* Price filter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Price Range</h3>
              <div className="ml-1">
                <Range
                  step={1}
                  min={MIN}
                  max={MAX}
                  values={tempPriceRange}
                  onChange={(values) => setTempPriceRange(values)}
                  renderTrack={({ props, children }) => {
                    const [min, max] = tempPriceRange;
                    const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100;
                    const percentageRight = ((max - MIN) / (MAX - MIN)) * 100;

                    return (
                      <div
                        {...props}
                        className="h-[6px] bg-gray-200 rounded relative w-full"
                      >
                        <div
                          className="absolute h-full bg-blue-500 rounded"
                          style={{
                            left: `${percentageLeft}%`,
                            width: `${percentageRight - percentageLeft}%`,
                          }}
                        />
                        {children}
                      </div>
                    );
                  }}
                  renderThumb={({ props, isDragged }) => {
                    const { key, ...restProps } = props;
                    return (
                      <div
                        key={key}
                        {...restProps}
                        className={`w-4 h-4 rounded-full shadow-md cursor-pointer transition ${
                          isDragged ? "bg-blue-700 scale-110" : "bg-blue-500"
                        }`}
                      />
                    );
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-600">
                  ${tempPriceRange[0]} – ${tempPriceRange[1]}
                </span>
                <button
                  onClick={() => {
                    setPriceRange(tempPriceRange);
                    setPage(1);
                  }}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
                Categories
              </h3>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                <ul className="space-y-2">
                  {data?.categories?.map((category: string) => (
                    <li key={category} className="flex items-center">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                        />
                        {category}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
                Colors
              </h3>
              <ul className="space-y-2">
                {colors.map((color) => (
                  <li key={color.name} className="flex items-center">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color.name)}
                        onChange={() => toggleColor(color.name)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.code }}
                      />
                      {color.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
                Sizes
              </h3>
              <ul className="space-y-2">
                {sizes.map((size) => (
                  <li key={size} className="flex items-center">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                      />
                      <span className="font-medium">{size}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 px-2 lg:px-3">
            {isProductLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-[250px] bg-gray-200 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 text-lg mt-10">
                No products found!
              </p>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded-full border border-gray-300 text-sm font-medium transition ${
                      page === i + 1
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;