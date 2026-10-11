import { NextRequest, NextResponse } from "next/server";
import { unsubscribeFromNewsletter } from "@/actions/subscriptionActions";
import { verifyUnsubscribeToken } from "@/lib/newsletterToken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Only the link we emailed can unsubscribe an address; otherwise anyone could
    // unsubscribe anyone else.
    if (!verifyUnsubscribeToken(email, body?.token)) {
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
