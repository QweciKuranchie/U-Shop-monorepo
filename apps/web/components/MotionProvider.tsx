"use client";

import { MotionConfig } from "motion/react";

/** Makes every motion animation honour the OS "reduce motion" setting. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
