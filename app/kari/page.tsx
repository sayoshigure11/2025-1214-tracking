"use client";

import Link from "next/link";

export default function Page() {
  return (
    <div className="relative">
      {/* あなたの既存のコンテンツ */}
      <div className="h-screen bg-blue-200" />
      <div className="h-screen bg-red-200" />
      <div className="h-screen bg-green-200" />
      <div className="h-screen bg-yellow-200" />
      <Link href={"/intersectionObserver"}>IntersectionObserverPage</Link>
    </div>
  );
}
