import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import { withRetry } from '@/lib/db'
import BatchForm from '@/app/dashboard/batches/batch-form'

async function getFormData() {
    try {
        const [exams, teams, users] = await Promise.all([
            withRetry(() => sql.query('SELECT id, title FROM exams WHERE is_active = true ORDER BY title')),
            withRetry(() => sql.query('SELECT id, name, unit FROM teams ORDER BY name')),
            withRetry(() => sql.query('SELECT id, name, username, unit FROM users WHERE role = \'STAFF\' AND is_active = true ORDER BY name')),
        ])
        return { exams, teams, users }
    } catch (error) {
        console.error('[getFormData]', error)
        return { exams: [], teams: [], users: [] }
    }
}

export default async function CreateBatchPage() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') redirect('/dashboard')
    const { exams, teams, users } = await getFormData()
    return (
        <div>
            <div className="page-header">Create Batch</div>
            <BatchForm exams={exams as any[]} teams={teams as any[]} users={users as any[]} />
        </div>
    )
}
