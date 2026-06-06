import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { canStartExam } from '@/lib/exam-access';
import db from '@/lib/db';
import TakeExamClient from './take-exam-client';

interface ResumeData {
    attemptId: string;
    endTime: string;
    savedAnswers: Record<string, number>;
}

export default async function TakeExamPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const { getDemoExam } = await import('@/lib/demo-exam');
    const examId = params.id;
    const userId = session.user.id;

    // Demo exam id + access check + exam/questions in parallel
    const [demoExam, accessResult, examRows, questions] = await Promise.all([
        getDemoExam(),
        canStartExam(examId, userId),
        db.query(
            `SELECT id, title, description, duration, passing_score, is_active
             FROM exams WHERE id = ?`,
            [examId]
        ),
        db.query(
            `SELECT id, text, options
             FROM questions WHERE exam_id = ? ORDER BY id ASC`,
            [examId]
        ),
    ]);

    const DEMO_EXAM_ID = demoExam?.id;

    if (examId !== DEMO_EXAM_ID) {
        if (!accessResult.allowed) {
            if (accessResult.reason === 'already_taken') redirect('/dashboard/results');
            if (accessResult.reason === 'not_active') redirect('/dashboard?error=exam_not_active');
            redirect('/dashboard');
        }
    }

    const exam = (examRows as any[])[0];
    if (!exam) redirect('/dashboard');

    // Check for existing in-progress attempt (demo skips)
    let resumeData: ResumeData | undefined = undefined;
    if (examId !== DEMO_EXAM_ID) {
        const [existingAttempt] = await db.query(
            `SELECT a.id, a.end_time, a.status
             FROM exam_attempts a
             WHERE a.exam_id = ? AND a.user_id = ? AND a.status = 'in_progress'
             ORDER BY a.started_at DESC LIMIT 1`,
            [examId, userId]
        ) as any[];

        if (existingAttempt) {
            const savedAnswers = await db.query(
                `SELECT question_id, answer_index
                 FROM attempt_answers
                 WHERE attempt_id = ?`,
                [existingAttempt.id]
            ) as any[];

            const answersMap: Record<string, number> = {};
            savedAnswers.forEach((answer: any) => {
                answersMap[answer.question_id] = answer.answer_index;
            });

            resumeData = {
                attemptId: existingAttempt.id,
                endTime: existingAttempt.end_time,
                savedAnswers: answersMap,
            };
        }
    }

    const formattedQuestions = (questions as any[]).map((q) => ({
        id: q.id,
        text: q.text,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
    }));

    return (
        <TakeExamClient
            exam={{ ...exam, questions: formattedQuestions, isDemo: examId === DEMO_EXAM_ID }}
            userId={userId}
            resumeData={resumeData}
        />
    );
}
