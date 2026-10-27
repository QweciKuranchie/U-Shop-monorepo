"use server";

import { createServerClient } from "@repo/supabase/server";
import { redirect } from "next/navigation";
import { uploadToImageKit, syncStoreToSanity } from "@/lib/kyc-sync";
import type { SellerType } from "@repo/supabase/types";

export async function createStoreAction(formData: FormData) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const name = formData.get("name") as string;
  const ownerName = formData.get("ownerName") as string;
  const phone = (formData.get("phone") as string) || "";
  const email = (formData.get("email") as string) || user.email || "";
  const location = (formData.get("location") as string) || "";
  const description = (formData.get("description") as string) || "";
  const sellerType = ((formData.get("sellerType") as string) || "personal") as SellerType;

  if (!name || !ownerName) {
    throw new Error("Store name and Owner name are required.");
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  // 1. Upsert Seller Profile in Supabase
  const nameParts = ownerName.trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const { data: seller, error: sellerError } = await supabase
    .from("sellers")
    .upsert(
      {
        auth_user_id: user.id,
        email,
        phone,
        first_name: firstName,
        last_name: lastName,
        seller_type: sellerType,
        status: "pending_review",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "auth_user_id" }
    )
    .select("id")
    .single();

  if (sellerError || !seller) {
    console.error("Error creating/updating seller profile:", sellerError);
    // If table doesn't exist yet (before user runs migration), inform clearly:
    throw new Error(
      sellerError?.message || "Could not save seller profile. Please verify database tables exist."
    );
  }

  // 2. Create or Update Store in Supabase
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .upsert(
      {
        seller_id: seller.id,
        name,
        slug,
        owner_name: ownerName,
        description,
        location,
        status: "pending_review",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "seller_id" }
    )
    .select("id")
    .single();

  if (storeError || !store) {
    console.error("Error creating/updating store:", storeError);
    throw new Error(storeError?.message || "Could not create store.");
  }

  // 3. Create KYC Submission
  const nationalIdNumber = (formData.get("nationalIdNumber") as string) || null;
  const businessName = (formData.get("businessName") as string) || null;
  const businessRegistrationNumber = (formData.get("businessRegistrationNumber") as string) || null;
  const university = (formData.get("university") as string) || null;
  const studentIdNumber = (formData.get("studentIdNumber") as string) || null;
  const studentEmail = (formData.get("studentEmail") as string) || null;

  const { data: kycSubmission, error: kycError } = await supabase
    .from("kyc_submissions")
    .insert({
      seller_id: seller.id,
      seller_type: sellerType,
      status: "submitted",
      national_id_number: nationalIdNumber,
      business_name: businessName,
      registration_number: businessRegistrationNumber,
      university,
      student_id_number: studentIdNumber,
      student_email: studentEmail,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (kycError) {
    console.error("Error creating KYC submission:", kycError);
  }

  // 4. Handle Document Uploads (Supabase Storage + ImageKit + Sanity Sync)
  const filesToUpload: Array<{ file: File; type: string }> = [];

  const nationalIdFront = formData.get("nationalIdFront") as File | null;
  if (nationalIdFront && nationalIdFront.size > 0) {
    filesToUpload.push({ file: nationalIdFront, type: "national_id_front" });
  }

  const nationalIdBack = formData.get("nationalIdBack") as File | null;
  if (nationalIdBack && nationalIdBack.size > 0) {
    filesToUpload.push({ file: nationalIdBack, type: "national_id_back" });
  }

  const businessDoc = formData.get("businessDoc") as File | null;
  if (businessDoc && businessDoc.size > 0) {
    filesToUpload.push({ file: businessDoc, type: "business_registration" });
  }

  const studentIdDoc = formData.get("studentIdDoc") as File | null;
  if (studentIdDoc && studentIdDoc.size > 0) {
    filesToUpload.push({ file: studentIdDoc, type: "student_id_front" });
  }

  for (const { file, type } of filesToUpload) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const storagePath = `${user.id}/${safeFilename}`;

      // Upload to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from("kyc-documents")
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (storageError) {
        console.warn("Supabase storage upload note:", storageError.message);
      }

      // Sync to ImageKit
      const imagekitUrl = await uploadToImageKit(buffer, safeFilename, seller.id);

      // KYC documents are NOT mirrored to Sanity assets: those are served from a
      // public CDN URL. They live in the private Supabase bucket (and a private
      // ImageKit copy) only.

      // Record in kyc_documents table
      if (kycSubmission?.id) {
        await supabase.from("kyc_documents").insert({
          kyc_submission_id: kycSubmission.id,
          document_type: type as any,
          storage_path: storagePath,
          imagekit_url: imagekitUrl,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
        });
      }
    } catch (uploadErr) {
      console.error("Document upload/sync error:", uploadErr);
    }
  }

  // 5. Initial Store Sync to Sanity CMS
  const sanityStoreId = await syncStoreToSanity({
    storeId: store.id,
    sellerId: seller.id,
    supabaseUserId: user.id,
    name,
    slug,
    ownerName,
    sellerType,
    phone,
    email,
    location,
    description,
    nationalIdNumber: nationalIdNumber || undefined,
    businessName: businessName || undefined,
    businessRegistrationNumber: businessRegistrationNumber || undefined,
    university: university || undefined,
    studentIdNumber: studentIdNumber || undefined,
    studentEmail: studentEmail || undefined,
  });

  if (sanityStoreId) {
    await supabase
      .from("stores")
      .update({ sanity_store_id: sanityStoreId })
      .eq("id", store.id);
  }

  // Redirect to application pending review page
  redirect("/pending-review");
}