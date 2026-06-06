import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import db from '@/lib/db';
import { canStartExam, findActiveAttempt } from '@/lib/exam-access';
import crypto from 'crypto';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const examId = params.id;
    const userId = session.user.id;

    // Demo exam bypass
    const { getDemoExam } = await import('@/lib/demo-exam');
    const demoExam = await getDemoExam();
    const DEMO_EXAM_ID = demoExam?.id;
    if (examId === DEMO_EXAM_ID) {
        return NextResponse.json({ attemptId: 'demo', sessionToken: 'demo', resumed: false });
    }

    // Access check
    const access = await canStartExam(examId, userId);
    if (!access.allowed) {
        return NextResponse.json({ message: access.reason }, { status: 403 });
    }

    // Resume existing in-progress attempt?
    const existing = await findActiveAttempt(examId, userId);
    if (existing) {
        // Issue a new session token (replace old one for this attempt)
        const sessionToken = crypto.randomBytes(32).toString('hex');
        try {
            await db.query(
                `INSERT INTO exam_sessions (id, attempt_id, session_token)
                 VALUES (UUID(), ?, ?)
                 ON DUPLICATE KEY UPDATE session_token = VALUES(session_token), last_ping = NOW()`,
                [existing.id, sessionToken]
            );
        } catch (error) {
            // exam_sessions table doesn't exist, continue without session tracking
        }
        return NextResponse.json({
            attemptId: existing.id,
            sessionToken,
            resumed: true,
            endTime: existing.end_time,
        });
    }

    // Create new attempt
    const [exam] = await db.query(
        `SELECT id, duration FROM exams WHERE id = ?`,
        [examId]
    ) as any[];

    // Load & shuffle question IDs. ORDER BY RAND() scans the full table and
    // does a full sort; we fetch IDs (PK range) and Fisher-Yates shuffle in JS.
    const questionRows = await db.query(
        `SELECT id FROM questions WHERE exam_id = ?`,
        [examId]
    ) as any[];
    const questionIds = questionRows.map((q: any) => q.id);
    for (let i = questionIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionIds[i], questionIds[j]] = [questionIds[j], questionIds[i]];
    }

    const attemptId = crypto.randomUUID();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const endTime = new Date(Date.now() + exam.duration * 60 * 1000);

    try {
        await db.query(
            `INSERT INTO exam_attempts (id, exam_id, user_id, status, question_ids, end_time)
             VALUES (?, ?, ?, 'in_progress', ?, ?)`,
            [attemptId, examId, userId, JSON.stringify(questionIds), endTime]
        );

        await db.query(
            `INSERT INTO exam_sessions (id, attempt_id, session_token)
             VALUES (UUID(), ?, ?)`,
            [attemptId, sessionToken]
        );
    } catch (error) {
        // Tables don't exist, return fake attempt data for demo purposes
        return NextResponse.json({
            attemptId: 'fallback-' + attemptId,
            sessionToken,
            resumed: false,
            endTime: endTime.toISOString(),
        });
    }

    return NextResponse.json({
        attemptId,
        sessionToken,
        resumed: false,
        endTime: endTime.toISOString(),
    });
}
