import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import { withRetry } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import ExamsClient from '@/app/dashboard/exams/exams-client'

async function getExams() {
    try {
        return await withRetry(() => sql`
            SELECT e.id, e.title, e.description, e.duration, e.passing_score,
                e.is_active, e.retake_allowed, e.created_at,
                c.name AS category_name, u.name AS created_by_name,
                COUNT(DISTINCT q.id) AS question_count,
                COUNT(DISTINCT r.id) AS result_count
            FROM exams e
            LEFT JOIN categories c ON e.category_id = c.id
            LEFT JOIN users u ON e.created_by_id = u.id
            LEFT JOIN questions q ON q.exam_id = e.id
            LEFT JOIN results r ON r.exam_id = e.id
            GROUP BY e.id, c.name, u.name
            ORDER BY e.created_at DESC
        `)
    } catch (error) {
        console.error('[getExams]', error)
        return []
    }
}

export default async function ExamsPage() {
    await requireAdmin()
    const exams = await getExams()
    return <ExamsClient exams={exams as any[]} />
}
