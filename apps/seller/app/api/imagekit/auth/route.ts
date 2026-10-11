import { NextRequest, NextResponse } from "next/server";
import { getImageKitAuthParams } from "@repo/media";
import { checkRateLimit } from "@repo/utils/rate-limit";
import { createServerClient } from "@repo/supabase/server";

export async function GET(request: NextRequest) {
  // Upload signatures let the holder write to our ImageKit account, so only
  // signed-in sellers may request them.
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rateLimitError = await checkRateLimit(request, "imagekit-auth", {
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (rateLimitError) return rateLimitError;

    const authParams = getImageKitAuthParams();
    return NextResponse.json(authParams);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate authentication parameters.";
    console.error("Error generating ImageKit auth parameters:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
