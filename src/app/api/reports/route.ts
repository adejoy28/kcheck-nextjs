import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const examId = searchParams.get('exam_id')
        const teamId = searchParams.get('team_id')
        const batchId = searchParams.get('batch_id')
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const view = searchParams.get('view') || 'staff'

        if (view === 'exam') {
            const rows = await sql.query(`
                SELECT
                    e.id AS exam_id,
                    e.title AS exam_title,
                    e.passing_score,
                    COUNT(DISTINCT r.id) AS total_attempts,
                    SUM(CASE WHEN r.passed THEN 1 ELSE 0 END) AS total_passed,
                    ROUND(AVG(r.percentage), 2) AS avg_percentage,
                    ROUND((SUM(CASE WHEN r.passed THEN 1 ELSE 0 END) / NULLIF(COUNT(r.id), 0)) * 100, 2) AS pass_rate
                FROM exams e
                LEFT JOIN results r ON r.exam_id = e.id
                WHERE (? IS NULL OR e.id = ?)
                AND (? IS NULL OR r.completed_at >= ?)
                AND (? IS NULL OR r.completed_at <= ?)
                GROUP BY e.id, e.title, e.passing_score
                ORDER BY e.title
            `, [examId, examId, from, from, to, to])
            return NextResponse.json(rows)
        }

        // By staff view
        const rows = await sql.query(`
            SELECT
                r.id, r.score, r.total_questions, r.percentage, r.passed,
                r.time_taken, r.completed_at,
                u.id AS user_id, u.name AS user_name, u.username,
                t.name AS team_name,
                e.id AS exam_id, e.title AS exam_title, e.passing_score,
                b.name AS batch_name
            FROM results r
            JOIN users u ON r.user_id = u.id
            JOIN exams e ON r.exam_id = e.id
            LEFT JOIN teams t ON u.team_id = t.id
            LEFT JOIN batches b ON b.exam_id = e.id
            WHERE (? IS NULL OR e.id = ?)
            AND (? IS NULL OR t.id = ?)
            AND (? IS NULL OR b.id = ?)
            AND (? IS NULL OR r.completed_at >= ?)
            AND (? IS NULL OR r.completed_at <= ?)
            ORDER BY r.completed_at DESC
        `, [examId, examId, teamId, teamId, batchId, batchId, from, from, to, to])
        return NextResponse.json(rows)
    } catch (error) {
        console.error('[GET /api/reports]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
