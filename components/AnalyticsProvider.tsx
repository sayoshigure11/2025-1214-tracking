"use client";

import React, { useEffect } from "react";
import { logDB } from "../lib/db";

export async function trackEvent(type: string, payload: unknown) {
  const event = {
    type,
    payload,
    createdAt: Date.now(),
  };

  // 永続化
  await logDB.logs.add(event);

  // // Workerに送信
  // worker.postMessage(event)

  // Workerが存在する場合にのみ送信
  if (worker) {
    worker.postMessage(event);
  } else {
    console.log("workerが存在しない");
  }
}
// Web Workerの起動や初期化ロジックはここに
// クライアントコンポーネントでしか動かないのにサーバー側で呼び出されてしまいエラーが出る
const worker =
  typeof window !== "undefined"
    ? new Worker(new URL("../workers/analytics.worker.ts", import.meta.url))
    : null; // サーバー側ではnullを設定
// 🚀 修正点 1: logBufferを、JSON文字列（未送信の送信単位）を保持するバッファに変更
let payloadBuffer: string[] = [];

function sendDataWithFetch() {
  if (payloadBuffer.length === 0) return;
  console.log("sendDataWithFetchが起動！");

  // 現在バッファにあるすべてのデータを送信対象として取り出し

  // 🚀 修正点 2: 現在バッファにあるすべてのJSON文字列を結合
  // Note: 実際には1つのfetchで複数送信するとサーバー側の処理が楽
  // ここではシンプルに、バッファから取り出して送信完了したと見なします
  const payloadsToSend = [...payloadBuffer];
  payloadBuffer = []; // バッファクリア

  //   fetch("/api/log", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ events: dataToSend }),
  //     keepalive: true,
  //   })
  //     .then((response) => {
  //       if (!response.ok) {
  //         // 失敗した場合は、データをlogBufferに戻すか、エラーログとして別途処理する
  //         console.error(
  //           "定期送信失敗。データを再バッファリング。",
  //           response.statusText
  //         );
  //         // logBuffer.push(...dataToSend); // 必要なら再送を試みる
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("定期送信ネットワークエラー。", error);
  //       // logBuffer.push(...dataToSend); // 必要なら再送を試みる
  //     });

  // 結合して一括送信したい場合は、サーバー側のAPI設計に依存します
  // const combinedPayload = payloadsToSend.join('\n'); // 例: Newline Delimited JSON

  // ここではシンプルに、取り出したペイロードを一つずつfetchで送る（Workerから受け取った単位）
  // 🚨 実際にはこのfetchが失敗した場合のリカバリーロジックが必要です

  // 1. fetchのPromise配列を作成する
  const fetchPromises = payloadsToSend.map((payload) =>
    fetch("/api/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true, // ページ離脱に備えてkeepaliveを設定
    })
  );
  Promise.allSettled(fetchPromises)
    .then((results) => {
      results.forEach((result, index) => {
        const payload = payloadsToSend[index];
        if (result.status === "rejected") {
          // 失敗した場合: ネットワークエラー
          console.error("ログ送信ネットワークエラー (並列):", result.reason);
          // ログの再バッファリングなどリカバリーロジックを追加
          payloadBuffer.push(payload);
        } else if (!result.value.ok) {
          // 失敗した場合: HTTPエラー (4xx, 5xx)
          console.error(
            `ログ送信HTTPエラー ${result.value.status}。データを再バッファリング。`,
            result.value.statusText
          );
          // ログの再バッファリングなどリカバリーロジックを追加
          payloadBuffer.push(payload);
        }
      });
    })
    .catch((error) => {
      // Promise.allSettledは全体としては失敗しないため、ここは基本的に実行されない
      console.error("Promise.allSettled 処理中に予期せぬエラー:", error);
    });
}

// このロジックは、ログのバッファリングや sendBeacon 処理を含みます
function setupAnalytics() {
  if (!worker) {
    console.error("workerが存在しない");
    return;
  }
  // ... Workerからのメッセージ処理ロジック ...
  // 🚀 修正点 3: WorkerからJSON文字列（payload）を受け取る
  worker.onmessage = (e) => {
    if (e.data.type === "LOG_DATA_PAYLOAD") {
      // Workerのデータ型に合わせて変更
      payloadBuffer.push(...e.data.payload);
      // Workerからデータを受け取ったら、すぐにfetchで送信を試みる
      sendDataWithFetch();
    }
  };

  // pagehideリスナーの設定（一度だけ）
  const handlePageHide = () => {
    // ページ離脱時の sendBeacon 処理
    // 🚀 修正点 4: sendBeaconでpayloadBufferのJSON文字列をそのまま使用
    if (payloadBuffer.length > 0) {
      // sendBeaconは一つのデータしか送れないため、すべてのペイロードを一つの文字列に結合する（サーバーと仕様を合わせる）
      // 例として、配列として再度JSON化します (サーバー側の受け取りが配列の場合)
      const combinedLogs = payloadBuffer
        .map((p) => JSON.parse(p).events)
        .flat();
      //   const finalPayload = JSON.stringify({ events: logBuffer });
      const finalPayload = JSON.stringify({ events: combinedLogs });
      navigator.sendBeacon("/api/log", finalPayload);
      payloadBuffer = []; // クリア
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", handlePageHide);
  }
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // クライアント側で一度だけ解析処理をセットアップ
    setupAnalytics();

    // pagehideリスナーは永続的なため、クリーンアップ関数では削除しません。
    // もしworkerを使っているなら、workerの終了処理などはこちらに記述します。
    return () => {
      // worker.terminate();
    };
  }, []);

  return <>{children}</>;
}
