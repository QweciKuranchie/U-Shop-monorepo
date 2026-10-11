import { unstable_cache } from "next/cache";
import { Category, Brand, Product, Location } from "../types";
import { sanityFetch } from "../live";
import {
  buildCatalogQuery,
  catalogCacheKey,
  CATALOG_MAX_PRICE_QUERY,
  sliderMax,
  type CatalogPage,
  type CatalogParams,
} from "../catalogQuery";
import { getOrderById } from "./userQueries";
import type { HomepageBanner } from "../homepageBanners";

export * from "./userQueries";
export * from "./emailUserQueries";
export * from "./query";
export * from "./sellerQueries";

import { ADDRESS_QUERY,
  ALL_PRODUCTS_QUERY,
  ADMIN_CATEGORIES_QUERY,
  BANNER_QUERY,
  HOMEPAGE_BANNERS_QUERY,
  BRAND_QUERY,
  BRANDS_QUERY,
  BRANDS_WITH_PRODUCT_COUNT_QUERY,
  SINGLE_BRAND_BY_SLUG_QUERY,
  PRODUCTS_BY_BRAND_SLUG_QUERY,
  DEAL_PRODUCTS,
  FEATURE_PRODUCTS,
  POPULAR_PRODUCTS,
  NEW_ARRIVALS,
  FEATURED_CATEGORY_QUERY,
  PRODUCT_BY_SLUG_QUERY,
  RELATED_PRODUCTS_QUERY,
  PRODUCTS_BY_STORE_QUERY,
  STORES_QUERY,
  SINGLE_STORE_BY_SLUG_QUERY,
  PRODUCTS_BY_STORE_SLUG_QUERY,
  UNIVERSITIES_QUERY,
  SINGLE_UNIVERSITY_BY_SLUG_QUERY,
  PRODUCTS_BY_UNIVERSITY_SLUG_QUERY,} from "./query";

/**
 * Active homepage banners managed from the admin panel. Returns [] on error so the
 * storefront falls back to its built-in defaults (see resolveHomepageBanners).
 * Schedule windows are evaluated when the cache entry is rebuilt (<= 5 min lag).
 */
const getHomepageBanners = unstable_cache(
  async (): Promise<HomepageBanner[]> => {
    try {
      const { data } = await sanityFetch({ query: HOMEPAGE_BANNERS_QUERY });
      return (data ?? []) as HomepageBanner[];
    } catch (error) {
      console.error("Error fetching homepage banners:", error);
      return [];
    }
  },
  ["homepage-banners"],
  { revalidate: 300, tags: ["homepage", "banners"] }
);

const getBanner = unstable_cache(
  async () => {
    try {
      const { data } = await sanityFetch({ query: BANNER_QUERY });
      return data ?? [];
    } catch (error) {
      console.error("Error fetching sale banner:", error);
      return [];
    }
  },
  ["banner"],
  { revalidate: 300, tags: ["homepage", "banners"] }
);

/**
 * Get featured categories - cached for 15 minutes
 * Featured categories are relatively static
 */
const getFeaturedCategory = unstable_cache(
  async (quantity: number) => {
    try {
      const { data } = (await sanityFetch({
        query: FEATURED_CATEGORY_QUERY,
        params: { quantity },
      })) as { data: Category[] };
      return data ?? [];
    } catch (error) {
      console.error("Error fetching featured category:", error);
      return [];
    }
  },
  ["featured-categories"],
  { revalidate: 900, tags: ["categories", "featured", "homepage"] }
);

/**
 * Get all products - cached for 10 minutes
 * Product list updates moderately often
 */
const getAllProducts = unstable_cache(
  async () => {
    try {
      const { data } = (await sanityFetch({ query: ALL_PRODUCTS_QUERY })) as {
        data: Product[];
      };
      return data ?? [];
    } catch (error) {
      console.error("Error fetching all products:", error);
      return [];
    }
  },
  ["all-products"],
  { revalidate: 600, tags: ["products"] }
);


/**
 * One page of the product catalogue, filtered/sorted/paginated by Sanity.
 * Replaces loading EVERY product and filtering in the browser.
 *
 * Browse/filter pages (a small, bounded set of keys) are cached for 5 minutes and
 * invalidated through the "products" tag. Free-text searches are NOT cached: the
 * key space is unbounded and would let anyone fill the data cache.
 */
const fetchProductsPage = async (params: CatalogParams): Promise<CatalogPage> => {
  const { query, params: groqParams } = buildCatalogQuery(params);
  const { data } = (await sanityFetch({ query, params: groqParams })) as { data: CatalogPage | null };
  return { items: data?.items ?? [], total: data?.total ?? 0 };
};

