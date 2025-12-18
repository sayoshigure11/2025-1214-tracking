// "use client";

// import { useEffect, useRef } from "react";

// export default function IntersectionObserverPage() {
//   const textRef = useRef(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(([entry]) => {
//       console.log("交差判定:", entry.isIntersecting);
//       console.log("要素の位置(top):", entry.boundingClientRect.top);
//       if (entry.isIntersecting) {
//         console.log("こんにちは");
//       }
//     });

//     if (!textRef.current) return;
//     observer.observe(textRef.current);

//     return () => observer.disconnect();
//   }, []);

//   return (
//     <div>
//       <div className="h-screen bg-linear-30 from-blue-900 to-blue-100" />
//       <div className="h-[50vh] bg-linear-60 from-red-100 to-red-900" />
//       <p ref={textRef} className="h-60 bg-amber-500">
//         こんにちは
//       </p>
//       <div className="h-[50vh] bg-linear-120 from-green-900 to-green-100" />
//       <div className="h-screen bg-linear-150 from-yellow-100 to-yellow-900" />
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";

const DEPTHS = [0.25, 0.5, 0.75, 1];

export function ScrollDepthObserver({
  onReach,
}: {
  onReach: (percent: number) => void;
}) {
  const reached = useRef(new Set<number>());
  const markers = useRef<Map<number, HTMLDivElement>>(new Map());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // DOMが完全にレンダリングされるまで待つ
    const timer = setTimeout(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      // const viewportHeight = window.innerHeight;
      // const scrollableHeight = scrollHeight - viewportHeight;

      DEPTHS.forEach((p) => {
        const el = markers.current.get(p);
        if (!el) return;

        // スクロール可能な高さに基づいて位置を計算
        // const position = scrollableHeight * p + viewportHeight;
        const position = scrollHeight * p;
        el.style.top = `${position}px`;
      });

      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const percent = Number(entry.target.getAttribute("data-percent"));
          if (reached.current.has(percent)) continue;

          reached.current.add(percent);
          onReach(percent);

          observer.unobserve(entry.target);
        }
      },
      {
        // ビューポートの上端で検知
        rootMargin: "0px",
        threshold: 0,
      }
    );

    markers.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [onReach, isReady]);

  return (
    <>
      {DEPTHS.map((p) => (
        <div
          key={p}
          data-percent={p}
          ref={(el) => {
            if (el) {
              markers.current.set(p, el);
            }
          }}
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            pointerEvents: "none",
            left: 0,
          }}
        />
      ))}
    </>
  );
}

// デモ用コンポーネント
export default function Demo() {
  return (
    <div style={{ position: "relative" }}>
      <ScrollDepthObserver
        onReach={(p) => {
          console.log(`スクロール深度: ${p * 100}%`);
        }}
      />
      <div
        style={{
          height: "100vh",
          background: "linear-gradient(to bottom, #1e3a8a, #93c5fd)",
        }}
      >
        <h1 style={{ padding: "2rem", color: "white" }}>ページトップ</h1>
      </div>
      <div
        style={{
          height: "50vh",
          background: "linear-gradient(to bottom, #fef3c7, #b91c1c)",
        }}
      >
        <p style={{ padding: "2rem" }}>25%地点</p>
      </div>
      <div style={{ height: "60vh", background: "#f59e0b", padding: "2rem" }}>
        <p>50%地点付近</p>
      </div>
      <div
        style={{
          height: "50vh",
          background: "linear-gradient(to bottom, #065f46, #d1fae5)",
        }}
      >
        <p style={{ padding: "2rem" }}>75%地点</p>
      </div>
      <div
        style={{
          height: "100vh",
          background: "linear-gradient(to bottom, #fef9c3, #a16207)",
        }}
      >
        <p style={{ padding: "2rem" }}>100%地点（最下部）</p>
      </div>
    </div>
  );
}
