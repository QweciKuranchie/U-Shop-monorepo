"use client";

import { useCallback, useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brand, Category } from "@repo/sanity";
import {
  catalogParamsToSearchParams,
  paginationWindow,
  totalPages,
  CATALOG_PAGE_SIZE,
  toProduct,
  type CatalogParams,
  type CatalogProduct,
} from "@repo/sanity/catalog";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import NoProductsAvailable from "./product/NoProductsAvailable";
import {
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Separator,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Checkbox,
  Slider,
} from "@repo/ui";

interface Props {
  /** One page of products, already filtered and sorted by the server. */
  items: CatalogProduct[];
  /** Number of products matching the current filters (across all pages). */
  total: number;
  /** Validated filters/sort/page parsed from the URL on the server. */
  params: CatalogParams;
  /** Upper bound for the price slider. */
  maxPrice: number;
  categories: Category[];
  brands: Brand[];
}

type SortOption = CatalogParams["sort"];

const SEARCH_DEBOUNCE_MS = 350;
const PRICE_DEBOUNCE_MS = 450;
const normalizeQuery = (q: string) => q.replace(/\s+/g, " ").trim();

const ProductCatalog = ({ items, total, params, maxPrice, categories, brands }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const resultsRef = useRef<HTMLDivElement>(null);
  const maxObservedPrice = maxPrice;

  // The URL is the single source of truth, so every filtered/paged view is
  // shareable, bookmarkable and works with the back button. `view` is what the
  // UI shows: it reflects a click instantly (optimistic) and settles on the
  // server-confirmed `params` once navigation completes.
  const [view, setOptimistic] = useOptimistic(params);
  const latest = useRef(params); // lets rapid successive changes build on each other
  useEffect(() => {
    latest.current = params;
  }, [params]);

  const navigate = useCallback(
    (next: Partial<CatalogParams>) => {
      // Any change to the filters returns to page 1; only the pager sets `page`.
      const merged: CatalogParams = { ...latest.current, ...next, page: next.page ?? 1 };
      latest.current = merged;
      const qs = catalogParamsToSearchParams(merged).toString();
      startTransition(() => {
        setOptimistic(merged);
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, setOptimistic]
  );

  // ---- Search (debounced; local text so typing never lags) -------------------
  const [searchText, setSearchText] = useState(params.q);
  const lastSentQuery = useRef(params.q);
  useEffect(() => {
    // Adopt the URL's value only when it changed from elsewhere (back/forward,
    // reset) - never overwrite text the user kept typing while a request was in flight.
    if (params.q !== lastSentQuery.current) {
      lastSentQuery.current = params.q;
      setSearchText(params.q);
    }
  }, [params.q]);
  useEffect(() => {
    const q = normalizeQuery(searchText);
    if (q === lastSentQuery.current) return;
    const timer = setTimeout(() => {
      lastSentQuery.current = q;
      navigate({ q });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText, navigate]);
  const searchQuery = searchText;
  const setSearchQuery = (q: string) => setSearchText(q);

  // ---- Price (slider moves smoothly; the request is debounced) ---------------
  const priceKey = (min: number | null, max: number | null) => `${min ?? ""}|${max ?? ""}`;
  const [priceRange, setPriceRangeState] = useState<[number, number]>([
    params.minPrice ?? 0,
    params.maxPrice ?? maxObservedPrice,
  ]);
  const lastSentPrice = useRef(priceKey(params.minPrice, params.maxPrice));
  const priceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (priceKey(params.minPrice, params.maxPrice) !== lastSentPrice.current) {
      lastSentPrice.current = priceKey(params.minPrice, params.maxPrice);
      setPriceRangeState([params.minPrice ?? 0, params.maxPrice ?? maxObservedPrice]);
    }
  }, [params.minPrice, params.maxPrice, maxObservedPrice]);
  useEffect(() => () => clearTimeout(priceTimer.current), []);
  const setPriceRange = (val: [number, number]) => {
    setPriceRangeState(val);
    clearTimeout(priceTimer.current);
    priceTimer.current = setTimeout(() => {
      const minPrice = val[0] > 0 ? val[0] : null;
      const maxP = val[1] < maxObservedPrice ? val[1] : null;
      lastSentPrice.current = priceKey(minPrice, maxP);
      navigate({ minPrice, maxPrice: maxP });
    }, PRICE_DEBOUNCE_MS);
  };

  // ---- Filters that act immediately -----------------------------------------
  const selectedCategories = view.categories;
  const selectedBrands = view.brands;
  const selectedConditions = view.conditions;
  const sortBy: SortOption = view.sort;
  const setSortBy = (sort: SortOption) => navigate({ sort });

  const setSelectedConditions = (
    update: string[] | ((prev: string[]) => string[])
  ) =>
    navigate({
      conditions: typeof update === "function" ? update(latest.current.conditions) : update,
    });
  const toggleIn = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  const toggleCategory = (categoryId: string) =>
    navigate({ categories: toggleIn(latest.current.categories, categoryId) });
  const toggleBrand = (brandId: string) =>
    navigate({ brands: toggleIn(latest.current.brands, brandId) });

  const [viewMode, setViewMode] = useState<"grid" | "large">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState({
    categories: true,
    brands: true,
    price: true,
    conditions: true,
  });

  const resetFilters = () => {
    clearTimeout(priceTimer.current);
    lastSentQuery.current = "";
    lastSentPrice.current = priceKey(null, null);
    setSearchText("");
    setPriceRangeState([0, maxObservedPrice]);
    latest.current = { ...latest.current, q: "", categories: [], brands: [], conditions: [], minPrice: null, maxPrice: null, sort: "name-asc", page: 1 };
    startTransition(() => {
      setOptimistic(latest.current);
      router.push(pathname, { scroll: false });
    });
  };

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    selectedCategories.length +
    selectedBrands.length +
    selectedConditions.length +
    (priceRange[0] > 0 || priceRange[1] < maxObservedPrice ? 1 : 0);

  // ---- Pagination -------------------------------------------------------------
  const pages = totalPages(total);
  const page = params.page;
  const firstShown = total === 0 ? 0 : (page - 1) * CATALOG_PAGE_SIZE + 1;
  const lastShown = Math.min(total, firstShown + items.length - 1);
  const pageHref = (n: number) => {
    const qs = catalogParamsToSearchParams({ ...params, page: n }).toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // After paging (or a filter change that resets to page 1) bring the top of the results into view.
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page, total]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(value: string | null) => {
                if (value) {
                  setSortBy(value as SortOption);
                }
              }}
            >
              <SelectTrigger className="flex-1 lg:flex-none lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="price-low">Price Low to High</SelectItem>
                <SelectItem value="price-high">Price High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md flex-shrink-0">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "large" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("large")}
                className="rounded-l-none"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative flex-shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 px-1.5 py-0.5 text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-sm font-medium text-gray-600">
              Active filters:
            </span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSearchQuery("")}
                />
              </Badge>
            )}
            {selectedCategories.map((catId) => {
              const category = categories.find((c) => c._id === catId);
              return category ? (
                <Badge key={catId} variant="secondary" className="gap-1">
                  {category.title}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => toggleCategory(catId)}
                  />
                </Badge>
              ) : null;
            })}
            {selectedBrands.map((brandId) => {
              const brand = brands.find((b) => b._id === brandId);
              return brand ? (
                <Badge key={brandId} variant="secondary" className="gap-1">
                  {brand.name}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => toggleBrand(brandId)}
                  />
                </Badge>
              ) : null;
            })}
            {selectedConditions.map((condId) => (
              <Badge key={condId} variant="secondary" className="gap-1 capitalize">
                {condId.replace("_", " ")}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() =>
                    setSelectedConditions((prev) =>
                      prev.filter((id) => id !== condId)
                    )
                  }
                />
              </Badge>
            ))}
            {(priceRange[0] > 0 || priceRange[1] < maxObservedPrice) && (
              <Badge variant="secondary" className="gap-1">
                GH₵{priceRange[0]} - GH₵{priceRange[1]}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setPriceRange([0, maxObservedPrice])}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="ml-auto"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full lg:w-80 bg-white rounded-lg border shadow-sm p-6 h-fit lg:sticky lg:top-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Categories */}
                <Collapsible
                  open={isFilterOpen.categories}
                  onOpenChange={(open) =>
                    setIsFilterOpen((prev) => ({ ...prev, categories: open }))
                  }
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                    <span className="font-medium">Categories</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isFilterOpen.categories ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2">
                    {categories.map((category) => (
                      <div
                        key={category._id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={category._id}
                          checked={selectedCategories.includes(category._id)}
                          onCheckedChange={() => toggleCategory(category._id)}
                        />
                        <label
                          htmlFor={category._id}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {category.title}
                        </label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Brands */}
                <Collapsible
                  open={isFilterOpen.brands}
                  onOpenChange={(open) =>
                    setIsFilterOpen((prev) => ({ ...prev, brands: open }))
                  }
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                    <span className="font-medium">Brands</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isFilterOpen.brands ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2">
                    {brands.map((brand) => (
                      <div
                        key={brand._id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={brand._id}
                          checked={selectedBrands.includes(brand._id)}
                          onCheckedChange={() => toggleBrand(brand._id)}
                        />
                        <label
                          htmlFor={brand._id}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {brand.name}
                        </label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Item Condition */}
                <Collapsible
                  open={isFilterOpen.conditions}
                  onOpenChange={(open) =>
                    setIsFilterOpen((prev) => ({ ...prev, conditions: open }))
                  }
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                    <span className="font-medium">Item Condition</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isFilterOpen.conditions ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2">
                    {[
                      { id: "new", label: "Brand New" },
                      { id: "refurbished", label: "Refurbished" },
                      { id: "like_new", label: "Like New" },
                      { id: "excellent", label: "Excellent" },
                      { id: "good", label: "Good" },
                      { id: "fair", label: "Fair" },
                      { id: "for_parts", label: "For Parts" },
                    ].map((cond) => (
                      <div
                        key={cond.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={cond.id}
                          checked={selectedConditions.includes(cond.id)}
                          onCheckedChange={() => {
                            setSelectedConditions((prev) =>
                              prev.includes(cond.id)
                                ? prev.filter((id) => id !== cond.id)
                                : [...prev, cond.id]
                            );
                          }}
                        />
                        <label
                          htmlFor={cond.id}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {cond.label}
                        </label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Price Range */}
                <Collapsible
                  open={isFilterOpen.price}
                  onOpenChange={(open) =>
                    setIsFilterOpen((prev) => ({ ...prev, price: open }))
                  }
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                    <span className="font-medium">Price Range</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isFilterOpen.price ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-4">
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={(value) =>
                          setPriceRange(value as [number, number])
                        }
                        max={maxObservedPrice}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>GH₵{priceRange[0]}</span>
                      <span>GH₵{priceRange[1]}</span>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <div className="flex-1 scroll-mt-4" ref={resultsRef}>
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600" aria-live="polite">
              {total === 0
                ? "No products found"
                : `Showing ${firstShown}-${lastShown} of ${total} products`}
            </p>
          </div>

          {/* Products */}
          {items.length > 0 ? (
            <div
              aria-busy={isPending}
              className={`grid gap-4 transition-opacity ${isPending ? "opacity-60" : ""} ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              <AnimatePresence>
                {items.map((product, index) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard product={toProduct(product)} priority={index < 4} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <NoProductsAvailable className="bg-white rounded-lg" />
          )}

          {/* Pager: real links, so pages are crawlable, shareable and work without JS */}
          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-1">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} scroll={false} rel="prev" className="inline-flex h-9 items-center gap-1 rounded-md border bg-white px-3 text-sm hover:bg-gray-50">
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Link>
              ) : (
                <span aria-disabled="true" className="inline-flex h-9 items-center gap-1 rounded-md border bg-gray-50 px-3 text-sm text-gray-500">
                  <ChevronLeft className="h-4 w-4" /> Previous
                </span>
              )}
              {paginationWindow(page, pages).map((n, i) =>
                n === "…" ? (
                  <span key={`gap-${i}`} aria-hidden="true" className="px-2 text-gray-500">…</span>
                ) : (
                  <Link
                    key={n}
                    href={pageHref(n)}
                    scroll={false}
                    aria-label={`Page ${n}`}
                    aria-current={n === page ? "page" : undefined}
                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm ${
                      n === page ? "border-ushop-purple bg-ushop-purple font-semibold text-white" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {n}
                  </Link>
                )
              )}
              {page < pages ? (
                <Link href={pageHref(page + 1)} scroll={false} rel="next" className="inline-flex h-9 items-center gap-1 rounded-md border bg-white px-3 text-sm hover:bg-gray-50">
                  Next <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span aria-disabled="true" className="inline-flex h-9 items-center gap-1 rounded-md border bg-gray-50 px-3 text-sm text-gray-500">
                  Next <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;