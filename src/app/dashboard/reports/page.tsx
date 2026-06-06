import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import ReportsClient from '@/app/dashboard/reports/reports-client'

async function getFilterOptions() {
    try {
        const [exams, teams, batches] = await Promise.all([
            sql.query('SELECT id, title FROM exams ORDER BY title'),
            sql.query('SELECT id, name FROM teams ORDER BY name'),
            sql.query('SELECT id, name FROM batches ORDER BY name'),
        ])
        return { exams, teams, batches }
    } catch (error) {
        console.error('[getFilterOptions]', error)
        return { exams: [], teams: [], batches: [] }
    }
}

export default async function ReportsPage() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') redirect('/dashboard')
    const { exams, teams, batches } = await getFilterOptions()
    return <ReportsClient exams={exams as any[]} teams={teams as any[]} batches={batches as any[]} />
}
