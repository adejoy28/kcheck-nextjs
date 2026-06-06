import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import db from '@/lib/db';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string; attemptId: string } }
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });

    const sessionToken = req.headers.get('x-exam-session');
    if (!sessionToken) return NextResponse.json({ ok: false }, { status: 400 });

    try {
        const [row] = await db.query(
            `SELECT s.id FROM exam_sessions s
             INNER JOIN exam_attempts a ON a.id = s.attempt_id
             WHERE s.attempt_id = ? AND s.session_token = ? AND a.user_id = ?`,
            [params.attemptId, sessionToken, session.user.id]
        ) as any[];

        if (!row) return NextResponse.json({ valid: false }, { status: 403 });

        await db.query(
            `UPDATE exam_sessions SET last_ping = NOW() WHERE attempt_id = ?`,
            [params.attemptId]
        );
    } catch (error) {
        // Tables don't exist, allow ping for demo/fallback attempts
        if (params.attemptId.startsWith('fallback-') || params.attemptId === 'demo') {
            return NextResponse.json({ valid: true });
        }
        return NextResponse.json({ valid: false }, { status: 403 });
    }

    return NextResponse.json({ valid: true });
}
