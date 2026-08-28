// apps/user-ui/app/product/[slug]/page.tsx

import { Metadata } from "next";
import React from "react";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import ProductDetails from "apps/user-ui/src/shared/modules/product/product-details";

// Funkcija za dohvatanje podataka o proizvodu (nepromenjena)
async function fetchProductDetails(slug: string) {
  const response = await axiosInstance.get(`/product/api/get-product/${slug}`);
  return response.data.product;
}

// ⭐️ ISPRAVKA ZA generateMetadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>; // <--- Tip je sada Promise
}): Promise<Metadata> {
  const { slug } = await params; // <--- ODMOTAVANJE sa await
  const product = await fetchProductDetails(slug);

  return {
    title: `${product?.title || "Proizvod"} | AK marketplace`,
    description:
      product?.short_description ||
      "Discover high-quality products on AK marketplace",
    openGraph: {
      title: product?.title,
      description: product?.short_description || "",
      images: [product?.images?.[0]?.url || ""],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product?.title,
      description: product?.short_description || "",
      images: [product?.images?.[0]?.url || ""],
    },
  };
}

// ⭐️ ISPRAVKA ZA PAGE komponentu
const Page = async ({
  params,
}: {
  params: Promise<{ slug: string }>; // <--- Tip je sada Promise
}) => {
  const { slug } = await params; // <--- ODMOTAVANJE sa await
  const productDetails = await fetchProductDetails(slug);

  console.log(productDetails);

  return <ProductDetails productDetails={productDetails}/>;
};

export default Page;
