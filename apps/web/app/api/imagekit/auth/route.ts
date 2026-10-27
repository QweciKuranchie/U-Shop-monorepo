import { NextRequest, NextResponse } from "next/server";
import { getImageKitAuthParams } from "@repo/media";
import { checkRateLimitByKey } from "@repo/utils/rate-limit";
import { getAuthUser } from "@/lib/getAuthUser";

export async function GET(request: NextRequest) {
  // The signature lets the holder upload to OUR ImageKit account, so it is only
  // issued to signed-in users (it used to be public: anyone could use our storage
  // and bandwidth to host files).
  const { userId } = await getAuthUser(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rateLimitError = await checkRateLimitByKey(userId, "imagekit-auth", {
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
