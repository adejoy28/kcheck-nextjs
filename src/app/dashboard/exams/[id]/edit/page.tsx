import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import sql from '@/lib/db'
import { withRetry } from '@/lib/db'
import ExamForm from '@/app/dashboard/exams/exam-form'

async function getExam(id: string) {
    try {
        const [exam] = await withRetry(() => sql`
            SELECT e.*, c.name AS category_name
            FROM exams e
            LEFT JOIN categories c ON e.category_id = c.id
            WHERE e.id = ${id}
        `)
        if (!exam) return null
        const questions = await sql`
            SELECT id, text, options, correct_answer, weight
            FROM questions WHERE exam_id = ${id} ORDER BY id
        `
        return { ...exam, questions }
    } catch (error) {
        console.error('[getExam]', error)
        return null
    }
}

async function getCategories() {
    try {
        return await withRetry(() => sql`SELECT id, name FROM categories ORDER BY name`)
    } catch { return [] }
}

export default async function EditExamPage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') redirect('/dashboard')
    
    const [exam, categories] = await Promise.all([
        getExam(params.id),
        getCategories()
    ])
    
    if (!exam) notFound()
    
    return (
        <div>
            <div className="page-header">Edit Exam — {(exam as any).title}</div>
            <ExamForm categories={categories as any[]} exam={exam} />
        </div>
    )
}
