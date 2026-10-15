import Container from "@/components/Container";
import Title from "@/components/Title";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import PaginatedProductGrid from "@/components/PaginatedProductGrid";
import ProductCard from "@/components/ProductCard";
import StoreCard from "@/components/stores/StoreCard";
import HorizontalScrollContainer from "@/components/common/HorizontalScrollContainer";
import NoProductAvailable from "@/components/product/NoProductsAvailable";
import { getSingleUniversityBySlug, getProductsByUniversitySlug, getStores } from "@repo/sanity/queries";
import { getFallbackProducts } from "@/lib/catalogFallback";
import { topRated } from "@/lib/trending";
import { getUniversityImageUrl } from "@/lib/universityImages";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  GraduationCap,
  Building2,
  TrendingUp,
  Flame,
  Store as StoreIcon,
  ShoppingBag,
} from "lucide-react";
import { Metadata } from "next";
import { Product } from "@repo/sanity";
import { ExtendedStore } from "@/components/stores/StoresClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const university = await getSingleUniversityBySlug(slug);

  if (!university) {
    return {
      title: "Campus Not Found | UShop",
    };
  }

  return {
    title: `${university.name} Campus Hub | UShop`,
    description: `Shop tech products from verified student sellers at ${university.name}.`,
  };
}

const SingleUniversityPage = async ({ params }: Props) => {
  const { slug } = await params;

  const [university, fetchedProducts, allStoresData] = await Promise.all([
    getSingleUniversityBySlug(slug),
    getProductsByUniversitySlug(slug),
    getStores(),
  ]);

  if (!university) {
    return notFound();
  }

  // If no products specific to this campus are returned, show general products instead.
  // That used to load the ENTIRE catalogue; now it is one bounded page plus the true
  // total (so counters stay honest and a "browse all" link can take over).
  let displayProducts: Product[] = (fetchedProducts || []) as Product[];
  let displayTotal = displayProducts.length;
  const isFallback = displayProducts.length === 0;
  if (isFallback) {
    const fallback = await getFallbackProducts();
    displayProducts = fallback.products;
    displayTotal = fallback.total;
  }

  const allStores = (allStoresData || []) as ExtendedStore[];
  const imageUrl = getUniversityImageUrl(university);

  // 1. Trending Products on Campus (Sorted by highest rating / hot status / fallback top items)
  const trendingProducts = topRated(displayProducts, 10);

  // Filter stores matching campus city or verified student sellers
  const uniCity = (university.city || "").toLowerCase();
  const campusStores = allStores.filter((s) => {
    const storeLocation = (s.location?.name || "").toLowerCase();
    const storeDesc = (s.description || "").toLowerCase();
    const storeName = (s.name || "").toLowerCase();
    return (
      s.verifiedStudent ||
      (uniCity && (storeLocation.includes(uniCity) || storeDesc.includes(uniCity) || storeName.includes(uniCity)))
    );
  });

  // Fallback to allStores if campus specific list is small
  const displayCampusStores = campusStores.length > 0 ? campusStores : allStores;

  // 2. Popular Stores on Campus (Top rated / verified)
  const popularStores = [...displayCampusStores]
    .filter((s) => s.verifiedSeller || s.verifiedStudent || (s.rating && s.rating >= 4))
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50/50 py-6">
      <Container>
        {/* Breadcrumb Navigation */}
        <DynamicBreadcrumb
          customItems={[
            { label: "Universities", href: "/universities" },
            { label: university.name || "Campus" },
          ]}
        />

        {/* Campus Header Hero Banner */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-gray-100 mb-8 bg-gray-900 text-white min-h-[220px] sm:min-h-[280px] flex items-end">
          {/* Background Photo */}
          <Image
            src={imageUrl}
            alt={university.name || "University Campus"}
            fill
            className="object-cover opacity-45 hover:opacity-55 transition-opacity duration-500"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

          {/* Banner Content */}
          <div className="relative z-10 p-6 sm:p-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 bg-ushop-pink text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  <GraduationCap className="w-3.5 h-3.5" /> Campus Hub
                </span>
                {university.city && (
                  <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    <MapPin className="w-3 h-3" /> {university.city}
                  </span>
                )}
              </div>

              <Title className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-md mb-2">
                {university.name}
              </Title>

              {university.domain && (
                <div className="text-xs text-gray-300 font-medium">
                  Verified Student Domain: <span className="text-white font-bold">@{university.domain}</span>
                </div>
              )}
            </div>

            {/* Campus Items & Stores Counter */}
            <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 w-fit">
              <Building2 className="w-6 h-6 text-ushop-pink" />
              <div className="text-left">
                <div className="text-lg font-extrabold text-white">{displayTotal}</div>
                <div className="text-xs text-gray-300 font-medium">Campus Products</div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Trending Products on Campus (One-line Scrollable Carousel) */}
        {trendingProducts && trendingProducts.length > 0 && (
          <section className="mb-10 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-ushop-pink" />
                  Trending Products on Campus
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Most reviewed and popular tech deals at {university.name}
                </p>
              </div>
              <span className="text-xs font-semibold text-ushop-purple bg-ushop-purple/10 px-3 py-1 rounded-full">
                Top Rated
              </span>
            </div>

            <HorizontalScrollContainer>
              {trendingProducts.map((product) => (
                <div
                  key={product._id}
                  className="w-[220px] sm:w-[250px] md:w-[270px] shrink-0 snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </HorizontalScrollContainer>
          </section>
        )}

        {/* 2. Popular Stores on Campus (One-line Scrollable Carousel) */}
        {popularStores && popularStores.length > 0 && (
          <section className="mb-10 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  Popular Stores on Campus
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Top-rated student sellers and merchant vendors at {university.name}
                </p>
              </div>
              <Link
                href="/stores"
                className="text-xs font-bold text-ushop-pink hover:underline"
              >
                Browse All
              </Link>
            </div>

            <HorizontalScrollContainer>
              {popularStores.map((store) => (
                <div
                  key={store._id}
                  className="w-[270px] sm:w-[310px] shrink-0 snap-start"
                >
                  <StoreCard store={store} />
                </div>
              ))}
            </HorizontalScrollContainer>
          </section>
        )}

        {/* 3. All Stores on Campus */}
        {displayCampusStores && displayCampusStores.length > 0 && (
          <section className="mb-10 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <StoreIcon className="w-5 h-5 text-ushop-purple" />
                  All Stores on Campus
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verified merchant shops and student vendor stores for {university.name}
                </p>
              </div>
              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                {displayCampusStores.length} stores
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCampusStores.map((store) => (
                <StoreCard key={store._id} store={store} />
              ))}
            </div>
          </section>
        )}

        {/* 4. All Campus Products Catalog */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-ushop-pink" />
                All Campus Products
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Full product catalog available at {university.name}
              </p>
            </div>
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
              {displayTotal} items
            </span>
          </div>

          {displayProducts && displayProducts.length > 0 ? (
            <>
              <PaginatedProductGrid products={displayProducts} initialLimit={12} incrementBy={12} />
              {isFallback && displayTotal > displayProducts.length && (
                <div className="mt-6 text-center">
                  <Link href="/product" className="text-sm font-bold text-ushop-pink hover:underline">
                    Browse all {displayTotal} products
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="py-12">
              <NoProductAvailable className="bg-transparent" />
            </div>
          )}
        </section>
      </Container>
    </div>
  );
};

export default SingleUniversityPage;
