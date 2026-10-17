import { NextRequest, NextResponse } from "next/server";
import { unsubscribeFromNewsletter } from "@/lib/newsletter/subscriptions";
import { verifyUnsubscribeToken } from "@/lib/newsletterToken";
import { getAuthUser } from "@/lib/getAuthUser";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Only the link we emailed, or the signed-in owner of the address, can
    // unsubscribe it; otherwise anyone could unsubscribe anyone else.
    let allowed = verifyUnsubscribeToken(email, body?.token);
    if (!allowed) {
      const { user } = await getAuthUser(request);
      const mine = (user?.emailAddresses ?? []).map((e) => e.emailAddress.toLowerCase().trim());
      allowed = mine.includes(email.toLowerCase());
    }
    if (!allowed) {
      return NextResponse.json({ error: "This unsubscribe link is invalid or has expired." }, { status: 403 });
    }

    const result = await unsubscribeFromNewsletter(email);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter unsubscribe API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
