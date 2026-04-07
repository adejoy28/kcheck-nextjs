import { auth } from '@/auth';
import sql from '@/lib/db';
import Link from 'next/link';
import { getDemoExam } from '@/lib/demo-exam';
import TestsClient from './tests-client';

interface Test {
    id: string
    title: string
    duration: number
    batch_name: string
    start_date: string
    end_date: string
    status: string
    is_missed: boolean
}

async function getAvailableTests(userId: string): Promise<Test[]> {
    try {
        const now = new Date().toISOString();
        const rows = await sql.query(`
            SELECT
                e.id,
                e.title,
                e.duration,
                b.id AS batch_id,
                b.name AS batch_name,
                b.start_date,
                b.end_date,
                CASE
                    WHEN b.end_date < ? THEN 'expired'
                    WHEN b.start_date > ? THEN 'upcoming'
                    ELSE 'active'
                END AS status,
                CASE
                    WHEN r.id IS NULL AND b.end_date < ? THEN true
                    ELSE false
                END AS is_missed
            FROM batches b
            JOIN exams e ON b.exam_id = e.id
            LEFT JOIN results r ON r.exam_id = e.id AND r.user_id = ?
            WHERE (
                b.id IN (SELECT batch_id FROM batch_members WHERE user_id = ?)
                OR
                b.id IN (
                    SELECT bt.batch_id FROM batch_teams bt
                    JOIN users u ON u.team_id = bt.team_id
                    WHERE u.id = ?
                )
            )
            AND r.id IS NULL
            ORDER BY b.end_date ASC
        `, [now, now, now, userId, userId, userId]);
        return rows as unknown as Test[];
    } catch (error) {
        console.error('[getAvailableTests]', error);
        return [];
    }
}

export default async function NewTestsPage() {
    const session = await auth();
    
    console.log('[DASHBOARD] Session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        username: session?.user?.username,
        role: session?.user?.role
    });
    
    if (!session?.user?.id) {
        console.log('[DASHBOARD] No session found - should redirect to login');
        return <div>Please login to access this page.</div>
    }
    
    console.log('[DASHBOARD] Session valid, loading tests...');
    const userId = session.user.id;
    const tests = await getAvailableTests(userId);
    const demoExam = await getDemoExam();

    return (
        <div>
            <div className="page-header">New Tests</div>

            <div className="section-hdr">
                <span className="section-title">Available Tests</span>
                {demoExam ? (
                    <Link
                        href={`/dashboard/exams/${demoExam.id}/take`}
                        className="btn btn--outline btn--sm"
                    >
                        Try Demo Test
                    </Link>
                ) : (
                    <button className="btn btn--outline btn--sm" disabled>
                        Demo Test Unavailable
                    </button>
                )}
            </div>

            <div className="toolbar-row">
                <div className="export-btns">
                    <button className="btn btn--outline btn--sm">Export PDF</button>
                    <button className="btn btn--outline btn--sm">Export Excel</button>
                </div>
                <span className="pag-info">
                    {tests.length} {tests.length === 1 ? 'test' : 'tests'}
                </span>
            </div>

            <TestsClient tests={tests as Test[]} />
        </div>
    );
}