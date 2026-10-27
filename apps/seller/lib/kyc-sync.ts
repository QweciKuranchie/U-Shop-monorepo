import { backendClient } from "@repo/sanity";
import { uploadFileToImageKit } from "@repo/media";

interface SyncStoreParams {
  storeId: string;
  sellerId: string;
  supabaseUserId: string;
  name: string;
  slug: string;
  ownerName: string;
  sellerType: "personal" | "business" | "student";
  phone: string;
  email: string;
  location?: string;
  description?: string;
  nationalIdNumber?: string;
  businessName?: string;
  businessRegistrationNumber?: string;
  university?: string;
  studentIdNumber?: string;
  studentEmail?: string;
}

/**
 * Uploads a KYC document to ImageKit (if configured)
 */
export async function uploadToImageKit(
  fileBuffer: Buffer,
  filename: string,
  folder: string
): Promise<string | null> {
  // National ID / student ID / business registration: never on the public CDN.
  return uploadFileToImageKit(fileBuffer, filename, `/ushop/kyc/${folder}`, { isPrivate: true });
}

/**
 * Syncs the store record from Supabase into Sanity CMS as a store document
 */
export async function syncStoreToSanity(params: SyncStoreParams): Promise<string | null> {
  try {
    // Check if store with this supabaseUserId or slug already exists in Sanity
    const existing = await backendClient.fetch(
      `*[_type == "store" && (supabaseUserId == $supabaseUserId || slug.current == $slug)][0]{ _id }`,
      { supabaseUserId: params.supabaseUserId, slug: params.slug }
    );

    const doc = {
      _type: "store",
      name: params.name,
      slug: { _type: "slug", current: params.slug },
      ownerName: params.ownerName,
      supabaseUserId: params.supabaseUserId,
      sellerType: params.sellerType,
      phone: params.phone,
      email: params.email,
      locationText: params.location || "",
      description: params.description || "",
      status: "pending_review",
      kycStatus: "pending_review",
      nationalIdNumber: params.nationalIdNumber || "",
      businessName: params.businessName || "",
      businessRegistrationNumber: params.businessRegistrationNumber || "",
      university: params.university || "",
      studentIdNumber: params.studentIdNumber || "",
      studentEmail: params.studentEmail || "",
    };

    if (existing?._id) {
      await backendClient.patch(existing._id).set(doc).commit();
      return existing._id;
    } else {
      const created = await backendClient.create(doc);
      return created._id;
    }
  } catch (err) {
    console.error("Sanity store sync error:", err);
    return null;
  }
}
