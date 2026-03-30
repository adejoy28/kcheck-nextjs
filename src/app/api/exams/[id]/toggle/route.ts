import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const [exam] = await sql`
            UPDATE exams SET is_active = NOT is_active, updated_at = NOW()
            WHERE id = ${params.id}
            RETURNING is_active
        `
        return NextResponse.json({ is_active: exam.is_active })
    } catch (error) {
        console.error('[PATCH /api/exams/:id/toggle]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
