import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import { withRetry } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import Link from 'next/link'

async function getAdminStats() {
    try {
        const [stats] = await withRetry(() => sql`
            SELECT
                (SELECT COUNT(*) FROM exams) AS total_exams,
                (SELECT COUNT(*) FROM exams WHERE is_active = true) AS active_exams,
                (SELECT COUNT(*) FROM users WHERE role = 'STAFF') AS total_staff,
                (SELECT COUNT(*) FROM users WHERE role = 'ADMIN') AS total_admins,
                (SELECT COUNT(*) FROM results) AS total_results,
                (SELECT COUNT(*) FROM results WHERE passed = true) AS total_passed,
                (SELECT COUNT(*) FROM batches WHERE is_active = true AND end_date > NOW()) AS active_batches
        `)
        return stats
    } catch (error) {
        console.error('[getAdminStats]', error)
        return null
    }
}

async function getRecentResults() {
    try {
        return await withRetry(() => sql`
            SELECT
                r.id, r.percentage, r.passed, r.completed_at,
                u.name AS user_name,
                e.title AS exam_title
            FROM results r
            JOIN users u ON r.user_id = u.id
            JOIN exams e ON r.exam_id = e.id
            ORDER BY r.completed_at DESC
            LIMIT 10
        `)
    } catch (error) {
        console.error('[getRecentResults]', error)
        return []
    }
}

export default async function AdminDashboardPage() {
    const session = await requireAdmin()

    const [stats, recentResults] = await Promise.all([getAdminStats(), getRecentResults()])

    const passRate = stats && Number(stats.total_results) > 0
        ? Math.round((Number(stats.total_passed) / Number(stats.total_results)) * 100)
        : 0

    return (
        <div>
            <div className="page-header">Admin Dashboard</div>

            {/* Stat cards */}
            <div className="stat-summary stat-summary--wide">
                <div className="stat-card">
                    <div className="stat-card__number">{stats?.total_exams || 0}</div>
                    <div className="stat-card__label">Total Exams</div>
                    <div className="stat-card__bar"><div className="stat-card__bar-fill" style={{ width: '100%' }} /></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__number stat-card__number--success">{stats?.active_exams || 0}</div>
                    <div className="stat-card__label">Active Exams</div>
                    <div className="stat-card__bar">
                        <div className="stat-card__bar-fill stat-card__bar-fill--success"
                            style={{ width: stats && stats.total_exams > 0 ? `${(stats.active_exams / stats.total_exams) * 100}%` : '0%' }} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__number">{stats?.total_staff || 0}</div>
                    <div className="stat-card__label">Total Staff</div>
                    <div className="stat-card__bar"><div className="stat-card__bar-fill" style={{ width: '100%' }} /></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__number">{stats?.total_results || 0}</div>
                    <div className="stat-card__label">Total Results</div>
                    <div className="stat-card__bar"><div className="stat-card__bar-fill" style={{ width: '100%' }} /></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__number stat-card__number--success">{passRate}%</div>
                    <div className="stat-card__label">Overall Pass Rate</div>
                    <div className="stat-card__bar">
                        <div className="stat-card__bar-fill stat-card__bar-fill--success" style={{ width: `${passRate}%` }} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__number">{stats?.active_batches || 0}</div>
                    <div className="stat-card__label">Active Batches</div>
                    <div className="stat-card__bar"><div className="stat-card__bar-fill" style={{ width: '100%' }} /></div>
                </div>
            </div>

            {/* Quick links */}
            <div className="admin-quick-links">
                <Link href="/dashboard/exams/create" className="admin-quick-link">
                    <span className="admin-quick-link__icon">+</span>
                    <span>Create Exam</span>
                </Link>
                <Link href="/dashboard/users/create" className="admin-quick-link">
                    <span className="admin-quick-link__icon">+</span>
                    <span>Add User</span>
                </Link>
                <Link href="/dashboard/batches/create" className="admin-quick-link">
                    <span className="admin-quick-link__icon">+</span>
                    <span>Create Batch</span>
                </Link>
                <Link href="/dashboard/reports" className="admin-quick-link">
                    <span className="admin-quick-link__icon">→</span>
                    <span>View Reports</span>
                </Link>
            </div>

            {/* Recent results */}
            <div className="section-hdr" style={{ marginTop: '24px' }}>
                <span className="section-title">Recent Results</span>
                <Link href="/dashboard/reports" className="toggle-link">View all →</Link>
            </div>
            <div className="table__wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="table__header">Staff</th>
                            <th className="table__header">Exam</th>
                            <th className="table__header">Score</th>
                            <th className="table__header">Result</th>
                            <th className="table__header">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentResults.length === 0 ? (
                            <tr><td colSpan={5} className="table__empty">No results yet.</td></tr>
                        ) : recentResults.map((r: any) => (
                            <tr key={r.id} className="table__row">
                                <td className="table__cell table__cell--bold">{r.user_name}</td>
                                <td className="table__cell">{r.exam_title}</td>
                                <td className="table__cell">{Number(r.percentage).toFixed(1)}%</td>
                                <td className="table__cell">
                                    <span className={`badge badge--${r.passed ? 'pass' : 'fail'}`}>
                                        {r.passed ? 'Passed' : 'Failed'}
                                    </span>
                                </td>
                                <td className="table__cell table__cell--muted">
                                    {new Date(r.completed_at).toLocaleDateString('en-GB')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
