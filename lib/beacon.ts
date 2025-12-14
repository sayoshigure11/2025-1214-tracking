export function sendBeacon(
    url: string,
    data:Record<string,unknown>
): boolean {
    try {
        const payload = JSON.stringify(data)

        // 64KB 制限チェック（目安）
        if (payload.length > 65536) {
            console.warn('Beacon payload too large:', payload.length)
            return false
        }

    // sendBeacon が使えない場合は false を返す
    if (!navigator.sendBeacon) {
      console.warn('Beacon not supported; skipping.');
      return false;
    }
        
        return navigator.sendBeacon(url, payload)
    } catch (err) {
    console.error('Beacon send failed:', err);
    return false;
    }
}