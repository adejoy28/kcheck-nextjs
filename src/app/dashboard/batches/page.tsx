import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import { withRetry } from '@/lib/db'
import BatchesClient from './batches-client'

async function getBatches() {
    try {
        return await withRetry(() => sql`
            SELECT b.id, b.name, b.start_date, b.end_date, b.is_active, b.created_at,
                e.title AS exam_title,
                COUNT(DISTINCT bm.user_id) AS member_count,
                COUNT(DISTINCT bt.team_id) AS team_count
            FROM batches b
            JOIN exams e ON b.exam_id = e.id
            LEFT JOIN batch_members bm ON bm.batch_id = b.id
            LEFT JOIN batch_teams bt ON bt.batch_id = b.id
            GROUP BY b.id, e.title
            ORDER BY b.created_at DESC
        `)
    } catch (error) {
        console.error('[getBatches]', error)
        return []
    }
}

export default async function BatchesPage() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') redirect('/dashboard')
    const batches = await getBatches()
    return <BatchesClient batches={batches as any[]} />
}
