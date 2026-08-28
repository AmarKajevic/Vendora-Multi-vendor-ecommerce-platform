"use client";

import Breadcrumbs from "apps/admin-ui/src/shared/components/breadcrumbs";
import axiosInstance from "apps/admin-ui/src/shared/utils/axiosInstance";
import React, { useEffect, useState } from "react";

const tabs = ["Categories", "Logo", "Banner"];

const Customization = () => {
  const [activeTab, setActiveTab] = useState("Categories");
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<Record<string, string[]>>(
    {}
  );
  const [logo, setLogo] = useState<string | null>(null);
  // banner sada čuvamo kao niz stringova
  const [banners, setBanners] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  // State za upload (logo i banner)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Fetch podataka
  useEffect(() => {
    const fetchCustomizations = async () => {
      try {
        const res = await axiosInstance.get("/admin/api/get-all");
        const data = res.data;
        setCategories(data.categories || []);
        setSubCategories(data.subCategories || {});
        setLogo(data.logo || null);

        const bannerData = data.banner;
        if (Array.isArray(bannerData)) {
          setBanners(bannerData);
        } else if (typeof bannerData === "string") {
          setBanners(bannerData ? [bannerData] : []);
        } else {
          setBanners([]);
        }
      } catch (error) {
        console.error("Error fetching customizations:", error);
      }
    };

    fetchCustomizations();
  }, []);

  // Dodavanje kategorije
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    

    try {
      setIsAddingCategory(true);
      await axiosInstance.post("/admin/api/add-category", {
        category: newCategory,
      });
      setCategories((prev) => [...prev, newCategory]);
      setNewCategory("");
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setIsAddingCategory(false);
    }
  };

  // Dodavanje subkategorije
  const handleAddSubcategory = async () => {
    if (!newSubCategory.trim() || !selectedCategory) return;

    try {
      setIsAddingSubCategory(true);
      await axiosInstance.post("/admin/api/add-subcategory", {
        category: selectedCategory,
        subCategory: newSubCategory,
      });
      setSubCategories((prev) => ({
        ...prev,
        [selectedCategory]: [...(prev[selectedCategory] || []), newSubCategory],
      }));
      setNewSubCategory("");
    } catch (error) {
      console.error("Error adding subcategory:", error);
    } finally {
      setIsAddingSubCategory(false);
    }
  };

  // Upload loga (jedna slika)
const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Konvertuj u Base64
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64 = (reader.result as string).split(',')[1]; // ukloni "data:image/..."
    try {
      setIsUploadingLogo(true);
      const res = await axiosInstance.post("/admin/api/upload-logo", {
        fileName: file.name,
        fileData: base64,
      });
      setLogo(res.data.logoUrl);
    } catch (error) {
      console.error("Error uploading logo:", error);
    } finally {
      setIsUploadingLogo(false);
    }
  };
  reader.readAsDataURL(file);
};

  // Upload bannera (više slika)
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const filePromises = Array.from(files).map((file) => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  });

  try {
    setIsUploadingBanner(true);
    const base64Files = await Promise.all(filePromises);
    const res = await axiosInstance.post("/admin/api/upload-banner", {
      files: base64Files.map((data, i) => ({
        fileName: files[i].name,
        fileData: data,
      })),
    });
    setBanners(res.data.allBanners || []);
  } catch (error) {
    console.error("Error uploading banners:", error);
  } finally {
    setIsUploadingBanner(false);
    e.target.value = "";
  }
};
  // (Opciono) Brisanje pojedinačne banner slike – implementiraj po potrebi
  // Ovdje nije uključeno, ali možeš dodati endpoint za uklanjanje

  // ---------- RENDER TABOVA ----------
  const renderCategoriesTab = () => (
    <div className="mt-6 space-y-6">
      {/* Grid kategorija sa subkategorijama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <p className="text-gray-400 col-span-full">No categories yet.</p>
        ) : (
          categories.map((category) => (
            <div key={category} className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {subCategories[category]?.length > 0 ? (
                  subCategories[category].map((sub) => (
                    <span
                      key={sub}
                      className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-full"
                    >
                      {sub}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No subcategories</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dodavanje kategorije */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Add New Category</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddCategory}
            disabled={isAddingCategory || !newCategory.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md transition-colors"
          >
            {isAddingCategory ? "Adding..." : "Add Category"}
          </button>
        </div>
      </div>

      {/* Dodavanje subkategorije */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Add New Subcategory</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 sm:w-48"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newSubCategory}
            onChange={(e) => setNewSubCategory(e.target.value)}
            placeholder="Enter subcategory name..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddSubcategory}
            disabled={
              isAddingSubCategory || !newSubCategory.trim() || !selectedCategory
            }
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md transition-colors"
          >
            {isAddingSubCategory ? "Adding..." : "Add Subcategory"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderLogoTab = () => (
    <div className="mt-6 bg-gray-900 rounded-lg p-6">
      <h3 className="text-white text-lg font-semibold mb-4">Current Logo</h3>
      <div className="flex flex-col items-center gap-6">
        <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center w-64 h-64">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt="Logo"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <p className="text-gray-400">No logo uploaded</p>
          )}
        </div>
        <div>
          <label
            className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors inline-block ${
              isUploadingLogo ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {isUploadingLogo ? "Uploading..." : "Choose File"}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              disabled={isUploadingLogo}
            />
          </label>
          <p className="text-gray-400 text-sm mt-2">
            Recommended: PNG, JPG, SVG (max 2MB)
          </p>
        </div>
      </div>
    </div>
  );

  const renderBannerTab = () => (
    <div className="mt-6 bg-gray-900 rounded-lg p-6">
      <h3 className="text-white text-lg font-semibold mb-4">Current Banners</h3>
      <div className="flex flex-col items-center gap-6">
        {/* Prikaz svih banner slika u gridu */}
        {banners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {banners.map((url, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-2 flex items-center justify-center h-40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Banner ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center w-full h-40">
            <p className="text-gray-400">No banners uploaded</p>
          </div>
        )}

        {/* Upload više slika */}
        <div>
          <label
            className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors inline-block ${
              isUploadingBanner ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {isUploadingBanner ? "Uploading..." : "Choose Files"}
            <input
              type="file"
              accept="image/*"
              multiple // omogućava odabir više slika
              onChange={handleBannerUpload}
              className="hidden"
              disabled={isUploadingBanner}
            />
          </label>
          <p className="text-gray-400 text-sm mt-2">
            Recommended: PNG, JPG, SVG (max 2MB each). You can select multiple.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen p-8 bg-black">
      <h2 className="text-2xl text-white font-semibold mb-2">Customization</h2>
      <Breadcrumbs title="Customization" />

      {/* Tab navigacija */}
      <div className="flex items-center gap-6 mt-6 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sadržaj taba */}
      <div>
        {activeTab === "Categories" && renderCategoriesTab()}
        {activeTab === "Logo" && renderLogoTab()}
        {activeTab === "Banner" && renderBannerTab()}
      </div>
    </div>
  );
};

export default Customization;