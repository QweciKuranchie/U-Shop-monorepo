"use client"
import React, { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "motion/react";
import HomeTabbar from "./HomeTabBar";
import { productType } from "@/Constants/data";
import NoProductsAvailable from "./product/NoProductsAvailable";
import {
  Grid3X3,
  LayoutGrid,
  List,
  Filter,
  SortAsc,
  Eye,
  Target,
  Coins,
  Package,
  Award,
  ShoppingBag,
  Flame,
  Loader2,
  Check,
  Trash2,
  X,
} from "lucide-react";
import Container from "./Container";
import { Product } from "@repo/sanity";
import {  Button  } from "@repo/ui";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
 } from "@repo/ui";
import {  Input  } from "@repo/ui";
import {  Label  } from "@repo/ui";
import {  Card, CardContent  } from "@repo/ui";
import {  Badge  } from "@repo/ui";
import {  Slider  } from "@repo/ui";
import {  Separator  } from "@repo/ui";

type ViewMode = "grid-2" | "grid-3" | "grid-4" | "grid-5" | "list";
type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "newest";

interface ViewModeButtonProps {
  mode: ViewMode;
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

const ViewModeButton = ({
  mode,
  currentMode,
  onModeChange,
  icon,
  label,
  className = "",
}: ViewModeButtonProps) => (
  <Button
    variant={currentMode === mode ? "default" : "outline"}
    size="sm"
    onClick={() => onModeChange(mode)}
    className={`p-2 hoverEffect ${
      currentMode === mode
        ? "bg-ushop-purple hover:bg-ushop-purple-dark border-ushop-purple"
        : "hover:border-ushop-purple hover:text-ushop-purple"
    } ${className}`}
    title={label}
  >
    {icon}
  </Button>
);

interface ProductGridClientProps {
  /** Featured products fetched on the server; tabs and sorting work on this list. */
  products: Product[];
}

const ProductGridClient = ({ products: allProducts }: ProductGridClientProps) => {
  const [selectedTab, setSelectedTab] = useState(productType[0]?.title || "");
  const [viewMode, setViewMode] = useState<ViewMode>("grid-4");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [showFilters, setShowFilters] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [stockStatus, setStockStatus] = useState<string>("all");
  const [rating, setRating] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [warrantyFilter, setWarrantyFilter] = useState<string>("all");

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayLimit((prev) => prev + 12);
      setIsLoadingMore(false);
    }, 300);
  };

  // Tab and sort are applied here so switching is instant and needs no request.
  const products = useMemo(() => {
    const variant = selectedTab.toLowerCase();
    const matches = (v?: string | null) => !!v && v.toLowerCase().startsWith(variant);
    const price = (p: Product) => p.price || 0;
    const byTab =
      variant === "all" || variant === ""
        ? allProducts
        : allProducts.filter((p) => {
            const rec = p as unknown as Record<string, unknown>;
            const cls = rec.productClassification as { title?: string; slug?: { current?: string } } | null | undefined;
            return matches(cls?.title) || matches(cls?.slug?.current) || matches(rec.variant as string | undefined);
          });
    const sorted = [...byTab];
    switch (sortBy) {
      case "name-desc":
        sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "price-asc":
        sorted.sort((a, b) => price(a) - price(b));
        break;
      case "price-desc":
        sorted.sort((a, b) => price(b) - price(a));
        break;
      case "newest":
        sorted.sort((a, b) => String(b._createdAt ?? "").localeCompare(String(a._createdAt ?? "")));
        break;
      default:
        sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return sorted;
  }, [allProducts, selectedTab, sortBy]);

  // Apply filters to products using useMemo instead of useEffect state sync
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by price range
    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      filtered = filtered.filter((product) => {
        const price = product.price || 0;
        const finalPrice = product.discount
          ? price - price * (product.discount / 100)
          : price;
        return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
      });
    }

    // Filter by stock status
    if (stockStatus !== "all") {
      filtered = filtered.filter((product) => {
        if (stockStatus === "in-stock") {
          return (product.stock || 0) > 0;
        } else if (stockStatus === "out-of-stock") {
          return (product.stock || 0) === 0;
        }
        return true;
      });
    }

    // Filter by status/condition
    if (rating !== "all") {
      filtered = filtered.filter((product) => {
        if (rating === "5") {
          return product.status === "hot";
        } else if (rating === "4") {
          return product.status === "hot" || product.status === "new";
        } else if (rating === "3") {
          return (
            product.status === "hot" ||
            product.status === "new" ||
            product.status === "like_new" ||
            product.status === "excellent" ||
            product.status === "good"
          );
        }
        return true;
      });
    }

    // Filter by specific condition attribute
    if (conditionFilter !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.status === conditionFilter ||
          (product as Record<string, unknown>).attributes === conditionFilter
      );
    }

    // Filter by warranty type attribute
    if (warrantyFilter !== "all") {
      filtered = filtered.filter(
        (product) => (product as Record<string, unknown>).warrantyType === warrantyFilter
      );
    }

    return filtered;
  }, [products, priceRange, stockStatus, rating, conditionFilter, warrantyFilter]);

  const getGridClasses = () => {
    switch (viewMode) {
      case "grid-2":
        return "grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-3 sm:gap-5";
      case "grid-3":
        return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4";
      case "grid-4":
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4";
      case "grid-5":
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5";
      case "list":
        return "grid-cols-1 gap-3 sm:gap-4";
      default:
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4";
    }
  };

  return (
    <Container className="flex flex-col lg:px-0 mt-16 lg:mt-24">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-3 sm:mb-4">
          <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-ushop-purple rounded-full"></div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-dark-color">
            Featured Products
          </h2>
          <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-ushop-purple rounded-full"></div>
        </div>
        <p className="text-light-color text-xs sm:text-sm md:text-base max-w-2xl mx-auto px-4">
          Browse our handpicked selection of top quality tech items
        </p>
      </div>

      {/* Enhanced Controls Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-ushop-purple/10 p-6 mb-8">
        {/* Tab Bar */}
        <HomeTabbar selectedTab={selectedTab} onTabSelect={setSelectedTab} />

        {/* Advanced Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
          {/* Left Side - View Options */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* View Mode Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-dark-color hidden sm:block">
                View:
              </span>
              <div className="flex flex-wrap items-center gap-1">
                <ViewModeButton
                  mode="grid-2"
                  currentMode={viewMode}
                  onModeChange={setViewMode}
                  icon={<Grid3X3 size={16} />}
                  label="2 Columns"
                />
                <ViewModeButton
                  mode="grid-3"
                  currentMode={viewMode}
                  onModeChange={setViewMode}
                  icon={<LayoutGrid size={16} />}
                  label="3 Columns"
                />
                <ViewModeButton
                  mode="grid-4"
                  currentMode={viewMode}
                  onModeChange={setViewMode}
                  icon={<LayoutGrid size={16} />}
                  label="4 Columns"
                  className="hidden sm:inline-flex"
                />
                <ViewModeButton
                  mode="grid-5"
                  currentMode={viewMode}
                  onModeChange={setViewMode}
                  icon={<LayoutGrid size={16} />}
                  label="5 Columns"
                  className="hidden md:inline-flex"
                />
                <ViewModeButton
                  mode="list"
                  currentMode={viewMode}
                  onModeChange={setViewMode}
                  icon={<List size={16} />}
                  label="List View"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 hoverEffect ${
                showFilters
                  ? "bg-ushop-purple hover:bg-ushop-purple-dark border-ushop-purple"
                  : "hover:border-ushop-purple hover:text-ushop-purple"
              }`}
            >
              <Filter size={16} />
              <span>Filters</span>
            </Button>
          </div>

          {/* Right Side - Sort and Info */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full lg:w-auto">
            {/* Sort Selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SortAsc size={16} className="text-light-color flex-shrink-0" />
              <Select
                value={sortBy}
                onValueChange={(value: string | null) => {
                if (value) {
                  setSortBy(value as SortOption);
                }
              }}
              >
                <SelectTrigger className="w-full sm:w-48 border-gray-200 focus:border-ushop-purple">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">
                    Price (High to Low)
                  </SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Count */}
            <div className="flex items-center gap-2 text-sm text-light-color">
              <Eye size={16} />
              <Badge
                variant="secondary"
                className="bg-ushop-pink/10 text-ushop-purple"
              >
                {filteredProducts.length} products
              </Badge>
            </div>
          </div>
        </div>

        {/* Expandable Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Separator className="my-6" />
              <Card className="border-ushop-purple/20 bg-white">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-dark-color flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-ushop-purple" /> Advanced Filters
                    </h3>
                    <p className="text-sm text-light-color">
                      Fine-tune your search to find exactly what you&apos;re
                      looking for
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Price Range Filter */}
                    <div className="space-y-4 p-4 bg-white rounded-xl border border-ushop-purple/10 shadow-sm">
                      <Label className="text-sm font-bold text-dark-color flex items-center gap-2">
                        <Coins className="w-4 h-4 text-ushop-pink" /> Price Range
                      </Label>
                      <div className="space-y-4">
                        <div className="px-2">
                          <Slider
                            value={priceRange}
                            onValueChange={(value) => setPriceRange(value as number[])}
                            max={1000}
                            min={0}
                            step={10}
                            className="w-full"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label className="text-xs text-light-color">
                              Min Price
                            </Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={priceRange[0]}
                              onChange={(e) =>
                                setPriceRange([
                                  parseInt(e.target.value) || 0,
                                  priceRange[1],
                                ])
                              }
                              className="h-9 border-gray-200 focus:border-ushop-purple"
                            />
                          </div>
                          <div className="text-light-color font-bold pt-5">
                            -
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-light-color">
                              Max Price
                            </Label>
                            <Input
                              type="number"
                              placeholder="1000"
                              value={priceRange[1]}
                              onChange={(e) =>
                                setPriceRange([
                                  priceRange[0],
                                  parseInt(e.target.value) || 1000,
                                ])
                              }
                              className="h-9 border-gray-200 focus:border-ushop-purple"
                            />
                          </div>
                        </div>
                        <div className="text-center">
                          <Badge className="bg-ushop-purple/10 text-ushop-purple border-ushop-purple/20">
                            ₵{priceRange[0]} - ₵{priceRange[1]}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Stock Status Filter */}
                    <div className="space-y-4 p-4 bg-white rounded-xl border border-ushop-purple/10 shadow-sm">
                      <Label className="text-sm font-bold text-dark-color flex items-center gap-2">
                        <Package className="w-4 h-4 text-ushop-pink" /> Stock Status
                      </Label>
                      <Select
                        value={stockStatus}
                        onValueChange={(value: string | null) => {
                          if (value) {
                            setStockStatus(value);
                          }
                        }}
                      >
                        <SelectTrigger className="border-gray-200 focus:border-ushop-purple h-10">
                          <SelectValue placeholder="Select status..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              All Products
                            </span>
                          </SelectItem>
                          <SelectItem value="in-stock">
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              In Stock
                            </span>
                          </SelectItem>
                          <SelectItem value="out-of-stock">
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              Out of Stock
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {stockStatus && stockStatus !== "all" && (
                        <div className="text-center">
                          <Badge
                            variant="outline"
                            className={`w-fit flex items-center justify-center gap-1.5 mx-auto ${
                              stockStatus === "in-stock"
                                ? "border-green-300 text-green-600"
                                : "border-ushop-red/30 text-ushop-red"
                            }`}
                          >
                            {stockStatus === "in-stock" ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> In Stock Only
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5" /> Out of Stock Only
                              </>
                            )}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Quality Filter */}
                    <div className="space-y-4 p-4 bg-white rounded-xl border border-ushop-purple/10 shadow-sm">
                      <Label className="text-sm font-bold text-dark-color flex items-center gap-2">
                        <Award className="w-4 h-4 text-ushop-pink" /> Product Quality
                      </Label>
                      <Select
                        value={rating}
                        onValueChange={(value: string | null) => {
                          if (value) {
                            setRating(value);
                          }
                        }}
                      >
                        <SelectTrigger className="border-gray-200 focus:border-ushop-purple h-10">
                          <SelectValue placeholder="Select quality..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            <span className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-zinc-600" /> All Products
                            </span>
                          </SelectItem>
                          <SelectItem value="5">
                            <span className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-ushop-pink" /> Hot Products (Premium)
                            </span>
                          </SelectItem>
                          <SelectItem value="4">
                            <span className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-ushop-pink" /> New & Hot (High Quality)
                            </span>
                          </SelectItem>
                          <SelectItem value="3">
                            <span className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-zinc-600" /> All Available (Standard+)
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {rating && rating !== "all" && (
                        <div className="text-center">
                          <Badge
                            variant="outline"
                            className="w-fit flex items-center justify-center gap-1.5 mx-auto border-ushop-pink/30 text-ushop-pink"
                          >
                            {rating === "5" ? (
                              <>
                                <Flame className="w-3.5 h-3.5" /> Premium Only
                              </>
                            ) : rating === "4" ? (
                              <>
                                <Award className="w-3.5 h-3.5" /> High Quality+
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5 text-zinc-600" /> Standard+
                              </>
                            )}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 justify-end p-4 bg-ushop-pink/5 rounded-xl border border-ushop-purple/10">
                      <div className="text-center mb-2">
                        <Label className="text-sm font-bold text-dark-color">
                          Quick Actions
                        </Label>
                      </div>
                      <Button
                        className="w-full bg-ushop-purple hover:bg-ushop-purple-dark text-white font-semibold shadow-lg hover:shadow-xl hoverEffect transform"
                        onClick={() => {
                          // Filters are applied live automatically
                        }}
                      >
                        <Check className="w-4 h-4 mr-1.5" /> Apply Filters ({filteredProducts.length})
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-ushop-purple/20 hover:border-ushop-purple hover:bg-ushop-purple/5 text-ushop-purple hoverEffect"
                        onClick={() => {
                          setPriceRange([0, 10000]);
                          setStockStatus("all");
                          setRating("all");
                          setConditionFilter("all");
                          setWarrantyFilter("all");
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" /> Clear Filters
                      </Button>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(priceRange[0] > 0 ||
                    priceRange[1] < 1000 ||
                    (stockStatus && stockStatus !== "all") ||
                    (rating && rating !== "all")) && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-dark-color">
                          Active Filters:
                        </span>
                        {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                          <Badge
                            variant="secondary"
                            className="bg-ushop-pink/10 text-ushop-purple flex items-center gap-1"
                          >
                            <Coins className="w-3 h-3" /> Price: ₵{priceRange[0]} - ₵{priceRange[1]}
                          </Badge>
                        )}
                        {stockStatus && stockStatus !== "all" && (
                          <Badge
                            variant="secondary"
                            className="bg-ushop-pink/10 text-ushop-purple flex items-center gap-1"
                          >
                            <Package className="w-3 h-3" /> Stock:{" "}
                            {stockStatus === "in-stock"
                              ? "In Stock"
                              : "Out of Stock"}
                          </Badge>
                        )}
                        {rating && rating !== "all" && (
                          <Badge
                            variant="secondary"
                            className="bg-ushop-pink/10 text-ushop-purple flex items-center gap-1"
                          >
                            {rating === "5" ? (
                              <>
                                <Flame className="w-3 h-3" /> Premium
                              </>
                            ) : rating === "4" ? (
                              <>
                                <Award className="w-3 h-3" /> High Quality
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3 h-3 text-zinc-500" /> Standard+
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Products Grid */}
      {filteredProducts?.length ? (
        <>
          <div className={`grid ${getGridClasses()}`}>
            <AnimatePresence mode="popLayout">
              {filteredProducts
                ?.slice(0, displayLimit)
                .map((product, index) => (
                  <motion.div
                    key={product?._id}
                    layout
                    transition={{ layout: { duration: 0.2 } }}
                    className="group"
                  >
                    <ProductCard product={product} priority={index < 4} />
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>

          {/* Load More Section */}
          {displayLimit < filteredProducts.length && (
            <div className="text-center mt-12">
              <Button
                size="lg"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8 py-3 bg-ushop-pink hover:bg-ushop-pink/90 text-white font-semibold rounded-full hover:shadow-lg transform hoverEffect transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading Products...</span>
                  </>
                ) : (
                  <span>Load More Products</span>
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <NoProductsAvailable selectedTab={selectedTab} />
      )}
    </Container>
  );
};

export default ProductGridClient;
