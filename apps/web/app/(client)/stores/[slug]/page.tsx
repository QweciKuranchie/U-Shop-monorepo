import Container from "@/components/Container";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import PaginatedProductGrid from "@/components/PaginatedProductGrid";
import Title from "@/components/Title";
import { getSingleStoreBySlug, getProductsByStoreSlug } from "@repo/sanity/queries";
import { urlFor } from "@repo/sanity";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Store as StoreIcon,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Star,
  Package,
  ArrowLeft,
  UserCheck,
} from "lucide-react";
import { Metadata } from "next";
import { Product } from "@repo/sanity";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = (await getSingleStoreBySlug(slug)) as { name?: string; description?: string } | null;

  if (!store || !store.name) {
    return {
      title: "Store Not Found | UShop",
    };
  }

  return {
    title: `${store.name} | Verified Seller Store | UShop`,
    description: store.description || `Browse products offered by ${store.name} on UShop.`,
  };
}

function getStoreImageUrl(source: unknown): string | null {
  if (!source) return null;
  if (typeof source === "string") return source;
  if (typeof source === "object") {
    const srcObj = source as Record<string, unknown>;
    if (srcObj.asset || srcObj._ref || srcObj._type === "image") {
      try {
        const result = urlFor(source as Parameters<typeof urlFor>[0]).url();
        if (result && typeof result === "string" && result.length > 0) {
          return result;
        }
      } catch (err) {
        console.error("Error building image URL:", err);
      }
    }
    if (srcObj.url && typeof srcObj.url === "string") {
      return srcObj.url;
    }
  }
  return null;
}

const SingleStorePage = async ({ params }: Props) => {
  const { slug } = await params;

  const [rawStore, fetchedProducts] = await Promise.all([
    getSingleStoreBySlug(slug),
    getProductsByStoreSlug(slug),
  ]);

  if (!rawStore) {
    return notFound();
  }

  const store = rawStore as unknown as Record<string, unknown>;

  const logoUrl = getStoreImageUrl(store.logo || store.image);
  const rawBannerUrl = getStoreImageUrl(store.banner || store.coverImage || store.cover);
  const bannerUrl = rawBannerUrl || "/assets/images/hero/header_macbook_image.png";
  const storeName = (store.name as string) || "Store";
  const products = (fetchedProducts || []) as unknown as Product[];

  return (
    <div className="min-h-screen bg-gray-50/50 py-6">
      <Container>
        {/* Breadcrumb */}
        <DynamicBreadcrumb
          customItems={[
            { label: "Stores", href: "/stores" },
            { label: storeName, href: `/stores/${slug}` },
          ]}
        />

        {/* Store Banner & Hero Card */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs mb-10">
          {/* Cover Header */}
          <div className="relative h-44 sm:h-64 w-full bg-gradient-to-r from-ushop-purple via-ushop-pink to-amber-500 overflow-hidden">
            <Image
              src={bannerUrl}
              alt={storeName}
              fill
              sizes="100vw"
              priority
              unoptimized
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>

          {/* Store Info Bar */}
          <div className="px-6 sm:px-10 pb-8 pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Store Logo (Overlapping banner border) */}
              <div className="relative -mt-12 sm:-mt-14 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1.5 shadow-lg border-4 border-white shrink-0 overflow-hidden z-20">
                <div className="relative w-full h-full rounded-xl bg-ushop-pink/10 flex flex-col items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={storeName}
                      fill
                      sizes="112px"
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-ushop-pink">
                      <span className="text-xl font-black uppercase tracking-wider">{storeName.charAt(0)}</span>
                      <StoreIcon className="w-5 h-5 opacity-80" />
                    </div>
                  )}
                </div>
              </div>

              {/* Store Titles */}
              <div className="pt-2 sm:pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {storeName}
                  </h1>
                  {Boolean(store.verifiedSeller) && (
                    <CheckCircle2 className="w-5 h-5 text-ushop-pink fill-ushop-pink/10 shrink-0" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-2">
                  {Boolean(store.verifiedStudent) && (
                    <span className="flex items-center gap-1.5 font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-md">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Student
                    </span>
                  )}

                  {Boolean(store.verifiedSeller) && (
                    <span className="flex items-center gap-1.5 font-semibold bg-ushop-pink/10 text-ushop-pink border border-ushop-pink/20 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-ushop-pink" />
                      Verified Seller
                    </span>
                  )}

                  {Boolean(store.ownerName) && (
                    <span className="flex items-center gap-1 font-medium bg-gray-100 px-2.5 py-1 rounded-md text-gray-700">
                      <UserCheck className="w-3.5 h-3.5 text-ushop-pink" />
                      {String(store.ownerName)}
                    </span>
                  )}

                  {Boolean((store.location as Record<string, unknown> | undefined)?.name) && (
                    <span className="flex items-center gap-1 font-medium bg-gray-100 px-2.5 py-1 rounded-md text-gray-700">
                      <MapPin className="w-3.5 h-3.5 text-ushop-pink" />
                      {String((store.location as Record<string, unknown>).name)}
                    </span>
                  )}

                  <span className="flex items-center gap-1 font-semibold text-ushop-pink bg-ushop-pink/10 px-2.5 py-1 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-ushop-pink text-ushop-pink" />
                    {String(store.rating || 5.0)} Rating
                  </span>
                </div>

                <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
                  {String(store.description || "Verified merchant store on UShop.")}
                </p>
              </div>
            </div>

            {/* Back to Stores Link */}
            <Link
              href="/stores"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-ushop-pink/10 hover:bg-ushop-pink text-ushop-pink hover:text-white text-xs font-semibold rounded-xl transition-all self-start sm:self-center"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Stores</span>
            </Link>
          </div>
        </div>

        {/* Store Catalog Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <Title className="text-xl sm:text-2xl font-bold text-gray-900">
              Products from {storeName}
            </Title>
            <p className="text-xs text-gray-500 mt-1">
              Showing {products.length} {products.length === 1 ? "item" : "items"} available.
            </p>
          </div>
        </div>

        {/* Products Grid or Empty State */}
        {products && products.length > 0 ? (
          <div className="mb-16">
            <PaginatedProductGrid products={products} initialLimit={12} incrementBy={12} />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <Package className="w-12 h-12 text-ushop-pink/40 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No Products Listed Currently
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              This store has not posted any active products yet. Check back soon or explore other merchant stores.
            </p>
            <Link
              href="/stores"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ushop-purple hover:bg-ushop-purple-dark text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Other Stores</span>
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
};

export default SingleStorePage;
