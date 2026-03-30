import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import { withRetry } from '@/lib/db'
import ExamForm from '@/app/dashboard/exams/exam-form'

async function getCategories() {
    try {
        return await withRetry(() => sql`SELECT id, name FROM categories ORDER BY name`)
    } catch { return [] }
}

export default async function CreateExamPage() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') redirect('/dashboard')
    const categories = await getCategories()
    return (
        <div>
            <div className="page-header">Create New Exam</div>
            <ExamForm categories={categories as any[]} />
        </div>
    )
}
