import { createServerClient } from "@repo/supabase/server";
import { client, writeClient } from "@repo/sanity";
import { SELLER_STORE_QUERY, SELLER_LISTINGS_QUERY } from "@repo/sanity/queries";
import { NextRequest, NextResponse } from "next/server";
import { parseWarranty } from "@/lib/warranty";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await client.fetch(SELLER_STORE_QUERY, { userId: user.id });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const listings = await client.fetch(SELLER_LISTINGS_QUERY, { storeId: store._id });

  return NextResponse.json({ listings });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await client.fetch(SELLER_STORE_QUERY, { userId: user.id });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const body = await request.json();
  const warranty = parseWarranty(body);
  if ("error" in warranty) return NextResponse.json({ error: warranty.error }, { status: 400 });
  const slug = (body.name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const product = await writeClient.create({
    _type: "product",
    name: body.name,
    slug: { _type: "slug", current: slug },
    price: Number(body.price),
    discount: Number(body.discount || 0),
    stock: Number(body.stock || 1),
    condition: body.condition || "new",
    description: body.description || "",
    ...warranty.data,
    store: { _type: "reference", _ref: store._id },
    status: "new",
  });

  return NextResponse.json({ product });
}