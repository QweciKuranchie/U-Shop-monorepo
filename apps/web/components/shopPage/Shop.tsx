"use client";
import { Brand, Category, Product } from "@repo/sanity";
import {
  parseShopSort,
  SHOP_SORT_OPTIONS,
  type ShopSort,
} from "@repo/sanity/shop";
import React, { useEffect, useState, useTransition } from "react";
import Container from "../Container";
import Title from "../Title";
import CategoryList, { ProductClassificationItem } from "./CategoryList";
import AttributeList, { CONDITIONS, WARRANTIES } from "./AttributeList";
import { Filter, X } from "lucide-react";
import PaginatedProductGrid from "../PaginatedProductGrid";
import NoProductAvailable from "../product/NoProductsAvailable";
import BrandList from "./BrandList";
import { useSearchParams } from "next/navigation";
import PriceList from "./PriceList";

export interface ExtendedProductAttributeValue {
  _key?: string;
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  valueSelect?: string;
  valueMultiSelect?: string[];
  attribute?: {
    _id?: string;
    title?: string;
    slug?: { current?: string };
    type?: string;
  };
}

export interface ExtendedProduct extends Product {
  attributeValues?: ExtendedProductAttributeValue[];
}

interface Props {
  categories: Category[];
  brands: Brand[];
  classifications?: ProductClassificationItem[];
}

