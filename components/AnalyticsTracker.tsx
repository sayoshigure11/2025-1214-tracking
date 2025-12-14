"use client";

import { sendBeacon } from "@/lib/beacon";
import { useEffect, useRef } from "react";

export interface EventItem {
  type: string;
  data: Record<string, unknown>;
}

export const AnalyticsTracker = () => {
  const eventQueue = useRef<EventItem[]>([]);

  const flushEvents = () => {
    if (eventQueue.current.length === 0) return;

    sendBeacon("/api/log", {
      events: [...eventQueue.current],
      timestamp: new Date().toISOString(),
    });

    eventQueue.current = [];
  };

  const trackEvent = (type: string, data: Record<string, unknown>) => {
    eventQueue.current.push({ type, data });
  };

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        flushEvents();
      } else {
        fetch("/api/log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            events: [...eventQueue.current],
            timestamp: new Date().toISOString(),
          }),
          keepalive: true,
        });
      }
    };

    const handleBeforeUnload = () => {
      flushEvents();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // 例: ページビュー初期イベント
  useEffect(() => {
    trackEvent("page_view", { path: window.location.pathname });
  }, []);

  return null;
};
