import { auth } from '@/auth';
import sql from '@/lib/db';
import Link from 'next/link';

async function getAvailableTests(userId: string) {
    try {
        const now = new Date().toISOString();
        const rows = await sql`
            SELECT
                e.id,
                e.title,
                e.duration,
                b.id AS batch_id,
                b.name AS batch_name,
                b.start_date,
                b.end_date,
                CASE
                    WHEN b.end_date < ${now} THEN 'expired'
                    WHEN b.start_date > ${now} THEN 'upcoming'
                    ELSE 'active'
                END AS status,
                CASE
                    WHEN r.id IS NULL AND b.end_date < ${now} THEN true
                    ELSE false
                END AS is_missed
            FROM batches b
            JOIN exams e ON b.exam_id = e.id
            LEFT JOIN results r ON r.exam_id = e.id AND r.user_id = ${userId}
            WHERE (
                b.id IN (SELECT batch_id FROM batch_members WHERE user_id = ${userId})
                OR
                b.id IN (
                    SELECT bt.batch_id FROM batch_teams bt
                    JOIN users u ON u.team_id = bt.team_id
                    WHERE u.id = ${userId}
                )
            )
            ORDER BY b.end_date ASC
        `;
        return rows;
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

    return (
        <div>
            <div className="page-header">New Tests</div>

            <div className="section-hdr">
                <span className="section-title">Available Tests</span>
                <button className="btn btn--outline btn--sm">Try Demo Test</button>
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

            <div className="table__wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="table__header">Test</th>
                            <th className="table__header">Batch</th>
                            <th className="table__header">Duration</th>
                            <th className="table__header">Scheduled Date</th>
                            <th className="table__header">End Date</th>
                            <th className="table__header">Status</th>
                            <th className="table__header">Is Missed</th>
                            <th className="table__header"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tests.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="table__empty">
                                    No tests assigned to you at the moment.
                                </td>
                            </tr>
                        ) : tests.map((test: any) => (
                            <tr key={test.batch_id} className="table__row">
                                <td className="table__cell table__cell--bold">{test.title}</td>
                                <td className="table__cell table__cell--muted">{test.batch_name}</td>
                                <td className="table__cell">{test.duration} mins</td>
                                <td className="table__cell">
                                    {new Date(test.start_date).toLocaleDateString('en-GB')}
                                </td>
                                <td className="table__cell">
                                    {new Date(test.end_date).toLocaleDateString('en-GB')}
                                </td>
                                <td className="table__cell">
                                    <span className={`badge badge--${test.status}`}>
                                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                                    </span>
                                </td>
                                <td className="table__cell">
                                    <span className={`badge badge--${test.is_missed ? 'missed' : 'ok'}`}>
                                        {test.is_missed ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="table__cell">
                                    {test.status === 'active' ? (
                                        <Link
                                            href={`/dashboard/exams/${test.id}/take`}
                                            className="btn btn--primary btn--sm"
                                        >
                                            Take Test
                                        </Link>
                                    ) : test.status === 'upcoming' ? (
                                        <span className="table__cell--muted" style={{ fontSize: '11px' }}>
                                            Not yet open
                                        </span>
                                    ) : (
                                        <span style={{ color: '#ccc', fontSize: '11px' }}>—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}