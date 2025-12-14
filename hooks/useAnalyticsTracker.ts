"use client"

import { BeaconEvent, BeaconPayload } from "@/types/analytics";
import { useCallback, useEffect, useRef } from "react";

// Next.jsのAPIエンドポイント
const LOGGING_ENDPOINT = '/api/log';
const BATCH_SIZE = 5; // バッチとして即時送信する閾値

/**
 * Beacon APIを使用したアナリティクストラッキングのためのカスタムフック。
 * ページアンロード時（pagehide / visibilityState 'hidden'）にイベントをバッチ送信します。
 */
const sessionKari = Math.random().toString(36).substring(2, 15)
const now = Date.now()
export const useAnalyticsTracker = () => {
    // stateではなく、DOMライフサイクル外で値を保持するためuseRefを使用
    const eventsRef = useRef<BeaconEvent[]>([])
    const sessionIdRef = useRef<string>(sessionKari)
    const sessionStartRef = useRef<number>(now)
    const isUnloadingRef = useRef<boolean>(false) // 二重送信防止フラグ

    const generatePayload = useCallback((): BeaconPayload => {
        return {
            sessionId: sessionIdRef.current,
            sessionDuration: Date.now() - sessionStartRef.current,
            events: [...eventsRef.current], // 現在のイベントのコピー
            url: window.location.href,
            userAgent: navigator.userAgent
        }
    }, [])
/**
   * データをBeacon APIで送信キューに追加する処理
   */
    const sendBatch = useCallback(() => {
        // 既に送信処理が始まっていたら二重処理を防ぐ
        if (isUnloadingRef.current) return
        if (eventsRef.current.length === 0) return
        
        const payload = generatePayload()
        const data = JSON.stringify(payload)

        if (!navigator.sendBeacon) {
            console.warn('[Beacon API] ブラウザがsendBeaconをサポートしていません。');
            // 古いブラウザ向けの同期XHRフォールバックをここに実装することもできます。
        } else {
            // 補足: Beacon APIはペイロードサイズに制限がある（通常64KB程度）
            const success = navigator.sendBeacon(LOGGING_ENDPOINT, data)

            if (success) {
                // 送信がブラウザのキューに入れられたらイベントリストをクリア
                eventsRef.current = []
                isUnloadingRef.current = true // アンロードフェーズに入ったことをマーク
                console.log(`[Beacon API] ${payload.events.length}件のイベントを送信キューに追加しました。`);
            } else {
                console.error('[Beacon API] 送信キューへの追加に失敗。ペイロードサイズやデータ型を確認してください。');
            }
        }
    }, [generatePayload])
    
/**
   * イベントをキューに追加する関数
   */
    const trackEvent = useCallback((type: string, data: Record<string, any>) => {
        const newEvent: BeaconEvent = { type, data, timestamp: Date.now() }
        
        eventsRef.current.push(newEvent)
        console.log(`[Analytics] イベントを追加: ${type}`);

        // イベントがバッチサイズに達したら、ページアンロード前でも即時送信する
        if (eventsRef.current.length >= BATCH_SIZE) {
            sendBatch()
        }
    }, [sendBatch])
    
    // ページアンロード時のイベントリスナー設定
    useEffect(() => {
        // 1. ページが非表示になったとき (タブ切り替え、アプリ切り替え)
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                sendBatch()
            }
        }

        // 2. ページがアンロードされるとき (ページ遷移、タブを閉じる)
        // *補足: pagehideはBFcacheをサポートするため、beforeunloadよりも推奨されます。
        const handlePageHide = () => {
            sendBatch()
        }

        // 3. エラーイベントのトラッキング (ブログで言及されていた内容)
        const handleError = (event: ErrorEvent) => {
            trackEvent("error", {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack:event.error?.stack
            })
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        window.addEventListener("pagehide", handlePageHide)
        window.addEventListener("error", handleError)
        
        return () => {
// コンポーネントのアンマウント時にイベントリスナーをクリーンアップ
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('error', handleError);
        }
    }, [sendBatch, trackEvent])
    
    return {trackEvent, sessionId: sessionIdRef.current}
}