const getProductsPage = async (params: CatalogParams): Promise<CatalogPage> => {
  try {
    if (params.q) return await fetchProductsPage(params);
    return await unstable_cache(() => fetchProductsPage(params), ["catalog-page", catalogCacheKey(params)], {
      revalidate: 300,
      tags: ["products"],
    })();
  } catch (error) {
    console.error("Error fetching catalogue page:", error);
    return { items: [], total: 0 };
  }
};

/** Upper bound for the catalogue price slider (cached 10 minutes). */
const getCatalogPriceMax = unstable_cache(
  async () => {
    try {
      const { data } = (await sanityFetch({ query: CATALOG_MAX_PRICE_QUERY })) as { data: number | null };
      return sliderMax(data);
    } catch (error) {
      console.error("Error fetching catalogue max price:", error);
      return sliderMax(null);
    }
  },
  ["catalog-max-price"],
  { revalidate: 600, tags: ["products"] }
);

/**
 * Get deal products - cached for 5 minutes
 * Deals may change frequently
 */
const getDealProducts = unstable_cache(
  async () => {
    try {
      const { data } = (await sanityFetch({ query: DEAL_PRODUCTS })) as {
        data: Product[];
      };
      return data ?? [];
    } catch (error) {
      console.error("Error fetching deal products:", error);
      return [];
    }
  },
  ["deal-products"],
  { revalidate: 300, tags: ["products", "deals", "homepage"] }
);

/**
 * Get popular products - cached for 5 minutes
 */
const getPopularProducts = unstable_cache(
  async (quantity: number = 8) => {
    try {
      const { data } = (await sanityFetch({ query: POPULAR_PRODUCTS })) as {
        data: Product[];
      };
      if (data && data.length > 0) {
        return data.slice(0, quantity);
      }
      // Fallback to all products if no explicit popular products
      const fallback = (await sanityFetch({ query: ALL_PRODUCTS_QUERY })) as {
        data: Product[];
      };
      return (fallback.data ?? []).slice(0, quantity);
    } catch (error) {
      console.error("Error fetching popular products:", error);
      return [];
    }
  },
  ["popular-products"],
  { revalidate: 300, tags: ["products", "popular", "homepage"] }
);

/**
 * Get new arrival products - cached for 5 minutes
 */
const getNewArrivalProducts = unstable_cache(
  async (quantity: number = 10) => {
    try {
      const { data } = (await sanityFetch({ query: NEW_ARRIVALS })) as {
        data: Product[];
      };
      if (data && data.length > 0) {
        return data.slice(0, quantity);
      }
      const fallback = (await sanityFetch({ query: ALL_PRODUCTS_QUERY })) as {
        data: Product[];
      };
      return (fallback.data ?? []).slice(0, quantity);
    } catch (error) {
      console.error("Error fetching new arrivals:", error);
      return [];
    }
  },
  ["new-arrivals"],
  { revalidate: 300, tags: ["products", "new-arrivals", "homepage"] }
);

/**
 * Get featured products - cached for 10 minutes
 * Featured products are manually curated
 */
const getFeaturedProducts = unstable_cache(
  async () => {
    try {
      const { data } = (await sanityFetch({ query: FEATURE_PRODUCTS })) as {
        data: Product[];
      };
      return data ?? [];
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }
  },
  ["featured-products"],
  { revalidate: 600, tags: ["products", "featured", "homepage"] }
);

/**
 * Get all brands - cached for 1 hour
 * Brand list rarely changes
 */
const getAllBrands = unstable_cache(
  async () => {
    try {
      const { data } = (await sanityFetch({ query: BRANDS_QUERY })) as {
        data: Brand[];
      };
      return data ?? [];
    } catch (error) {
      console.error("Error fetching all brands:", error);
      return [];
    }
  },
  ["all-brands"],
  { revalidate: 3600, tags: ["brands"] }
);



/**
 * Get addresses - not cached (user-specific data)
 */
const getAddresses = async () => {
  try {
    const { data } = await sanityFetch({
      query: ADDRESS_QUERY,
    });
    return data ?? [];
  } catch (error) {
    console.error("Error fetching address:", error);
    return [];
  }
};

/**
 * Get categories - cached for 15 minutes
 * Category structure is relatively static
 */
