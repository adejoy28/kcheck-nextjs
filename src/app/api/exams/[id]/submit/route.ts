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
        const { answers, timeTaken, autoSubmit } = await req.json()
        
        // Log auto-submissions for debugging
        if (autoSubmit) {
            console.log('[Auto-Submit] Exam submission via sendBeacon:', { examId, userId, answerCount: answers?.length, timeTaken })
        }

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

        // Parallel: exam lookup + already-taken check + retake check
        const [examRows, existingRows, retakeRows] = await Promise.all([
            sql.query('SELECT id, title, passing_score FROM exams WHERE id = ?', [examId]),
            sql.query('SELECT id FROM results WHERE exam_id = ? AND user_id = ?', [examId, userId]),
            sql.query(`SELECT id FROM retake_requests WHERE exam_id = ? AND user_id = ? AND status = 'approved'`, [examId, userId]),
        ]);

        const exam = (examRows as any[])[0];
        if (!exam) {
            return NextResponse.json({ message: 'Exam not found' }, { status: 404 })
        }

        const isDemo = exam.title === 'Demo Test'

        // For demo exams, skip the "already taken" check
        if (!isDemo) {
            if (existingRows.length > 0 && retakeRows.length === 0) {
                return NextResponse.json(
                    { message: 'You have already taken this exam' },
                    { status: 400 }
                )
            }

            // Approved retake: drop prior result so the new INSERT below won't 1062
            if (retakeRows.length > 0) {
                await Promise.all([
                    sql.query('DELETE FROM results WHERE exam_id = ? AND user_id = ?', [examId, userId]),
                    sql.query(`DELETE FROM retake_requests WHERE exam_id = ? AND user_id = ? AND status = 'approved'`, [examId, userId]),
                ]);
            }
        }

        // Server-side time validation (if attempt tracking is enabled)
        let activeAttempt = null;
        try {
            const attempts = await sql.query(
                `SELECT a.id, a.end_time, a.status
                 FROM exam_attempts a
                 WHERE a.exam_id = ? AND a.user_id = ? AND a.status = 'in_progress'
                 ORDER BY a.started_at DESC LIMIT 1`,
                [examId, userId]
            ) as any[];
            activeAttempt = attempts[0];

            if (activeAttempt && new Date(activeAttempt.end_time) < new Date()) {
                // Time expired server-side — mark as timed_out and still grade it
                await sql.query(
                    `UPDATE exam_attempts SET status = 'timed_out' WHERE id = ?`,
                    [activeAttempt.id]
                );
            }
        } catch (error) {
            // exam_attempts table doesn't exist, skip attempt tracking
            console.log('Attempt tracking not available, proceeding without it');
        }

        const questions = await sql.query('SELECT id, correct_answer, weight FROM questions WHERE exam_id = ? ORDER BY id', [examId])

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
            await sql.query(`
                INSERT INTO results (user_id, exam_id, score, total_questions, percentage, passed, time_taken, answers)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [userId, examId, score, total, percentage, passed, timeTaken, JSON.stringify(answers)])

            // Mark attempt as submitted (if table exists). Retake-request cleanup
            // already happened above in the parallel block; no need to repeat.
            try {
                await sql.query(
                    `UPDATE exam_attempts
                     SET status = 'submitted', submitted_at = NOW(), time_taken = ?
                     WHERE exam_id = ? AND user_id = ? AND status IN ('in_progress','timed_out')`,
                    [timeTaken, examId, userId]
                );
            } catch (error) {
                console.log('Could not update exam_attempts (table may not exist)');
            }
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
