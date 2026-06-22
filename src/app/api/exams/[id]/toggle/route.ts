import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        await sql.query('UPDATE exams SET is_active = NOT is_active, updated_at = NOW() WHERE id = ?', [params.id])
        const [exam] = await sql.query('SELECT is_active FROM exams WHERE id = ?', [params.id])
        return NextResponse.json({ is_active: exam ? exam.is_active : false })
    } catch (error) {
        console.error('[PATCH /api/exams/:id/toggle]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
