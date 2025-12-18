//// 最初に25が表示されて一番下までスクロールしても50や100などが表示されない
//// そして一番下から上にスクロールすると100、75、50の順に表示されて25は表示されない
// "use client";

// import { useEffect, useRef } from "react";

// const DEPTHS = [0.25, 0.5, 0.75, 1];

// export function ScrollDepthObserver({
//   onReach,
// }: {
//   onReach: (percent: number) => void;
// }) {
//   const reachedRef = useRef<Set<number>>(new Set());
//   const markersRef = useRef<HTMLDivElement[]>([]);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (!entry.isIntersecting) return;

//         const percent = Number(entry.target.getAttribute("data-percent"));

//         if (!reachedRef.current.has(percent)) {
//           reachedRef.current.add(percent);
//           onReach(percent);
//           console.log("markersRef.current", markersRef.current);
//         }
//       },
//       { rootMargin: "0px", threshold: 0 }
//     );

//     markersRef.current.forEach((el) => observer.observe(el));

//     return () => observer.disconnect();
//   }, [onReach]);
//   return (
//     <>
//       {DEPTHS.map((p) => (
//         <div
//           key={p}
//           ref={(el) => {
//             if (el) markersRef.current.push(el);
//           }}
//           data-percent={p}
//           style={{
//             position: "absolute",
//             top: `${p * 100}vh`,
//             width: 1,
//             height: 1,
//             pointerEvents: "none",
//           }}
//         />
//       ))}
//     </>
//   );
// }

// // 修正バージョン
//// 最初から50が表示されて一番下に行く前に100が表示される問題がある。
// "use client";

// import { useEffect, useRef } from "react";

// const DEPTHS = [0.25, 0.5, 0.75, 1];

// export function ScrollDepthObserver({
//   onReach,
// }: {
//   onReach: (percent: number) => void;
// }) {
//   const reached = useRef(new Set<number>());
//   const markers = useRef<Map<number, HTMLDivElement>>(new Map());

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         for (const entry of entries) {
//           if (!entry.isIntersecting) continue;

//           // const percent = Number(entry.target.dataset.percent);
//           const percent = Number(entry.target.getAttribute("data-percent"));

//           if (reached.current.has(percent)) continue;

//           reached.current.add(percent);
//           onReach(percent);

//           // 🔥 二度と発火させない
//           observer.unobserve(entry.target);
//         }
//       },
//       {
//         threshold: 0,
//       }
//     );

//     markers.current.forEach((el) => observer.observe(el));

//     return () => observer.disconnect();
//   }, [onReach]);

//   useEffect(() => {
//     const pageHeight = document.documentElement.scrollHeight;
//     const viewportHeight = window.innerHeight;

//     DEPTHS.forEach((p) => {
//       const el = markers.current.get(p);
//       if (!el) return;

//       const top = pageHeight * p - viewportHeight;
//       el.style.top = `${top}px`;
//     });
//   }, []);

//   return (
//     <>
//       {DEPTHS.map((p) => (
//         <div
//           key={p}
//           data-percent={p}
//           ref={(el) => {
//             if (el && !markers.current.has(p)) {
//               markers.current.set(p, el);
//             }
//           }}
//           style={{
//             position: "absolute",
//             width: 1,
//             height: 1,
//             pointerEvents: "none",
//           }}
//         />
//       ))}
//     </>
//   );
// }

// // 修正版2
// "use client";

// import { useEffect, useRef } from "react";

// const DEPTHS = [0.25, 0.5, 0.75, 1];

// export function ScrollDepthObserver({
//   onReach,
// }: {
//   onReach: (percent: number) => void;
// }) {
//   const reached = useRef(new Set<number>());
//   const markers = useRef<Map<number, HTMLDivElement>>(new Map());

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         for (const entry of entries) {
//           if (!entry.isIntersecting) continue;

//           const percent = Number(entry.target.getAttribute("data-percent"));
//           if (reached.current.has(percent)) continue;

//           reached.current.add(percent);
//           onReach(percent);

//           observer.unobserve(entry.target);
//         }
//       },
//       {
//         rootMargin: "0px 0px -99% 0px",
//         threshold: 0,
//       }
//     );

//     markers.current.forEach((el) => observer.observe(el));

//     return () => observer.disconnect();
//   }, [onReach]);

//   useEffect(() => {
//     const pageHeight = document.documentElement.scrollHeight;

//     DEPTHS.forEach((p) => {
//       const el = markers.current.get(p);
//       if (!el) return;

//       el.style.top = `${pageHeight * p}px`;
//     });
//   }, []);

//   return (
//     <>
//       {DEPTHS.map((p) => (
//         <div
//           key={p}
//           data-percent={p}
//           ref={(el) => {
//             if (el && !markers.current.has(p)) {
//               markers.current.set(p, el);
//             }
//           }}
//           style={{
//             position: "absolute",
//             width: 1,
//             height: 1,
//             pointerEvents: "none",
//           }}
//         />
//       ))}
//     </>
//   );
// }

// 修正版3
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const DEPTHS = [0.25, 0.5, 0.75, 1];

export function ScrollDepthObserver({
  onReach,
}: {
  onReach: (percent: number, pathname: string) => void;
}) {
  const pathname = usePathname();
  const reached = useRef(new Map<string, Set<number>>());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const markersRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // ページ遷移時に状態をリセット
    if (!reached.current.has(pathname)) {
      reached.current.set(pathname, new Set());
    }

    // 前のObserverをクリーンアップ
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // DOMの準備を待つ
    const timer = setTimeout(() => {
      const scrollHeight = document.documentElement.scrollHeight;

      // マーカーの位置を設定
      markersRef.current.forEach((el) => {
        if (!el) return;
        const percent = Number(el.getAttribute("data-percent"));
        const position = scrollHeight * percent;
        el.style.top = `${position}px`;
      });

      // IntersectionObserverを作成
      const observer = new IntersectionObserver(
        (entries) => {
          const pageReached = reached.current.get(pathname);
          if (!pageReached) return;

          for (const entry of entries) {
            if (!entry.isIntersecting) continue;

            const percent = Number(entry.target.getAttribute("data-percent"));
            if (pageReached.has(percent)) continue;

            pageReached.add(percent);
            onReach(percent, pathname);
            console.log(`✓ [${pathname}] ${percent * 100}%到達`);

            observer.unobserve(entry.target);
          }
        },
        {
          rootMargin: "0px",
          threshold: 0,
        }
      );

      // すべてのマーカーを監視
      markersRef.current.forEach((el) => {
        if (el) observer.observe(el);
      });

      observerRef.current = observer;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pathname, onReach]);

  return (
    <>
      {DEPTHS.map((p, index) => (
        <div
          key={`${pathname}-${p}`}
          data-percent={p}
          ref={(el) => {
            if (el) {
              markersRef.current[index] = el;
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
