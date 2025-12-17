// throttle方式でスクロール検知の負荷軽減（高頻度で発火するイベントを間引いている）

"use client";

import { useEffect } from "react";

function throttleFunc(fn: () => void, interval: number): () => void {
  let time = Date.now() - interval;
  return () => {
    if (time + interval < Date.now()) {
      time = Date.now();
      fn();
    }
  };
}

function ThrottleScrollPage() {
  const callback = () => {
    const scrollY = window.scrollY;
    console.log("処理を実行しました。現在のスクロール位置:", scrollY);
  };
  useEffect(() => {
    window.addEventListener("scroll", throttleFunc(callback, 100));
  }, []);
  return (
    <div>
      <div className="h-screen bg-red-500 bg-linear-30 from-10% to-100%" />
      <div className="h-screen bg-purple-500 bg-linear-90 from-10% to-100%" />
    </div>
  );
}

export default ThrottleScrollPage;
