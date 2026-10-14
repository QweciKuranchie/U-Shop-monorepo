import { createServerClient } from "@repo/supabase/server";
import { client } from "@repo/sanity";
import { SELLER_STORE_QUERY, SELLER_ORDERS_QUERY } from "@repo/sanity/queries";
import { NextResponse } from "next/server";
import { aggregateWeeklyRevenue, type SellerOrder } from "@/lib/sellerOrders";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await client.fetch(SELLER_STORE_QUERY, { userId: user.id });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const orders = await client.fetch(SELLER_ORDERS_QUERY, { storeId: store._id });
  const weeklyRevenue = aggregateWeeklyRevenue((orders || []) as SellerOrder[]);

  return NextResponse.json({ weeklyRevenue });
}