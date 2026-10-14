import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import Logo from "@/components/common/Logo";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center gap-4 text-white p-6 bg-white/10 border border-white/20 rounded-3xl shadow-2xl">
      <Logo imageClassName="h-10 w-auto" />
      <div className="w-8 h-8 border-4 border-ushop-pink border-t-transparent rounded-full animate-spin mt-2"></div>
      <p className="text-sm font-semibold text-purple-200">Completing secure login...</p>
      <AuthenticateWithRedirectCallback signUpFallbackRedirectUrl="/" signInFallbackRedirectUrl="/" />
      <div id="clerk-captcha" />
    </div>
  );
}
