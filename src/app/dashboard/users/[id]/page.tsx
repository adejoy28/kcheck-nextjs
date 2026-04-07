import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import sql from '@/lib/db'
import { withRetry } from '@/lib/db'
import UserForm from '../user-form'
import UserResults from '@/app/dashboard/users/[id]/user-results'

async function getUserWithResults(id: string) {
    try {
        const [user] = await withRetry(() => sql.query(`
            SELECT u.*, t.name AS team_name
            FROM users u LEFT JOIN teams t ON u.team_id = t.id WHERE u.id = ?
        `, [id]))
        if (!user) return null
        const results = await sql.query(`
            SELECT r.id, r.score, r.total_questions, r.percentage, r.passed,
                r.time_taken, r.completed_at, e.id AS exam_id, e.title AS exam_title
            FROM results r JOIN exams e ON r.exam_id = e.id
            WHERE r.user_id = ? ORDER BY r.completed_at DESC
        `, [id])
        const teams = await sql.query('SELECT id, name, unit FROM teams ORDER BY name') 
        return { user, results, teams }
    } catch (error) {
        console.error('[getUserWithResults]', error)
        return null
    }
}

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') redirect('/dashboard')
    const data = await getUserWithResults(params.id)
    if (!data) notFound()

    return (
        <div>
            <div className="page-header">Edit User — {(data.user as any).name}</div>
            <UserForm teams={data.teams as any[]} user={data.user} />
            <div style={{ marginTop: '32px' }}>
                <div className="section-hdr">
                    <span className="section-title">Test Results</span>
                </div>
                <UserResults results={data.results as any[]} userId={params.id} />
            </div>
        </div>
    )
}
