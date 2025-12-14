'use client';
import { useCallback, useEffect, useRef } from 'react';
import { eventDB } from '@/lib/eventStore';
import { sendBeacon } from '@/lib/beacon';

const FLUSH_LIMIT = 20;

export function useTracker() {
    const queueRef = useRef<number[]>([]);
    const flush = useCallback(async () => {
        if (queueRef.current.length === 0) return;

        const events = await eventDB.events
            .where('id')
            .anyOf(queueRef.current)
            .toArray();

        const payload = { events };
        const ok = sendBeacon('/api/log', payload);
        if (ok) {
            await eventDB.events
                .where('id')
                .anyOf(queueRef.current)
                .delete();
            queueRef.current = [];
        }
    }, []);

    const track = useCallback(async (
        type: string,
        data: Record<string, unknown>
    ) => {
        const id = await eventDB.events.add({
            type,
            data,
            createdAt: Date.now(),
        });

        queueRef.current.push(id);

        if (queueRef.current.length >= FLUSH_LIMIT) {
            flush();
        }
    }, []);

    useEffect(() => {
        const onHidden = () => {
            if (document.visibilityState === 'hidden') flush();
        };

        window.addEventListener('visibilitychange', onHidden);
        window.addEventListener('beforeunload', flush);

        return () => {
            window.removeEventListener('visibilitychange', onHidden);
            window.removeEventListener('beforeunload', flush);
        };
    }, [flush]);

    return { track, flush };
}