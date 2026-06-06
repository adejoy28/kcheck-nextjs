import { cache } from 'react'
import sql from '@/lib/db'

// Per-request memoized: the demo exam doesn't change mid-request. Avoids the
// repeated DB round-trip on every dashboard render.
export const getDemoExam = cache(async () => {
    try {
        const examRows = await sql.query(`
            SELECT id, title, description, duration, passing_score
            FROM exams
            WHERE title = 'Demo Test' AND is_active = true
            LIMIT 1
        `)
        const exam = (examRows as any[])[0]
        if (!exam) return null

        const questions = await sql.query(
            'SELECT id, text, options FROM questions WHERE exam_id = ? ORDER BY id',
            [exam.id]
        )

        return {
            id: exam.id,
            title: exam.title,
            description: exam.description,
            duration: exam.duration,
            passing_score: exam.passing_score,
            questions,
        }
    } catch (error) {
        console.error('[getDemoExam]', error)
        return null
    }
})
