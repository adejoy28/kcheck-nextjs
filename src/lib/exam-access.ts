import db from '@/lib/db';

export type AccessResult =
    | { allowed: true; reason?: never }
    | { allowed: false; reason: 'not_active' | 'already_taken' | 'not_found' | 'retake_pending' | 'unauthorized' };

/**
 * Server-side check: can this user start (or resume) this exam?
 * Call from the exam take page server component and from the start endpoint.
 * Single round-trip: fetches exam, result, and (conditionally) retake in one query.
 */
export async function canStartExam(examId: string, userId: string): Promise<AccessResult> {
    const rows = await db.query(
        `SELECT
            e.id            AS exam_id,
            e.is_active     AS is_active,
            r.id            AS result_id,
            rr.id           AS retake_id
         FROM exams e
         LEFT JOIN results         r  ON r.exam_id  = e.id AND r.user_id  = ?
         LEFT JOIN retake_requests rr ON rr.exam_id = e.id AND rr.user_id = ? AND rr.status = 'approved'
         WHERE e.id = ?
         LIMIT 1`,
        [userId, userId, examId]
    ) as any[];

    if (!rows || rows.length === 0) return { allowed: false, reason: 'not_found' };
    const row = rows[0];
    if (!row.is_active) return { allowed: false, reason: 'not_active' };
    if (row.result_id && !row.retake_id) return { allowed: false, reason: 'already_taken' };

    return { allowed: true };
}

/**
 * Find an in-progress attempt for this user+exam, if any.
 */
export async function findActiveAttempt(examId: string, userId: string) {
    try {
        const [attempt] = await db.query(
            `SELECT id, end_time, session_token, started_at
             FROM exam_attempts a
             LEFT JOIN exam_sessions s ON s.attempt_id = a.id
             WHERE a.exam_id = ? AND a.user_id = ? AND a.status = 'in_progress'
             ORDER BY a.started_at DESC LIMIT 1`,
            [examId, userId]
        ) as any[];
        return attempt || null;
    } catch (error) {
        // exam_attempts table doesn't exist
        return null;
    }
}
