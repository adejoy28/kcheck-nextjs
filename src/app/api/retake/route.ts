import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { user_id, exam_id } = await req.json()
        if (!user_id || !exam_id) {
            return NextResponse.json({ message: 'user_id and exam_id are required' }, { status: 400 })
        }

        // Delete old result
        await sql.query('DELETE FROM results WHERE user_id = ? AND exam_id = ?', [user_id, exam_id]) 

        // Remove any existing retake request
        await sql.query('DELETE FROM retake_requests WHERE user_id = ? AND exam_id = ?', [user_id, exam_id]) 

        return NextResponse.json({ message: 'Retake granted. Old result deleted.' })
    } catch (error) {
        console.error('[POST /api/retake]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
