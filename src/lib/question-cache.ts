// Simple in-memory LRU cache for exam questions (server-side).
// Bounded to MAX_ENTRIES to prevent unbounded growth on long-lived processes.

const MAX_ENTRIES = 200;
const TTL = 5 * 60 * 1000; // 5 minutes

const cache = new Map<string, { data: any; ts: number }>();

function evictIfExpired(examId: string) {
    const entry = cache.get(examId);
    if (!entry) return null;
    if (Date.now() - entry.ts > TTL) {
        cache.delete(examId);
        return null;
    }
    // Touch for LRU ordering
    cache.delete(examId);
    cache.set(examId, entry);
    return entry;
}

export function getCachedQuestions(examId: string) {
    const entry = evictIfExpired(examId);
    return entry ? entry.data : null;
}

export function setCachedQuestions(examId: string, data: any) {
    cache.set(examId, { data, ts: Date.now() });
    if (cache.size > MAX_ENTRIES) {
        // Map iteration is insertion order; delete the oldest key.
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) cache.delete(oldest);
    }
}

export function invalidateExamCache(examId: string) {
    cache.delete(examId);
}
