//// requestAnimationFrameの基本的な使い方
// "use client";

// import { useEffect, useRef } from "react";

// function AnimePage() {
//   const boxElem = useRef<HTMLDivElement>(null);
//   // アニメーションしたいオブジェクトの位置
//   // 【修正点１】アニメーションしたいオブジェクトの位置を useRef で保持
//   // 初期値 x = 0 を useRef の current に格納する
//   const xRef = useRef<number>(0);
//   const directionRef = useRef<"right" | "left">("right");
//   // アニメーションループ関数
//   function animate() {
//     // 【修正点２】値の読み書きは xRef.current を使う
//     const x = xRef.current; // 読み込み
//     // 何らかの描画処理
//     if (!boxElem.current) return;
//     boxElem.current.style.transform = `translateX(${x}px)`;

//     const direction = directionRef.current;
//     if (x > 300) {
//       directionRef.current = "left";
//     } else if (x < 0) {
//       directionRef.current = "right";
//     }

//     // 値を更新して
//     if (direction === "left") {
//       xRef.current -= 1;
//     } else {
//       xRef.current += 1;
//     }
//     requestAnimationFrame(animate);
//   }

//   useEffect(() => {
//     // 実行開始
//     requestAnimationFrame(animate);
//   }, []);
//   return (
//     <div>
//       <div ref={boxElem}>box</div>
//     </div>
//   );
// }

// export default AnimePage;

// requestAnimationFrameを使った効率的なスクロール検知
"use client";

import { useEffect, useRef } from "react";

function RequestAnimationFrameScrollPage() {
  // 処理の実行を制限するためのフラグ
  const isTicking = useRef<boolean>(false);

  // 実際に実行したい処理（例: スクロール位置の取得と表示）
  function updateScrollPosition() {
    const scrollY = window.scrollY;
    console.log("処理を実行しました。現在のスクロール位置:", scrollY);

    // 例: DOMを更新する処理
    // document.getElementById('info').textContent = `Scroll: ${scrollY}`;
  }

  // requestAnimationFrame のコールバックとして登録する関数
  function requestTick() {
    // フラグをリセットし、次のイベントに備える
    isTicking.current = false;
    // 実際の処理を実行する
    updateScrollPosition();
  }

  // スクロールイベントリスナー
  function onScroll() {
    // isTicking が false の場合のみ
    if (!isTicking.current) {
      // 描画が必要な状態だとマークする
      isTicking.current = true;

      // 次のブラウザの描画サイクルに合わせて requestTick を実行するよう要求する
      window.requestAnimationFrame(requestTick);
    }
    // isTicking が true の場合、requestAnimationFrame はすでにスケジュールされているため、
    // 何もせずに関数を終了する
  }

  useEffect(() => {
    // イベントリスナーを登録
    window.addEventListener("scroll", onScroll, { passive: true });
  }, []);

  // ※ { passive: true } の推奨:
  // スクロールイベントリスナーで window.preventDefault() を呼ばない場合は、
  // ブラウザに通知するために passive: true を設定すると、パフォーマンスが向上します。
  return (
    <div className="">
      <h1 className="text-3xl text-center mt-4">
        RequestAnimationFrameScrollPage
      </h1>
      <div className="h-screen bg-linear-to-b from-blue-200 via-yellow-200 to-red-200 " />
      <div className="h-screen bg-linear-60 from-red-100 to-blue-100 " />
    </div>
  );
}

export default RequestAnimationFrameScrollPage;
