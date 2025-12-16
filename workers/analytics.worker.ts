/// <reference lib="webworker" />

let buffer: unknown[] = []
const BUFFER_SIZE_LIMIT = 10; // [設定] サイズによる即時送信の閾値
const TIME_LIMIT_MS = 5000;   // [設定] 5秒ごとに強制送信

// ----------------------------------------------------
// (1) フラッシュ処理: メインスレッドへのデータ転送を実行
// ----------------------------------------------------
function flush() {
    // console.log("flush起動")
    if (buffer.length === 0) return;
    console.log("flush発火 (データをメインスレッドへ送信)");
    const payload = JSON.stringify({ events: buffer })
    // Web Worker内ではnavigator.sendBeaconは使えない。fetchは使える
    // navigator.sendBeacon("/api/log", payload)

    // worker内でのfetchとメインスレッドのsendBeaconが重複する可能性がある
    // そこでデータ送信はメインスレッドに一任する
    // web workerはログの収集とバッファリングだけを担当

    // 🚀転送するペイロードをJSON文字列に変更
    self.postMessage({
        type: "LOG_DATA_PAYLOAD", // データ型を区別
        payload: payload
    })
    // 🚀Workerのバッファはクリア
    buffer = []
}

// ----------------------------------------------------
// (2) イベントリスナー: サイズが閾値に達したらフラッシュ
// ----------------------------------------------------
self.onmessage = (e: MessageEvent) => {
    console.log("e[worker]", e)
    buffer.push(e.data)

    if (buffer.length >= BUFFER_SIZE_LIMIT) {
        flush()
    }
}

// ----------------------------------------------------
// (3) タイマー処理: 一定時間ごとに強制的にフラッシュ
// ----------------------------------------------------
// Workerのグローバルスコープで実行される
if (typeof self !== 'undefined') {
    // メインスレッドをブロックしない非同期タイマー
    setInterval(() => {
        // buffer にデータがある場合のみ flush を実行
        if (buffer.length > 0) {
            flush();
        }
    }, TIME_LIMIT_MS);
}