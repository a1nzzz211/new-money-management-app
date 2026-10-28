"use client";

import { useLinkStatus } from "next/link";

/**
 * Fixed top progress bar rendered inside a Link. It only becomes visible when
 * that link's navigation is pending, so it works without a global store.
 */
export function LinkProgress() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 origin-left bg-primary transition-opacity duration-150 delay-100 ${
        pending ? "animate-route-progress opacity-100" : "opacity-0"
      }`}
    />
  );
}
