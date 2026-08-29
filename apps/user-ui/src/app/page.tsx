'use client'

import { useQuery } from "@tanstack/react-query";
import Hero from "../shared/modules/hero";
import axiosInstance from "../utils/axiosInstance";
import { FeaturedSlider } from "../shared/components/slider/featureSlider";
import { PromoGrid } from "../shared/components/promo/promoGrid";
import TopStores from "../shared/components/slider/topStoreSlider";



export default function Page() {
  const {data: products, isLoading, isError} = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosInstance.get("/recommendation/api/get-recommendation-products")
      console.log(res.data)

      return res.data?.recommendations || [];
    },
    staleTime: 1000 * 60 * 2
  })

  const {data: latestProducts, isLoading:latestProductsLoading} = useQuery({
    queryKey:["latest-products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=10&type=latest"
      );

      return res.data.products
      
    },
    
    staleTime: 1000 * 60 * 2
  })


  


  return (
  <div className="bg-[#f5f5f5]">
    <Hero/>
 <div className="md:w-[100%] w-[100%] my-10 m-auto">
        {/* Prikaz preporučenih proizvoda u slideru */}
        {isLoading ? (
          // Skeleton loader za slider
          <div className="rounded-xl border border-border bg-card p-4 lg:p-6">
            <div className="flex justify-between">
              <div className="h-8 w-48 bg-gray-300 animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="h-9 w-9 bg-gray-300 animate-pulse rounded-full" />
                <div className="h-9 w-9 bg-gray-300 animate-pulse rounded-full" />
              </div>
            </div>
            <div className="mt-5 flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[46%] min-w-[160px] flex-shrink-0 sm:w-[210px] h-[300px] bg-gray-300 animate-pulse rounded-lg"
                />
              ))}
            </div>
          </div>
        ) : !isError && products && products.length > 0 ? (
          <FeaturedSlider products={products} />
        ) : (
          <p className="text-center text-gray-500">No recommended products available.</p>
        )}

        {/* Sekcija sa najnovijim proizvodima (opciono, možeš ostati ili ukloniti) */}
        {!latestProductsLoading && latestProducts && latestProducts.length > 0 && (
          <PromoGrid
            products={latestProducts}
            title="Latest arrivals"
            subtitle="Fresh from our vendors"
            viewMoreLink="/products?sort=latest"
          />
        )}
        {latestProducts?.length === 0 && (
          <p className="text-center text-gray-500">No latest products available!</p>
        )}
        <TopStores/>
      </div>
  </div>
  );
};
