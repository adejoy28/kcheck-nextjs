import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'
import { getCachedQuestions, setCachedQuestions, invalidateExamCache } from '@/lib/question-cache'

async function requireAdmin() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') return null
    return session
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })

        const [exam] = await sql.query(`
            SELECT e.*, c.name AS category_name
            FROM exams e
            LEFT JOIN categories c ON e.category_id = c.id
            WHERE e.id = ?
        `, [params.id])
        if (!exam) return NextResponse.json({ message: 'Not found' }, { status: 404 })

        let questions = getCachedQuestions(params.id);
        if (!questions) {
            questions = await sql.query(`
                SELECT id, text, options, correct_answer, weight
                FROM questions WHERE exam_id = ? ORDER BY id
            `, [params.id]);
            // Ensure options are parsed as arrays
            questions = questions.map((q: any) => ({
                ...q,
                options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
            }));
            setCachedQuestions(params.id, questions);
        }

        // If there's an in-progress attempt, use its question order
        const [attempt] = await sql.query(
            `SELECT id, question_ids, end_time
             FROM exam_attempts
             WHERE exam_id = ? AND user_id = ? AND status = 'in_progress'
             ORDER BY started_at DESC LIMIT 1`,
            [params.id, session.user.id]
        ) as any[];

        let resumeData = null;

        if (attempt && attempt.question_ids) {
            const orderedQuestionIds = JSON.parse(attempt.question_ids);
            
            // Load saved answers for resume
            const savedAnswers = await sql.query(
                `SELECT question_id, answer_index FROM attempt_answers WHERE attempt_id = ?`,
                [attempt.id]
            ) as any[];

            resumeData = {
                attemptId: attempt.id,
                endTime: attempt.end_time,
                savedAnswers: savedAnswers.reduce((acc: Record<string, number>, row: any) => {
                    acc[row.question_id] = row.answer_index;
                    return acc;
                }, {}),
            };

            // Sort questions by attempt order
            const questionMap = new Map(questions.map((q: any) => [q.id, q]));
            questions = orderedQuestionIds.map((id: string) => questionMap.get(id)).filter(Boolean);
        }

        return NextResponse.json({ ...exam, questions, resumeData })
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

        await sql.query(`
            UPDATE exams SET
                title = ?,
                description = ?,
                duration = ?,
                passing_score = ?,
                category_id = ?,
                retake_allowed = ?,
                is_active = ?,
                updated_at = NOW()
            WHERE id = ?
        `, [title, description || null, duration, passing_score || 50, category_id || null, retake_allowed || false, is_active ?? true, params.id])

        if (questions) {
            await sql.query('DELETE FROM questions WHERE exam_id = ?', [params.id])
            if (questions.length > 0) {
                const placeholders = questions.map(() => '(?, ?, ?, ?, ?)').join(', ')
                const values: any[] = []
                for (const q of questions) {
                    values.push(q.text, JSON.stringify(q.options), q.correct_answer, q.weight || 1, params.id)
                }
                await sql.query(
                    `INSERT INTO questions (text, options, correct_answer, weight, exam_id) VALUES ${placeholders}`,
                    values
                )
            }
        }

        // Invalidate cache when exam is updated
        invalidateExamCache(params.id);

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

        await sql.query('DELETE FROM attempt_answers WHERE attempt_id IN (SELECT id FROM exam_attempts WHERE exam_id = ?)', [params.id])
        await sql.query('DELETE FROM exam_sessions WHERE attempt_id IN (SELECT id FROM exam_attempts WHERE exam_id = ?)', [params.id])
        await sql.query('DELETE FROM exam_attempts WHERE exam_id = ?', [params.id])
        await sql.query('DELETE FROM exam_progress WHERE exam_id = ?', [params.id])
        await sql.query('DELETE FROM retake_requests WHERE exam_id = ?', [params.id])
        await sql.query('DELETE FROM batch_members WHERE batch_id IN (SELECT id FROM batches WHERE exam_id = ?)', [params.id])
        await sql.query('DELETE FROM batch_teams WHERE batch_id IN (SELECT id FROM batches WHERE exam_id = ?)', [params.id])
        await sql.query('DELETE FROM batches WHERE exam_id = ?', [params.id])
        await sql.query('DELETE FROM results WHERE exam_id = ?', [params.id])
        await sql.query('DELETE FROM questions WHERE exam_id = ?', [params.id])
        await sql.query('DELETE FROM exams WHERE id = ?', [params.id])

        return NextResponse.json({ message: 'Exam deleted' })
    } catch (error) {
        console.error('[DELETE /api/exams/:id]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
