export const dynamic = "force-dynamic";

import { writeClient } from "@repo/sanity";
import AttributeManager, { type AttributeRow } from "@/components/AttributeManager";

export default async function AttributesPage() {
  let attributes: AttributeRow[] = [];
  try {
    attributes = await writeClient.fetch<AttributeRow[]>(
      `*[_type == "attribute"] | order(title asc){
        _id, title, "slug": slug.current, type, options, unit,
        "categoryCount": count(*[_type == "category" && references(^._id)])
      }`
    );
  } catch (error) {
    console.error("Error loading attributes:", error);
  }
  return (
    <div className="py-4 space-y-6">
      <div className="px-4 py-3 bg-card border rounded-lg shadow-xs">
        <h1 className="font-semibold text-lg">Attributes</h1>
        <p className="text-xs text-muted-foreground">
          Define product spec fields (text, number, yes/no, single or multiple choice) and assign them to categories.
        </p>
      </div>
      <AttributeManager attributes={attributes} />
    </div>
  );
}
