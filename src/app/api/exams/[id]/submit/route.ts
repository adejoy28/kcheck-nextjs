import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
        }

        const userId = session.user.id
        const examId = params.id
        const { answers, timeTaken } = await req.json()

        // Validate required fields
        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json(
                { message: 'Answers array is required' },
                { status: 400 }
            )
        }

        if (typeof timeTaken !== 'number' || timeTaken < 0) {
            return NextResponse.json(
                { message: 'Valid timeTaken is required' },
                { status: 400 }
            )
        }

        // Fetch exam with correct answers and check if it's a demo
        const [exam] = await sql`
            SELECT id, title, passing_score FROM exams WHERE id = ${examId}
        `
        if (!exam) {
            return NextResponse.json({ message: 'Exam not found' }, { status: 404 })
        }

        const isDemo = exam.title === 'Demo Test'
        
        // For demo exams, skip the "already taken" check
        if (!isDemo) {
            // Check already taken
            const [existing] = await sql`
                SELECT id FROM results
                WHERE exam_id = ${examId} AND user_id = ${userId}
            `
            if (existing) {
                return NextResponse.json(
                    { message: 'You have already taken this exam' },
                    { status: 400 }
                )
            }

            // Check retake request
            const [retake] = await sql`
                SELECT id FROM retake_requests
                WHERE exam_id = ${examId} AND user_id = ${userId}
            `
            if (retake) {
                // Delete old result and retake request
                await sql`DELETE FROM results WHERE exam_id = ${examId} AND user_id = ${userId}` 
                await sql`DELETE FROM retake_requests WHERE exam_id = ${examId} AND user_id = ${userId}` 
            }
        }

        const questions = await sql`
            SELECT id, correct_answer, weight FROM questions
            WHERE exam_id = ${examId}
            ORDER BY id
        `

        if (questions.length === 0) {
            return NextResponse.json(
                { message: 'Exam has no questions' },
                { status: 400 }
            )
        }

        if (!Array.isArray(answers) || answers.length !== questions.length) {
            return NextResponse.json(
                { message: `Expected ${questions.length} answers, received ${answers?.length ?? 0}` },
                { status: 400 }
            )
        }

        // Score the exam
        let score = 0
        questions.forEach((q: any, i: number) => {
            if (answers[i] === q.correct_answer) {
                score += q.weight
            }
        })

        const total = questions.length
        const percentage = Math.round((score / total) * 100)
        const passed = percentage >= exam.passing_score

        // Save result only for non-demo exams
        if (!isDemo) {
            await sql`
                INSERT INTO results (user_id, exam_id, score, total_questions, percentage, passed, time_taken, answers)
                VALUES (${userId}, ${examId}, ${score}, ${total}, ${percentage}, ${passed}, ${timeTaken}, ${JSON.stringify(answers)})
            `
        }

        return NextResponse.json({ 
            score, 
            total, 
            percentage, 
            passed, 
            isDemo 
        })
    } catch (error) {
        console.error('[submit exam]', error)
        
        // Handle specific error types
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { message: 'Invalid JSON in request body' },
                { status: 400 }
            )
        }
        
        if (error instanceof Error && error.message.includes('database')) {
            return NextResponse.json(
                { message: 'Database error occurred' },
                { status: 503 }
            )
        }
        
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
