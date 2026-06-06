import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

async function requireAdmin() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') return null
    return session
}

export async function GET() {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        const batches = await sql.query(`
            SELECT
                b.id, b.name, b.start_date, b.end_date, b.is_active, b.created_at,
                e.title AS exam_title,
                COUNT(DISTINCT bm.user_id) AS member_count,
                COUNT(DISTINCT bt.team_id) AS team_count,
                COUNT(DISTINCT r.id) AS result_count
            FROM batches b
            JOIN exams e ON b.exam_id = e.id
            LEFT JOIN batch_members bm ON bm.batch_id = b.id
            LEFT JOIN batch_teams bt ON bt.batch_id = b.id
            LEFT JOIN results r ON r.exam_id = b.exam_id
            GROUP BY b.id, e.title
            ORDER BY b.created_at DESC
        `)
        return NextResponse.json(batches)
    } catch (error) {
        console.error('[GET /api/batches]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        const { name, exam_id, start_date, end_date, user_ids, team_ids } = await req.json()

        if (!name?.trim() || !exam_id || !start_date || !end_date) {
            return NextResponse.json({ message: 'Name, exam, start date and end date are required' }, { status: 400 })
        }

        const result = await sql.query(`
            INSERT INTO batches (name, exam_id, start_date, end_date)
            VALUES (?, ?, ?, ?)
        `, [name.trim(), exam_id, start_date, end_date]) as any
        const batch = { id: result.insertId }

        if (user_ids?.length > 0) {
            const placeholders = user_ids.map(() => '(?, ?)').join(', ')
            const values: any[] = []
            for (const userId of user_ids) values.push(batch.id, userId)
            await sql.query(
                `INSERT INTO batch_members (batch_id, user_id) VALUES ${placeholders} ON DUPLICATE KEY UPDATE batch_id=batch_id`,
                values
            )
        }

        if (team_ids?.length > 0) {
            const placeholders = team_ids.map(() => '(?, ?)').join(', ')
            const values: any[] = []
            for (const teamId of team_ids) values.push(batch.id, teamId)
            await sql.query(
                `INSERT INTO batch_teams (batch_id, team_id) VALUES ${placeholders} ON DUPLICATE KEY UPDATE batch_id=batch_id`,
                values
            )
        }

        return NextResponse.json({ message: 'Batch created', id: batch.id }, { status: 201 })
    } catch (error) {
        console.error('[POST /api/batches]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
