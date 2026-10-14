import Container from "@/components/Container";
import { serializeJsonLd } from "@repo/utils/json-ld";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { getCategories } from "@repo/sanity/queries";
import { Category, Product } from "@repo/sanity";
import { urlFor } from "@repo/sanity";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Tag,
  TrendingUp,
} from "lucide-react";
import React from "react";
import CategoryProducts from "@/components/product/CategoryProducts";
import { client } from "@repo/sanity";
import { Metadata } from "next";
import {
  generateCategoryMetadata,
  generateBreadcrumbSchema,
  generateItemListSchema,
} from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories: Category[] = await getCategories();

  const currentCategory = categories.find(
    (cat: Category) => cat.slug?.current === slug
  );

  if (!currentCategory) {
    return {
      title: "Category Not Found | UShop",
    };
  }

  const query = `count(*[_type == "product" && (category._ref in *[_type == "category" && (slug.current == $slug || parent->slug.current == $slug || parent->parent->slug.current == $slug)]._id || references(*[_type == "category" && (slug.current == $slug || parent->slug.current == $slug || parent->parent->slug.current == $slug)]._id))])`;
  const productCount: number = await client.fetch(query, { slug });

  return generateCategoryMetadata(currentCategory, productCount);
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const categories: Category[] = await getCategories();

  // Fetch products for the current category (and its subcategories/leaves)
  const query = `
    *[_type == "product" && (category._ref in *[_type == "category" && (slug.current == $slug || parent->slug.current == $slug || parent->parent->slug.current == $slug)]._id || references(*[_type == "category" && (slug.current == $slug || parent->slug.current == $slug || parent->parent->slug.current == $slug)]._id))] {
      ...,
      brand->{
        _id,
        name
      }
    }
  `;
  const products: Product[] = await client.fetch(query, { slug });

  // Find the current category to get its proper title
  const currentCategory = categories.find(
    (cat: Category) => cat.slug?.current === slug
  );
  const categoryTitle = currentCategory?.title || slug;

  // Get related categories (exclude current category)
  const relatedCategories = categories
    .filter((cat) => cat.slug?.current !== slug)
    .slice(0, 4);

  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Categories", url: "/category" },
    { name: categoryTitle, url: `/category/${slug}` },
  ]);

  const itemListSchema = generateItemListSchema(
    products,
    `${categoryTitle} Products`
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-6">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(itemListSchema),
        }}
      />

      <Container>
        {/* Dynamic Breadcrumb */}
        <DynamicBreadcrumb
          customItems={[
            { label: "Categories", href: "/category" },
            { label: categoryTitle, href: `/category/${slug}` },
          ]}
        />

        {/* Category Header Showcase Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {currentCategory?.image && (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-ushop-pink/10 border border-ushop-pink/20 flex items-center justify-center shrink-0 p-3 overflow-hidden shadow-2xs">
                <Image
                  src={urlFor(currentCategory.image).url()}
                  alt={categoryTitle}
                  fill
                  sizes="96px"
                  className="object-contain p-2"
                  priority
                />
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {categoryTitle}
                </h1>

                {currentCategory?.featured && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    <Tag className="w-3 h-3 text-amber-500" /> Featured
                  </span>
                )}
              </div>

              {currentCategory?.description && (
                <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed mb-3">
                  {currentCategory.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-500">
                <span className="font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">
                  {products.length} {products.length === 1 ? "Product Available" : "Products Available"}
                </span>

                {currentCategory?.range && (
                  <span className="flex items-center gap-1 bg-ushop-pink/10 text-ushop-pink px-2.5 py-1 rounded-md font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Range: {currentCategory.range}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/category"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Categories</span>
            </Link>
          </div>
        </div>

        {/* Category Main Product Grid */}
        <CategoryProducts
          categories={categories}
          slug={slug}
          initialProducts={products}
        />

        {/* Related Categories Grid */}
        {relatedCategories.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Explore Other Categories
              </h3>
              <Link
                href="/category"
                className="text-xs font-semibold text-ushop-pink hover:underline flex items-center gap-1"
              >
                <span>View All Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedCategories.map((category) => {
                const img = category.image ? urlFor(category.image).url() : null;
                const catSlug = category.slug?.current || "";

                return (
                  <Link
                    key={category._id}
                    href={`/category/${catSlug}`}
                    className="group bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md hover:border-ushop-pink/30 transition-all flex items-center gap-4"
                  >
                    <div className="relative w-12 h-12 rounded-xl bg-ushop-pink/10 border border-ushop-pink/20 flex items-center justify-center shrink-0 overflow-hidden">
                      {img ? (
                        <Image
                          src={img}
                          alt={category.title || "Category"}
                          fill
                          sizes="48px"
                          className="object-contain p-1.5 transition-transform"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-ushop-pink" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-ushop-pink transition-colors truncate">
                        {category.title}
                      </h4>
                      <p className="text-xs text-gray-500 capitalize truncate mt-0.5">
                        {catSlug.replace(/-/g, " ")}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-ushop-pink group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
