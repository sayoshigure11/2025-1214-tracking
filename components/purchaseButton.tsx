"use client";

import { useTracker } from "@/hooks/useTracker";

export function PurchaseButton() {
  const { track } = useTracker();

  return (
    <button onClick={() => track("purchase_click", { plan: "pro" })}>
      Buy Pro
    </button>
  );
}
