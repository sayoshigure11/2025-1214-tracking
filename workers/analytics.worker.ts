/// <reference lib="webworker" />

let buffer:unknown[] = []


function flush() {
    // console.log("flush起動")
    console.log("flush起動 (データをメインスレッドへ送信)");
    const payload = JSON.stringify({ events: buffer })
    // Web Worker内ではnavigator.sendBeaconは使えない。fetchは使える
    navigator.sendBeacon("/api/log", payload)

    // worker内でのfetchとメインスレッドのsendBeaconが重複する可能性がある
    // そこでデータ送信はメインスレッドに一任する
    // web workerはログの収集とバッファリングだけを担当

    self.postMessage({
        type: "LOG_DATA",
        payload: buffer
    })
    buffer = []
}

self.onmessage = (e: MessageEvent) => {
    console.log("e[worker]", e)
    buffer.push(e.data)

    if (buffer.length >= 10) {
        flush()
    }
}