import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import sql from '@/lib/db'
import { withRetry } from '@/lib/db'
import BatchForm from '../batch-form'

async function getBatchData(id: string) {
    try {
        const [batch] = await withRetry(() => sql`SELECT * FROM batches WHERE id = ${id}`)
        if (!batch) return null
        const [members, teams, allExams, allTeams, allUsers] = await Promise.all([
            sql`SELECT user_id AS id FROM batch_members WHERE batch_id = ${id}`,
            sql`SELECT team_id AS id FROM batch_teams WHERE batch_id = ${id}`,
            sql`SELECT id, title FROM exams WHERE is_active = true ORDER BY title`,
            sql`SELECT id, name, unit FROM teams ORDER BY name`,
            sql`SELECT id, name, username, unit FROM users WHERE role = 'STAFF' AND is_active = true ORDER BY name`,
        ])
        return {
            batch: { ...batch, members, teams },
            exams: allExams, teams: allTeams, users: allUsers
        }
    } catch (error) {
        console.error('[getBatchData]', error)
        return null
    }
}

export default async function EditBatchPage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') redirect('/dashboard')
    const data = await getBatchData(params.id)
    if (!data) notFound()
    return (
        <div>
            <div className="page-header">Edit Batch</div>
            <BatchForm exams={data.exams as any[]} teams={data.teams as any[]} users={data.users as any[]} batch={data.batch} />
        </div>
    )
}
