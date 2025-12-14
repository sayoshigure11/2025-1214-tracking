export interface BeaconEvent {
    type: string, // イベント種別 (例: 'cta_click', 'page_view', 'error')
    data: Record<string, any>, // イベント固有のデータ
    timestamp: number // 発生時刻 (ミリ秒)
}

export interface BeaconPayload {
    sessionId: string, // セッションID
    sessionDuration: number, // セッション開始からの時間（ms）
    events: BeaconEvent[], // バッチ処理されたイベントのリスト
    url: string,
    userAgent: string // ユーザーエージェント
}

// サーバー側で受信するデータの型
export type LogRequest = BeaconPayload