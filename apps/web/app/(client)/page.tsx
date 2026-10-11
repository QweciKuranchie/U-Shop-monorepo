import React from "react";
import { serializeJsonLd } from "@repo/utils/json-ld";
import Container from "@/components/Container";
import HomeBanner from "@/components/HomeBanner";
import ProductGrid from "@/components/ProductGrid";
import HomeCategories from "@/components/HomeCategories";
import FlashSaleSection from "@/components/FlashSaleSection";
import PopularProductSection from "@/components/PopularProductSection";
import PromoBannerSection from "@/components/PromoBannerSection";
import NewArrivalsSection from "@/components/NewArrivalsSection";
import ActionMiniBanners from "@/components/ActionMiniBanners";
import { getCategories, getDealProducts, getPopularProducts, getNewArrivalProducts, getHomepageBanners } from "@repo/sanity/queries";
import { resolveHomepageBanners } from "@repo/sanity";
import ShopByBrand from "@/components/ShopByBrand";
import ScrollToTop from "@/components/ScrollToTop";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo";

const Home = async () => {
  const [categories, dealProducts, popularProducts, newArrivals, bannerDocs] =
    await Promise.all([
      getCategories(6),
      getDealProducts(),
      getPopularProducts(8),
      getNewArrivalProducts(10),
      getHomepageBanners(),
    ]);

  // Banners come from the admin panel (/admin/homepage); built-in defaults
  // are used for any placement that has no active banners.
  const banners = resolveHomepageBanners(bannerDocs);

  const orgSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <>
      {/* Structured Data (JSON-LD) for Homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(orgSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(websiteSchema),
        }}
      />

      <div className="bg-white min-h-screen">
        <Container className="pt-4 sm:pt-6">
          <HomeBanner slides={banners.hero} />
          <ActionMiniBanners banners={banners.mini} />
          {dealProducts && dealProducts.length > 0 && (
            <FlashSaleSection products={dealProducts} />
          )}
        </Container>

        <HomeCategories categories={categories} />
        <ShopByBrand />
        {popularProducts && popularProducts.length > 0 && (
          <PopularProductSection products={popularProducts} />
        )}
        <PromoBannerSection
          slider={banners.promoSlider}
          side={banners.promoSide}
          bottom={banners.promoBottom}
        />
        {newArrivals && newArrivals.length > 0 && (
          <NewArrivalsSection products={newArrivals} />
        )}
        <div className="pb-16 pt-4">
          <ProductGrid />
        </div>
        <ScrollToTop />
      </div>
    </>
  );
};

export default Home;
