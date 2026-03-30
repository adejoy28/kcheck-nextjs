import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

async function requireAdmin() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') return null
    return session
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })

        const [exam] = await sql`
            SELECT e.*, c.name AS category_name
            FROM exams e
            LEFT JOIN categories c ON e.category_id = c.id
            WHERE e.id = ${params.id}
        `
        if (!exam) return NextResponse.json({ message: 'Not found' }, { status: 404 })

        const questions = await sql`
            SELECT id, text, options, correct_answer, weight
            FROM questions WHERE exam_id = ${params.id} ORDER BY id
        `
        return NextResponse.json({ ...exam, questions })
    } catch (error) {
        console.error('[GET /api/exams/:id]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        const { title, description, duration, passing_score, category_id, retake_allowed, is_active, questions } = await req.json()

        await sql`
            UPDATE exams SET
                title = ${title},
                description = ${description || null},
                duration = ${duration},
                passing_score = ${passing_score || 50},
                category_id = ${category_id || null},
                retake_allowed = ${retake_allowed || false},
                is_active = ${is_active ?? true},
                updated_at = NOW()
            WHERE id = ${params.id}
        `

        if (questions) {
            await sql`DELETE FROM questions WHERE exam_id = ${params.id}` 
            for (const q of questions) {
                await sql`
                    INSERT INTO questions (text, options, correct_answer, weight, exam_id)
                    VALUES (${q.text}, ${q.options}, ${q.correct_answer}, ${q.weight || 1}, ${params.id})
                `
            }
        }

        return NextResponse.json({ message: 'Exam updated' })
    } catch (error) {
        console.error('[PUT /api/exams/:id]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        await sql`DELETE FROM results WHERE exam_id = ${params.id}` 
        await sql`DELETE FROM exams WHERE id = ${params.id}` 

        return NextResponse.json({ message: 'Exam deleted' })
    } catch (error) {
        console.error('[DELETE /api/exams/:id]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
