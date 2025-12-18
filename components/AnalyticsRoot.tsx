"use client";

import { ScrollDepthObserver } from "./ScrollDepthObserver";

export function AnalyticsRoot() {
  return (
    <ScrollDepthObserver
      onReach={(p) => {
        console.log(`全ページ：${p * 100}`);
        // analytics.track(...)
      }}
    />
  );
}
