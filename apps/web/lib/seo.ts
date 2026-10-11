import { Metadata } from "next";
import { Product, Category } from "@repo/sanity";
import { parseProductVideo, productImageUrl, urlFor } from "@repo/sanity";

const BASE_URL = "https://ushopgh.com";

interface PopulatedProduct extends Omit<Product, "brand"> {
  brand?: { name?: string } | Array<{ brandName?: string }> | null;
  averageRating?: number;
  totalReviews?: number;
}

/**
 * Generate metadata for product pages
 */
export function generateProductMetadata(product: PopulatedProduct): Metadata {
  const title = product.name || "Product";
  const description =
    product.description ||
    `Buy ${title} online at U-Shop. ${
      product.price ? `Price: GH₵${product.price}` : ""
    }`;
  const imageUrl = product.images?.[0]
    ? (productImageUrl(product.images[0]) ?? "/og-image.jpg")
    : "/og-image.jpg";
  const url = `${BASE_URL}/product/${product.slug?.current}`;

  // Extract brand name if it's populated
  const brandName = Array.isArray(product.brand)
    ? product.brand[0]?.brandName
    : (product.brand && typeof product.brand === "object" && "name" in product.brand)
      ? product.brand.name
      : "";

  return {
    title,
    description,
    keywords: [
      product.name || "",
      brandName || "",
      "buy online",
      "sell online",
      "shop",
      "e-commerce",
    ].filter(Boolean),
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: "U-Shop",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate metadata for category pages
 */
export function generateCategoryMetadata(
  category: Category,
  productCount: number = 0
): Metadata {
  const title = category.title || "Category";
  const description =
    category.description ||
    `Browse ${productCount} products in ${title} category at U-Shop. Find the best deals and quality items.`;
  const imageUrl = category.image
    ? urlFor(category.image).url()
    : "/og-image.jpg";
  const url = `${BASE_URL}/category/${category.slug?.current}`;

  return {
    title,
    description,
    keywords: [
      category.title || "",
      "category",
      "shop",
      "buy online",
      "e-commerce",
      "products",
    ].filter(Boolean),
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: "U-Shop",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate Product Schema (JSON-LD) for rich snippets
 */
export function generateProductSchema(product: PopulatedProduct) {
  // All photos (angles + lifestyle), not just the first, so search can show them.
  const imageUrls = (product.images ?? [])
    .map((img) => productImageUrl(img))
    .filter((u): u is string => Boolean(u));
  const video = (product as unknown as { video?: { url?: string | null; thumbnailUrl?: string | null } }).video;
  const parsedVideo = parseProductVideo(video?.url);

  // Extract brand name if it's populated
  const brandName = Array.isArray(product.brand)
    ? product.brand[0]?.brandName || "U-Shop"
    : (product.brand && typeof product.brand === "object" && "name" in product.brand)
      ? product.brand.name || "U-Shop"
      : "U-Shop";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: imageUrls.length ? imageUrls : undefined,
    ...(parsedVideo && imageUrls[0] && {
      subjectOf: {
        "@type": "VideoObject",
        name: `${product.name} video`,
        description: product.description || product.name,
        thumbnailUrl: video?.thumbnailUrl || imageUrls[0],
        contentUrl: parsedVideo.kind === "file" ? parsedVideo.url : undefined,
        embedUrl: parsedVideo.kind === "file" ? undefined : parsedVideo.embedUrl,
        uploadDate: (product as unknown as { _updatedAt?: string })._updatedAt,
      },
    }),
    sku: product._id,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/product/${product.slug?.current}`,
      priceCurrency: "GHS",
      price: product.price,
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      )
        .toISOString()
        .split("T")[0],
      availability:
        product.stock && product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.averageRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.averageRating,
        reviewCount: product.totalReviews || 0,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
}

/**
 * Generate BreadcrumbList Schema (JSON-LD)
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate Organization Schema (JSON-LD)
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "U-Shop",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      "Your trusted online shopping destination for quality items and exceptional customer service.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-123-4567",
      contactType: "customer service",
      areaServed: "GH",
      availableLanguage: "en",
    },
    sameAs: [
      "https://facebook.com/ushopgh",
      "https://twitter.com/ushopgh",
      "https://instagram.com/ushopgh",
      "https://linkedin.com/company/ushopgh",
    ],
  };
}

/**
 * Generate WebSite Schema (JSON-LD) with search action
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "U-Shop",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate ItemList Schema for product listings
 */
export function generateItemListSchema(
  products: Array<{ name?: string; slug?: { current?: string } }>,
  listName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${BASE_URL}/product/${product.slug?.current}`,
      name: product.name,
    })),
  };
}

interface SeoReview {
  rating?: number;
  userName?: string;
  comment?: string;
  _createdAt?: string;
}

/**
 * Generate Review Schema for product reviews
 */
export function generateReviewSchema(reviews: SeoReview[]) {
  if (!reviews || reviews.length === 0) return null;

  const reviewSchemas = reviews.map((review) => ({
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      "@type": "Person",
      name: review.userName || "Anonymous",
    },
    reviewBody: review.comment,
    datePublished: review._createdAt,
  }));

  return reviewSchemas;
}

/**
 * Generate FAQ Schema
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Helper to create canonical URL
 */
export function getCanonicalUrl(path: string): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Generate metadata for homepage
 */
export function generateHomeMetadata(): Metadata {
  return {
    title: "U-Shop - Your Trusted Online Shopping Destination",
    description:
      "Discover amazing products at U-Shop, your trusted online shopping destination for quality items and exceptional customer service. Shop electronics, fashion, home goods and more with fast delivery.",
    keywords: [
      "online shopping",
      "e-commerce",
      "buy online",
      "shop online",
      "best deals",
      "electronics",
      "fashion",
      "home goods",
    ],
    openGraph: {
      type: "website",
      url: BASE_URL,
      title: "U-Shop - Your Trusted Online Shopping Destination",
      description:
        "Discover amazing products at U-Shop. Shop electronics, fashion, home goods and more with fast delivery.",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "U-Shop Online Store",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "U-Shop - Your Trusted Online Shopping Destination",
      description:
        "Discover amazing products at U-Shop. Shop electronics, fashion, home goods and more.",
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical: BASE_URL,
    },
  };
}
