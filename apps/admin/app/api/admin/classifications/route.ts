/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { logAdminAction } from "@/lib/adminLog";
import { client, writeClient } from "@repo/sanity";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const classifications = await client.fetch(
      `*[_type == "productClassification"] | order(title asc) {
        _id,
        title,
        "slug": slug.current
      }`
    );

    const formatted = classifications.map((c: any) => ({
      id: c._id,
      _id: c._id,
      title: c.title || "",
      slug: c.slug || "",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching product classifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch product classifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, slug } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Classification title is required" },
        { status: 400 }
      );
    }

    const classificationSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newDoc = await writeClient.create({
      _type: "productClassification",
      title,
      slug: { _type: "slug", current: classificationSlug },
    });
    await logAdminAction("info", "Product classification created", { classificationId: newDoc._id, title }, userId);

    return NextResponse.json({
      success: true,
      classification: {
        id: newDoc._id,
        _id: newDoc._id,
        title: newDoc.title,
        slug: classificationSlug,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating classification:", error);
    const message = error instanceof Error ? error.message : "Failed to create classification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