const getCategories = unstable_cache(
  async (quantity?: number) => {
    try {
      const query = quantity
        ? `*[_type == 'category'] | order(title asc) [0...$quantity] {
            ...,
            parent->{ _id, title, slug, level },
            productType->{ _id, title, slug },
            attributes[]{
              required,
              attribute->{
                _id,
                title,
                slug,
                type,
                options,
                unit
              }
            },
            allowedBrands[]->{ _id, name, slug },
            "productCount": count(*[_type == "product" && references(^._id)])
          }`
        : `*[_type == 'category'] | order(title asc) {
            ...,
            parent->{ _id, title, slug, level },
            productType->{ _id, title, slug },
            attributes[]{
              required,
              attribute->{
                _id,
                title,
                slug,
                type,
                options,
                unit
              }
            },
            allowedBrands[]->{ _id, name, slug },
            "productCount": count(*[_type == "product" && references(^._id)])
          }`;

      const { data } = await sanityFetch({
        query,
        params: quantity ? { quantity } : {},
      }) as { data: Category[] };

      return data ?? [];
    } catch (error) {
      console.error("Error fetching categories with product count:", error);
      return [];
    }
  },
  ["categories-list"],
  { revalidate: 900, tags: ["categories", "navigation"] }
);

export interface ProductClassificationItem {
  _id: string;
  title: string;
  slug?: { current?: string };
  description?: string;
}

/**
 * Get product classifications - cached for 1 hour
 */
const getProductClassifications = unstable_cache(
  async (): Promise<ProductClassificationItem[]> => {
    try {
      const { data } = (await sanityFetch({
        query: `*[_type == "productClassification"] | order(title asc) {
          _id,
          title,
          slug,
          description
        }`,
      })) as { data: ProductClassificationItem[] };
      return data ?? [];
    } catch (error) {
      console.error("Error fetching product classifications:", error);
      return [];
    }
  },
  ["product-classifications"],
  { revalidate: 3600, tags: ["classifications"] }
);

/**
 * Get admin categories - not cached (admin data needs to be fresh)
 */
const getAdminCategories = async () => {
  try {
    const { data } = await sanityFetch({ query: ADMIN_CATEGORIES_QUERY });
    return data ?? [];
  } catch (error) {
    console.error("Error fetching admin categories:", error);
    return [];
  }
};

/**
 * Get product by slug - cached for 30 minutes
 * Product details don't change frequently
 */
const getProductBySlug = unstable_cache(
  async (slug: string) => {
    try {
      const product = (await sanityFetch({
        query: PRODUCT_BY_SLUG_QUERY,
        params: {
          slug,
        },
      })) as { data: Product | null };
      return product?.data || null;
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      return null;
    }
  },
  ["product-by-slug"],
  { revalidate: 1800, tags: ["products", "reviews"] }
);

/**
 * Get brand by slug - cached for 30 minutes
 * Brand info rarely changes
 */
const getBrand = unstable_cache(
  async (slug: string) => {
    try {
      const product = (await sanityFetch({
        query: BRAND_QUERY,
        params: {
          slug,
        },
      })) as { data: { brandName: string }[] | null };
      return product?.data || null;
    } catch (error) {
      console.error("Error fetching brand by slug:", error);
      return null;
    }
  },
  ["brand-by-slug"],
  { revalidate: 1800, tags: ["brands"] }
);

/**
 * Get related products - cached for 15 minutes
 * Related products are dynamic but can be cached briefly
 */
