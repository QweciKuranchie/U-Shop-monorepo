import { NextRequest, NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/actions/subscriptionActions";
import { sendMail } from "@/lib/emailService";
import { checkRateLimit, getClientIp } from "@repo/utils/rate-limit";
import { escapeHtml, unsubscribeToken } from "@/lib/newsletterToken";

const ALLOWED_SOURCES = ["footer", "homepage", "checkout", "account"];

export async function POST(request: NextRequest) {
  try {
    // Apply Rate Limiting (max 5 subscriptions per 10 mins per IP)
    const rateLimitError = await checkRateLimit(request, "newsletter-sub", {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const source = ALLOWED_SOURCES.includes(body?.source) ? body.source : "footer";

    // Validate email presence and length (RFC 5321 max is 254)
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (email.length > 254) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    // Get client info
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Subscribe to newsletter
    const result = await subscribeToNewsletter({
      email,
      source,
      ipAddress,
      userAgent,
    });

    // If subscription failed or already subscribed
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.message,
          alreadySubscribed: result.alreadySubscribed || false,
        },
        { status: result.alreadySubscribed ? 200 : 400 }
      );
    }

    // Send welcome email
    const emailResult = await sendMail({
      email: email.toLowerCase(),
      subject: "Welcome to U-Shop Newsletter!",
      text: "Thanks for subscribing to the U-Shop newsletter. We'll email you about new arrivals, deals and updates.",
      html: generateWelcomeEmailHTML(email.toLowerCase()),
    });

    if (!emailResult.success) {
      console.error("Failed to send welcome email:", emailResult.error);
      // Still return success for subscription even if email fails
    }

    return NextResponse.json(
      {
        message: result.message,
        subscriptionId: result.data?.subscriptionId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter subscription API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

// Welcome email. Only states things that are true: no invented subscriber counts,
// discounts, addresses or social links.
function generateWelcomeEmailHTML(email: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://ushopgh.com";
  const token = unsubscribeToken(email);
  const unsubscribeUrl = `${base}/unsubscribe?email=${encodeURIComponent(email)}${
    token ? `&token=${token}` : ""
  }`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to U-Shop</title>
</head>
<body style="margin:0;background:#f8f9fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#333;line-height:1.6;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#6B1FA8;color:#ffffff;padding:32px 20px;text-align:center;">
      <h1 style="margin:0 0 8px;font-size:28px;">Welcome to U-Shop</h1>
      <p style="margin:0;font-size:16px;">You're subscribed to our newsletter.</p>
    </div>
    <div style="padding:32px 24px;">
      <p style="font-size:16px;">Thanks for subscribing. We'll email you about new arrivals, deals and updates from Ghana's tech marketplace for students.</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="${base}" style="display:inline-block;background:#6B1FA8;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;">Start shopping</a>
      </p>
      <p style="font-size:14px;color:#6c757d;">Questions? Reply to this email or write to <a href="mailto:support@ushopgh.com" style="color:#6B1FA8;">support@ushopgh.com</a>.</p>
    </div>
    <div style="background:#f1f3f5;padding:20px 24px;text-align:center;font-size:12px;color:#6c757d;">
      <p style="margin:0 0 8px;">You received this email because ${escapeHtml(email)} was subscribed to the U-Shop newsletter.</p>
      <p style="margin:0;"><a href="${unsubscribeUrl}" style="color:#6B1FA8;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}
