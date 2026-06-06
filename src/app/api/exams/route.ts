import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

async function requireAdmin() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') return null
    return session
}

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })

        const exams = await sql.query(`
            SELECT
                e.id, e.title, e.description, e.duration, e.passing_score,
                e.is_active, e.retake_allowed, e.created_at,
                c.name AS category_name,
                u.name AS created_by_name,
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
        return NextResponse.json(exams)
    } catch (error) {
        console.error('[GET /api/exams]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        const { title, description, duration, passing_score, category_id, retake_allowed, questions } = await req.json()

        if (!title?.trim()) return NextResponse.json({ message: 'Title is required' }, { status: 400 })
        if (!duration || duration < 1) return NextResponse.json({ message: 'Valid duration is required' }, { status: 400 })
        if (!questions || questions.length < 1) return NextResponse.json({ message: 'At least one question is required' }, { status: 400 })

        const result = await sql.query(`
            INSERT INTO exams (title, description, duration, passing_score, category_id, retake_allowed, created_by_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            title.trim(),
            description?.trim() || null,
            duration,
            passing_score || 50,
            category_id || null,
            retake_allowed || false,
            session.user.id
        ]) as any
        const exam = { id: result.insertId }

        if (questions.length > 0) {
            const placeholders = questions.map(() => '(?, ?, ?, ?, ?)').join(', ')
            const values: any[] = []
            for (const q of questions) {
                values.push(q.text, JSON.stringify(q.options), q.correct_answer, q.weight || 1, exam.id)
            }
            await sql.query(
                `INSERT INTO questions (text, options, correct_answer, weight, exam_id) VALUES ${placeholders}`,
                values
            )
        }

        return NextResponse.json({ message: 'Exam created', id: exam.id }, { status: 201 })
    } catch (error) {
        console.error('[POST /api/exams]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