const Shop = ({ categories, brands, classifications = [] }: Props) => {
  const searchParams = useSearchParams();
  const brandParams = searchParams?.get("brand");
  const categoryParams = searchParams?.get("category");
  const queryParams = searchParams?.get("query") || searchParams?.get("q");
  const conditionParams = searchParams?.get("condition");
  const priceParams = searchParams?.get("price");
  const sortParams = searchParams?.get("sort");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, startTransition] = useTransition();
  const searchQuery = queryParams || null;
  const [selectedClassification, setSelectedClassification] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParams || null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    brandParams || null
  );
  const [selectedPrice, setSelectedPrice] = useState<string | null>(priceParams || null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(conditionParams || null);
  const [selectedWarranty, setSelectedWarranty] = useState<string | null>(null);
  const [dynamicAttrFilters, setDynamicAttrFilters] = useState<Record<string, string>>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sort, setSort] = useState<ShopSort>(parseShopSort(sortParams));

  // Cascading reset handler when Product Classification changes
  const handleClassificationChange = (classificationSlug: string | null) => {
    setSelectedClassification(classificationSlug);
    // Reset category, attributes, dynamic specs, and dependent values
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedPrice(null);
    setSelectedCondition(null);
    setSelectedWarranty(null);
    setDynamicAttrFilters({});
  };

  // Reset dynamic specs and brand when Category changes
  const handleCategorySelect: React.Dispatch<React.SetStateAction<string | null>> = (value) => {
    const nextCat = typeof value === "function" ? value(selectedCategory) : value;
    setSelectedCategory(nextCat);
    setSelectedBrand(null);
    setDynamicAttrFilters({});
  };

  const handleDynamicAttrChange = (attrKey: string, val: string | null) => {
    setDynamicAttrFilters((prev) => {
      const updated = { ...prev };
      if (val === null) {
        delete updated[attrKey];
      } else {
        updated[attrKey] = val;
      }
      return updated;
    });
  };

  const hasActiveFilters =
    selectedClassification !== null ||
    selectedCategory !== null ||
    selectedBrand !== null ||
    selectedPrice !== null ||
    selectedCondition !== null ||
    selectedWarranty !== null ||
    Object.keys(dynamicAttrFilters).length > 0;

  const handleClearAllFilters = () => {
    setSelectedClassification(null);
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedPrice(null);
    setSelectedCondition(null);
    setSelectedWarranty(null);
    setDynamicAttrFilters({});
  };

  useEffect(() => {
    startTransition(async () => {
      try {
        // Query text/params live in @repo/sanity/shop (unit-tested against the previous
        // query). The projection is slim; `attributeValues` are fetched only while a
        // spec filter needs them.
        const needsSpecs = Object.keys(dynamicAttrFilters).length > 0;
        const qs = new URLSearchParams({ sort });
        if (needsSpecs) qs.set("specs", "1");
        const filters: Record<string, string | null | undefined> = {
          q: searchQuery,
          classification: selectedClassification,
          category: selectedCategory,
          brand: selectedBrand,
          price: selectedPrice,
          condition: selectedCondition,
          warranty: selectedWarranty,
        };
        for (const [k, v] of Object.entries(filters)) if (v) qs.set(k, v);
        // Server endpoint, not Sanity directly: the dataset is private.
        const res = await fetch(`/api/catalog/shop?${qs.toString()}`);
        if (!res.ok) throw new Error(`Catalogue request failed (${res.status})`);
        const data: ExtendedProduct[] = await res.json();

        // Apply Dynamic Spec Filters
        let filteredData = data;
        if (Object.keys(dynamicAttrFilters).length > 0) {
          filteredData = data.filter((product) => {
            return Object.entries(dynamicAttrFilters).every(([key, targetVal]) => {
              if (!targetVal) return true;
              const matchInAttrValues = product.attributeValues?.some((av) => {
                const attrSlug = av.attribute?.slug?.current || av.attribute?._id || "";
                const attrTitle = (av.attribute?.title || "").toLowerCase();
                const keyLower = key.toLowerCase();

                const matchesKey =
                  attrSlug === key ||
                  keyLower.includes(attrSlug) ||
                  attrSlug.includes(keyLower) ||
                  attrTitle.includes(keyLower);

                if (!matchesKey) return false;

                const strVal = String(
                  av.valueString || av.valueSelect || av.valueNumber || ""
                ).toLowerCase();

                const multiArr = Array.isArray(av.valueMultiSelect)
                  ? av.valueMultiSelect.map((v: string) => String(v).toLowerCase())
                  : [];

                const targetLower = targetVal.toLowerCase();

                return (
                  strVal.includes(targetLower) ||
                  targetLower.includes(strVal) ||
                  multiArr.some((m: string) => m.includes(targetLower) || targetLower.includes(m))
                );
              });

              return matchInAttrValues;
            });
          });
        }

        setProducts(filteredData);
      } catch (error) {
        console.error("Shop product fetching error:", error);
      }
    });
  }, [
    searchQuery,
    selectedClassification,
    selectedCategory,
    selectedBrand,
    selectedPrice,
    selectedCondition,
    selectedWarranty,
    dynamicAttrFilters,
    sort,
    startTransition,
  ]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Container className="py-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <Title className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Shop Products
              </Title>
              <p className="text-gray-600 text-sm">
                Discover amazing products tailored to your needs
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="inline-flex items-center px-4 py-2 bg-ushop-pink/10 text-ushop-pink border border-ushop-pink/30 rounded-md hover:bg-ushop-pink hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  Active filters:
                </span>
                {selectedClassification && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-ushop-pink/10 text-ushop-pink border border-ushop-pink/20">
                    Classification:{" "}
                    {
                      classifications?.find(
                        (c) =>
                          c?.slug?.current === selectedClassification ||
                          c?._id === selectedClassification
                      )?.title || selectedClassification
                    }
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-ushop-pink/10 text-ushop-pink border border-ushop-pink/20">
                    Category:{" "}
                    {
                      categories?.find(
                        (cat) => cat?.slug?.current === selectedCategory
                      )?.title || selectedCategory
                    }
                  </span>
                )}
                {Object.entries(dynamicAttrFilters).map(([k, v]) => (
                  <span
                    key={k}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-ushop-pink/10 text-ushop-pink border border-ushop-pink/20"
                  >
                    Spec ({k}): {v}
                  </span>
                ))}
                {selectedBrand && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-ushop-pink/10 text-ushop-pink border border-ushop-pink/20">
                    Brand:{" "}
                    {
                      brands?.find(
                        (brand: Brand) => brand?.slug?.current === selectedBrand
                      )?.name
                    }
                  </span>
                )}
                {selectedPrice && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-ushop-pink/10 text-ushop-pink border border-ushop-pink/20">
                    Price: GH₵{selectedPrice.replace("-", " - GH₵")}
                  </span>
                )}
                {selectedCondition && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-ushop-pink/10 text-ushop-pink border border-ushop-pink/20">
                    Condition:{" "}
                    {CONDITIONS.find((c) => c.value === selectedCondition)?.label}
                  </span>
                )}
                {selectedWarranty && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-ushop-pink/10 text-ushop-pink border border-ushop-pink/20">
                    Warranty:{" "}
                    {WARRANTIES.find((w) => w.value === selectedWarranty)?.label}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-ushop-pink/10 hover:text-ushop-pink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ushop-pink transition-colors duration-200"
          >
            <Filter className="w-4 h-4 mr-2 text-ushop-pink" />
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
            {hasActiveFilters && (
              <span className="ml-2 bg-ushop-pink text-white text-xs px-2 py-1 rounded-full">
                {
                  [
                    selectedClassification,
                    selectedCategory,
                    selectedBrand,
                    selectedPrice,
                    selectedCondition,
                    selectedWarranty,
                    ...Object.values(dynamicAttrFilters),
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Filter Overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl max-h-[85vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-600 hover:text-ushop-pink" />
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  <CategoryList
                    classifications={classifications}
                    selectedClassification={selectedClassification}
                    onClassificationChange={handleClassificationChange}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={handleCategorySelect}
                  />
                  <BrandList
                    brands={brands}
                    setSelectedBrand={setSelectedBrand}
                    selectedBrand={selectedBrand}
                    selectedCategory={selectedCategory}
                    categories={categories}
                  />
                  <PriceList
                    setSelectedPrice={setSelectedPrice}
                    selectedPrice={selectedPrice}
                  />
                  <AttributeList
                    selectedCategory={selectedCategory}
                    categories={categories}
                    dynamicAttrFilters={dynamicAttrFilters}
                    onDynamicAttrChange={handleDynamicAttrChange}
                    selectedCondition={selectedCondition}
                    setSelectedCondition={setSelectedCondition}
                    selectedWarranty={selectedWarranty}
                    setSelectedWarranty={setSelectedWarranty}
                  />
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearAllFilters}
                      className="w-1/3 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 bg-ushop-pink text-white py-3 px-4 rounded-lg font-medium hover:bg-ushop-pink/90 transition-colors duration-200"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-ushop-pink" /> Filters
                  </h3>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearAllFilters}
                      className="text-xs text-ushop-pink hover:underline font-semibold"
                    >
                      Reset All
                    </button>
                  )}
                </div>
                <div className="divide-y divide-gray-100 max-h-[calc(100vh-120px)] overflow-y-auto">
                  <CategoryList
                    classifications={classifications}
                    selectedClassification={selectedClassification}
                    onClassificationChange={handleClassificationChange}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={handleCategorySelect}
                  />
                  <BrandList
                    brands={brands}
                    setSelectedBrand={setSelectedBrand}
                    selectedBrand={selectedBrand}
                    selectedCategory={selectedCategory}
                    categories={categories}
                  />
                  <PriceList
                    setSelectedPrice={setSelectedPrice}
                    selectedPrice={selectedPrice}
                  />
                  <AttributeList
                    selectedCategory={selectedCategory}
                    categories={categories}
                    dynamicAttrFilters={dynamicAttrFilters}
                    onDynamicAttrChange={handleDynamicAttrChange}
                    selectedCondition={selectedCondition}
                    setSelectedCondition={setSelectedCondition}
                    selectedWarranty={selectedWarranty}
                    setSelectedWarranty={setSelectedWarranty}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse"
                      >
                        <div className="aspect-square bg-gray-200"></div>
                        <div className="p-4 space-y-3">
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-8 bg-gray-200 rounded w-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products?.length > 0 ? (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
                        {products.length} Product
                        {products.length !== 1 ? "s" : ""} Found
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <label htmlFor="shop-sort" className="whitespace-nowrap">
                          Sort by
                        </label>
                        <select
                          id="shop-sort"
                          value={sort}
                          onChange={(e) => {
                            const next = parseShopSort(e.target.value);
                            setSort(next);
                            // Keep the choice shareable and across reloads without a navigation.
                            const url = new URL(window.location.href);
                            if (next === "name-asc") url.searchParams.delete("sort");
                            else url.searchParams.set("sort", next);
                            window.history.replaceState(null, "", url);
                          }}
                          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900"
                        >
                          {SHOP_SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <PaginatedProductGrid products={products} initialLimit={12} incrementBy={12} />
                  </div>
                ) : (
                  <div className="py-12">
                    <NoProductAvailable className="bg-transparent" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Shop;
