export const dynamic = "force-dynamic";

import { writeClient } from "@repo/sanity";
import CategoryManager, { type CategoryRow } from "@/components/CategoryManager";

export default async function CategoriesPage() {
  let categories: CategoryRow[] = [];
  let classifications: Array<{ _id: string; title: string }> = [];
  let attributes: Array<{ _id: string; title: string }> = [];

  try {
    [categories, classifications, attributes] = await Promise.all([
      writeClient.fetch<CategoryRow[]>(
        `*[_type == "category"] | order(title asc){
          _id, title, "slug": slug.current, level, description,
          "parentId": parent._ref, "parentTitle": parent->title,
          "classificationId": productType._ref, "classificationTitle": productType->title,
          "attributes": coalesce(attributes[]{ "attributeId": attribute._ref, required }, []),
          "productCount": count(*[_type == "product" && references(^._id)]),
          "childCount": count(*[_type == "category" && parent._ref == ^._id])
        }`
      ),
      writeClient.fetch(`*[_type == "productClassification"] | order(title asc){ _id, title }`),
      writeClient.fetch(`*[_type == "attribute"] | order(title asc){ _id, title }`),
    ]);
  } catch (error) {
    console.error("Error loading categories:", error);
  }

  return (
    <div className="py-4 space-y-6">
      <div className="px-4 py-3 bg-card border rounded-lg shadow-xs">
        <h1 className="font-semibold text-lg">Categories</h1>
        <p className="text-xs text-muted-foreground">
          Organise the catalogue and choose which attributes products in each category must provide.
        </p>
      </div>
      <CategoryManager categories={categories} classifications={classifications} attributes={attributes} />
    </div>
  );
}
