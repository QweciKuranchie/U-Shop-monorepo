import { createServerClient } from "@repo/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { safeAuthPath } from "@/lib/safe-auth-path";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeAuthPath(searchParams.get("next"), "/dashboard");

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth-callback-failed`);
}
