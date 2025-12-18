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

// 修正版2
"use client";

import { useEffect, useRef } from "react";

const DEPTHS = [0.25, 0.5, 0.75, 1];

export function ScrollDepthObserver({
  onReach,
}: {
  onReach: (percent: number) => void;
}) {
  const reached = useRef(new Set<number>());
  const markers = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
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
        rootMargin: "0px 0px -99% 0px",
        threshold: 0,
      }
    );

    markers.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [onReach]);

  useEffect(() => {
    const pageHeight = document.documentElement.scrollHeight;

    DEPTHS.forEach((p) => {
      const el = markers.current.get(p);
      if (!el) return;

      el.style.top = `${pageHeight * p}px`;
    });
  }, []);

  return (
    <>
      {DEPTHS.map((p) => (
        <div
          key={p}
          data-percent={p}
          ref={(el) => {
            if (el && !markers.current.has(p)) {
              markers.current.set(p, el);
            }
          }}
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}
