import { auth } from '@/auth';
import sql from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import TakeExamClient from './take-exam-client'

async function getExam(examId: string, userId: string) {
    try {
        // Fetch exam details first to check if it's a demo
        const [examDetails] = await sql.query(`
            SELECT id, title, description, duration, passing_score
            FROM exams
            WHERE id = ? AND is_active = true
            LIMIT 1
        `, [examId])
        
        if (!examDetails) return { alreadyTaken: false, exam: null }
        
        // Only check if already taken for non-demo exams
        const isDemo = examDetails.title === 'Demo Test'
        if (!isDemo) {
            // Check if already taken
            const [existing] = await sql.query('SELECT id FROM results WHERE exam_id = ? AND user_id = ? LIMIT 1', [examId, userId])
            if (existing) return { alreadyTaken: true, exam: null }
        }

        // Fetch exam with questions — strip correct answers
        const questions = await sql.query('SELECT id, text, options FROM questions WHERE exam_id = ? ORDER BY id', [examId])

        return { alreadyTaken: false, exam: { ...examDetails, questions, isDemo } } as any
    } catch (error) {
        console.error('[getExam]', error)
        return { alreadyTaken: false, exam: null }
    }
}

export default async function TakeExamPage({
    params,
}: {
    params: { id: string }
}) {
    const session = await auth()
    const userId = session?.user?.id!

    const { alreadyTaken, exam } = await getExam(params.id, userId)

    if (alreadyTaken) {
        redirect('/dashboard/results')
    }

    if (!exam) {
        notFound()
    }

    return <TakeExamClient exam={exam} userId={userId} />
}
