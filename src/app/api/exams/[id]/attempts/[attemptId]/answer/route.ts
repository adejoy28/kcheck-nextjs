import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import db from '@/lib/db';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string; attemptId: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { attemptId } = params;

    // Validate session token from header
    const sessionToken = req.headers.get('x-exam-session');
    if (!sessionToken) {
        return NextResponse.json({ message: 'Missing session token' }, { status: 400 });
    }

    // Verify this attempt belongs to this user and the session token matches
    let attempt = null;
    try {
        const attempts = await db.query(
            `SELECT a.id, a.status, a.end_time
             FROM exam_attempts a
             INNER JOIN exam_sessions s ON s.attempt_id = a.id
             WHERE a.id = ? AND a.user_id = ? AND s.session_token = ?`,
            [attemptId, session.user.id, sessionToken]
        ) as any[];
        attempt = attempts[0];
    } catch (error) {
        // Tables don't exist, allow answer saving without tracking
    }

    if (!attempt) {
        // For demo/fallback mode, allow saving without strict validation
        if (attemptId.startsWith('fallback-') || attemptId === 'demo') {
            // Skip validation for demo/fallback attempts
        } else {
            return NextResponse.json({ message: 'Invalid attempt or session' }, { status: 403 });
        }
    } else {
        if (attempt.status !== 'in_progress') {
            return NextResponse.json({ message: 'Attempt already submitted' }, { status: 409 });
        }
        if (new Date(attempt.end_time) < new Date()) {
            return NextResponse.json({ message: 'Exam time has expired' }, { status: 410 });
        }
    }

    const { questionId, answerIndex } = await req.json();

    try {
        await db.query(
            `INSERT INTO attempt_answers (id, attempt_id, question_id, answer_index)
             VALUES (UUID(), ?, ?, ?)
             ON DUPLICATE KEY UPDATE answer_index = VALUES(answer_index), saved_at = NOW()`,
            [attemptId, questionId, answerIndex]
        );
    } catch (error) {
        // attempt_answers table doesn't exist, just ignore the save
        console.log('Answer saving not available (attempt_answers table missing)');
    }

    return NextResponse.json({ ok: true });
}
