import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { withRetry } from '@/lib/db'
import { apiRequireAdmin } from '@/lib/auth-utils'

async function requireAdmin() {
    const session = await apiRequireAdmin()
    if (!session) return null
    return session
}

export async function GET() {
    try {
        const session = await apiRequireAdmin()
        if (!session) {
            return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
        }
        const categories = await sql.query(`
            SELECT id, name, created_at,
                (SELECT COUNT(*) FROM exams WHERE category_id = categories.id) AS exam_count
            FROM categories
            ORDER BY name ASC
        `)
        return NextResponse.json(categories)
    } catch (error) {
        console.error('[GET /api/categories]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        const { name } = await req.json()
        if (!name?.trim()) {
            return NextResponse.json({ message: 'Category name is required' }, { status: 400 })
        }

        const result = await sql.query(`
            INSERT INTO categories (name) VALUES (?)
        `, [name.trim()]) as any
        const category = { id: result.insertId, name: name.trim() }
        if (!category) {
            return NextResponse.json({ message: 'Category already exists' }, { status: 409 })
        }
        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        console.error('[POST /api/categories]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        const { id } = await req.json()
        await sql.query('DELETE FROM categories WHERE id = ?', [id]) 
        return NextResponse.json({ message: 'Category deleted' })
    } catch (error) {
        console.error('[DELETE /api/categories]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