const getRelatedProducts = unstable_cache(
  async (categoryIds: string[], currentSlug: string, limit: number = 6) => {
    try {
      const { data } = (await sanityFetch({
        query: RELATED_PRODUCTS_QUERY,
        params: {
          categoryIds,
          currentSlug,
          limit,
        },
      })) as { data: Product[] };
      return data ?? [];
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  },
  ["related-products"],
  { revalidate: 900, tags: ["products"] }
);

/**
 * Get products from seller/store - cached for 10 minutes
 */
const getProductsFromSeller = unstable_cache(
  async (storeId: string, currentSlug: string, limit: number = 6) => {
    if (!storeId) return [];
    try {
      const { data } = (await sanityFetch({
        query: PRODUCTS_BY_STORE_QUERY,
        params: {
          storeId,
          currentSlug,
          limit,
        },
      })) as { data: Product[] };
      return data ?? [];
    } catch (error) {
      console.error("Error fetching seller products:", error);
      return [];
    }
  },
  ["seller-products"],
  { revalidate: 600, tags: ["products", "stores"] }
);


/**
 * Get universities list - cached for 1 hour
 * University list changes infrequently
 */
const getUniversities = unstable_cache(
  async () => {
    try {
      const { data } = await sanityFetch({ query: UNIVERSITIES_QUERY }) as { data: Location[] };
      return data ?? [];
    } catch (error) {
      console.error("Error fetching universities:", error);
      return [];
    }
  },
  ["universities-list"],
  { revalidate: 3600, tags: ["locations", "universities"] }
);

const getBrandsWithCount = unstable_cache(
  async () => {
    try {
      const { data } = (await sanityFetch({ query: BRANDS_WITH_PRODUCT_COUNT_QUERY })) as {
        data: (Brand & { productCount?: number })[];
      };
      return data ?? [];
    } catch (error) {
      console.error("Error fetching brands with product count:", error);
      return [];
    }
  },
  ["brands-with-count"],
  { revalidate: 1800, tags: ["brands", "products"] }
);

const getSingleBrandBySlug = unstable_cache(
  async (slug: string) => {
    try {
      const { data } = (await sanityFetch({
        query: SINGLE_BRAND_BY_SLUG_QUERY,
        params: { slug },
      })) as { data: (Brand & { productCount?: number }) | null };
      return data || null;
    } catch (error) {
      console.error("Error fetching brand by slug:", error);
      return null;
    }
  },
  ["single-brand-by-slug"],
  { revalidate: 1800, tags: ["brands"] }
);

const getProductsByBrandSlug = unstable_cache(
  async (slug: string) => {
    try {
      const { data } = (await sanityFetch({
        query: PRODUCTS_BY_BRAND_SLUG_QUERY,
        params: { slug },
      })) as { data: Product[] };
      return data ?? [];
    } catch (error) {
      console.error("Error fetching products by brand:", error);
      return [];
    }
  },
  ["products-by-brand-slug"],
  { revalidate: 600, tags: ["products", "brands"] }
);

const getSingleUniversityBySlug = unstable_cache(
  async (slug: string) => {
    try {
      const { data } = (await sanityFetch({
        query: SINGLE_UNIVERSITY_BY_SLUG_QUERY,
        params: { slug },
      })) as { data: (Location & { productCount?: number; domain?: string; logo?: unknown; image?: unknown }) | null };
      return data || null;
    } catch (error) {
      console.error("Error fetching university by slug:", error);
      return null;
    }
  },
  ["single-university-by-slug"],
  { revalidate: 1800, tags: ["locations", "universities"] }
);

const getProductsByUniversitySlug = unstable_cache(
  async (slug: string) => {
    try {
      const { data } = (await sanityFetch({
        query: PRODUCTS_BY_UNIVERSITY_SLUG_QUERY,
        params: { slug },
      })) as { data: Product[] };
      return data ?? [];
    } catch (error) {
      console.error("Error fetching products by university:", error);
      return [];
    }
  },
  ["products-by-university-slug"],
  { revalidate: 600, tags: ["products", "locations", "universities"] }
);

/**
 * Get all stores directly from Sanity - cached for 30 seconds
 */
const getStores = unstable_cache(
  async () => {
    try {
      const { data } = await sanityFetch({ query: STORES_QUERY });
      return data ?? [];
    } catch (error) {
      console.error("Error fetching stores from Sanity:", error);
      return [];
    }
  },
  ["stores-list"],
  { revalidate: 30, tags: ["stores"] }
);

/**
 * Get single store by slug directly from Sanity - cached for 30 seconds
 */
const getSingleStoreBySlug = unstable_cache(
  async (slug: string) => {
    try {
      const { data } = await sanityFetch({
        query: SINGLE_STORE_BY_SLUG_QUERY,
        params: { slug },
      });
      return data ?? null;
    } catch (error) {
      console.error("Error fetching store by slug from Sanity:", error);
      return null;
    }
  },
  ["single-store-by-slug"],
  { revalidate: 30, tags: ["stores"] }
);

/**
 * Get products by store slug - cached for 10 minutes
 */
const getProductsByStoreSlug = unstable_cache(
  async (slug: string) => {
    try {
      const { data } = (await sanityFetch({
        query: PRODUCTS_BY_STORE_SLUG_QUERY,
        params: { slug },
      })) as { data: Product[] };
      return data ?? [];
    } catch (error) {
      console.error("Error fetching products by store:", error);
      return [];
    }
  },
  ["products-by-store-slug"],
  { revalidate: 600, tags: ["products", "stores"] }
);

export {getBanner,
  getHomepageBanners,
  getFeaturedCategory,
  getAllProducts,
  getProductsPage,
  getCatalogPriceMax,
  getDealProducts,
  getPopularProducts,
  getNewArrivalProducts,
  getFeaturedProducts,
  getAllBrands,
  getBrandsWithCount,
  getSingleBrandBySlug,
  getProductsByBrandSlug,
  getSingleUniversityBySlug,
  getProductsByUniversitySlug,
  getStores,
  getSingleStoreBySlug,
  getProductsByStoreSlug,
  getAddresses,
  getCategories,
  getAdminCategories,
  getProductBySlug,
  getBrand,
  getRelatedProducts,
  getProductsFromSeller,
  getOrderById,
  getUniversities,
  getProductClassifications,
};