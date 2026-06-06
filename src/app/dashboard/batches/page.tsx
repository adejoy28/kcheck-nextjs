import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import BatchesClient from './batches-client'

async function getBatches() {
    try {
        return await sql.query(`
            SELECT
                b.id, b.name, b.start_date, b.end_date, b.is_active, b.created_at,
                e.title AS exam_title,
                (SELECT COUNT(*) FROM batch_members WHERE batch_id = b.id) AS member_count,
                (SELECT COUNT(*) FROM batch_teams   WHERE batch_id = b.id) AS team_count
            FROM batches b
            JOIN exams e ON b.exam_id = e.id
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
