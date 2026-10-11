import { client } from "@repo/sanity";
import { notFound } from "next/navigation";
import { getCurrentStore } from "@/lib/currentStore";
import { ListingForm } from "@/components/listings/ListingForm";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await getCurrentStore();
  // Only the owning store may open the edit form (the PATCH route already enforces this).
  const product = store
    ? await client.fetch(`*[_type == "product" && _id == $id && store._ref == $storeId][0]`, { id, storeId: store._id })
    : null;
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-sm text-muted-foreground">Update listing details and inventory.</p>
      </div>
      <ListingForm initialData={product} />
    </div>
  );
}