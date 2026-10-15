"use client";

import AuthSwitch from "@/components/ui/auth-switch";

interface SlidingAuthProps {
  initialMode?: "sign-in" | "sign-up";
  isModal?: boolean;
}

export default function SlidingAuthContainer({
  initialMode = "sign-in",
  isModal = false,
}: SlidingAuthProps) {
  return <AuthSwitch initialMode={initialMode} isModal={isModal} />;
}
