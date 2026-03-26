import { auth } from '@/auth';
import sql from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import TakeExamClient from './take-exam-client'

async function getExam(examId: string, userId: string) {
    try {
        // Check if already taken
        const [existing] = await sql`
            SELECT id FROM results
            WHERE exam_id = ${examId} AND user_id = ${userId}
            LIMIT 1
        `
        if (existing) return { alreadyTaken: true, exam: null }

        // Fetch exam with questions — strip correct answers
        const [exam] = await sql`
            SELECT id, title, description, duration, passing_score
            FROM exams
            WHERE id = ${examId} AND is_active = true
            LIMIT 1
        `
        if (!exam) return { alreadyTaken: false, exam: null }

        const questions = await sql`
            SELECT id, text, options
            FROM questions
            WHERE exam_id = ${examId}
            ORDER BY id
        `

        return { alreadyTaken: false, exam: { ...exam, questions } }
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
