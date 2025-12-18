"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function IntersectionObserverPage() {
  const textRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      console.log("交差判定:", entry.isIntersecting);
      console.log("要素の位置(top):", entry.boundingClientRect.top);
      if (entry.isIntersecting) {
        console.log("こんにちは");
      }
    });

    if (!textRef.current) return;
    observer.observe(textRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <div className="h-screen bg-linear-30 from-blue-900 to-blue-100" />
      <div className="h-[50vh] bg-linear-60 from-red-100 to-red-900" />
      <p ref={textRef} className="h-60 bg-amber-500">
        こんにちは
      </p>
      <div className="h-[50vh] bg-linear-120 from-green-900 to-green-100" />
      <div className="h-screen bg-linear-150 from-yellow-100 to-yellow-900" />
      <Link href={"/kari"}>kari</Link>
    </div>
  );
}
