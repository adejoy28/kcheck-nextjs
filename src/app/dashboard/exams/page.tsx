import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import ExamsClient from '@/app/dashboard/exams/exams-client'

async function getExams() {
    try {
        return await sql.query(`
            SELECT
                e.id, e.title, e.description, e.duration, e.passing_score,
                e.is_active, e.retake_allowed, e.created_at,
                c.name AS category_name,
                u.name AS created_by_name,
                (SELECT COUNT(*) FROM questions WHERE exam_id = e.id) AS question_count,
                (SELECT COUNT(*) FROM results   WHERE exam_id = e.id) AS result_count
            FROM exams e
            LEFT JOIN categories c ON e.category_id = c.id
            LEFT JOIN users u ON e.created_by_id = u.id
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
