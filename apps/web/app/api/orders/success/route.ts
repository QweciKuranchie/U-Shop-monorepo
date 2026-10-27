import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { checkRateLimitByKey } from "@repo/utils/rate-limit";
import { getAuthUser } from "@/lib/getAuthUser";

export const dynamic = "force-dynamic";

/**
 * The signed-in user's own orders, for the post-payment success page.
 *
 * The page used to run this GROQ query FROM THE BROWSER against Sanity's public
 * API with `clerkUserId` taken from client state. That only worked because the
 * whole dataset was publicly readable, which also exposed every customer's
 * orders, addresses, wallet balances and KYC details. The query now runs here,
 * with the identity taken from the verified session.
 */
export async function GET(request: NextRequest) {
  const { userId } = await getAuthUser(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await checkRateLimitByKey(userId, "orders:success", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const orders = await writeClient.fetch(
    `*[_type == "order" && clerkUserId == $userId] | order(orderDate desc)[0...20]{
      ...,
      products[]{ ..., product-> }
    }`,
    { userId }
  );
  return NextResponse.json(orders ?? [], { headers: { "Cache-Control": "private, no-store" } });
}
