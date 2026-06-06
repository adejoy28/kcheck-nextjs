import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import CategoriesClient from './categories-client'

async function getCategories() {
    try {
        return await sql.query(`
            SELECT id, name, created_at,
                (SELECT COUNT(*) FROM exams WHERE category_id = categories.id) AS exam_count
            FROM categories ORDER BY name
        `)
    } catch (error) {
        console.error('[getCategories]', error)
        return []
    }
}

export default async function CategoriesPage() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') redirect('/dashboard')
    const categories = await getCategories()
    return <CategoriesClient categories={categories as any[]} />
}
