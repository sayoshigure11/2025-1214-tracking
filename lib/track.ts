// import { logDB } from "./db"

// // // クライアントコンポーネントでしか動かないのにサーバー側で呼び出されてしまいエラーが出る
// // const worker = new Worker(
// //     new URL('../workers/analytics.worker.ts', import.meta.url)
// // )

// const worker = (typeof window !== "undefined")
//     ? new Worker(
//         new URL("../workers/analytics.worker.ts", import.meta.url))
//     : null // サーバー側ではnullを設定

// export async function trackEvent(type: string, payload: unknown) {
//     const event = {
//         type,
//         payload,
//         createdAt: Date.now()
//     }

//     // 永続化
//     await logDB.logs.add(event)

//     // // Workerに送信
//     // worker.postMessage(event)

//     // Workerが存在する場合にのみ送信
//     if (worker) {
//         worker.postMessage(event)
//     } else {
//         console.log("workerが存在しない")
//     }
// }