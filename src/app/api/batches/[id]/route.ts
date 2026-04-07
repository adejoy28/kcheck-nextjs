import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

async function requireAdmin() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') return null
    return session
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        const [batch] = await sql.query(`
            SELECT b.*, e.title AS exam_title
            FROM batches b JOIN exams e ON b.exam_id = e.id
            WHERE b.id = ?
        `, [params.id])
        if (!batch) return NextResponse.json({ message: 'Not found' }, { status: 404 })

        const members = await sql.query(`
            SELECT u.id, u.name, u.username, u.unit
            FROM batch_members bm JOIN users u ON u.id = bm.user_id
            WHERE bm.batch_id = ?
        `, [params.id])
        const teams = await sql.query(`
            SELECT t.id, t.name, t.unit
            FROM batch_teams bt JOIN teams t ON t.id = bt.team_id
            WHERE bt.batch_id = ?
        `, [params.id])
        return NextResponse.json({ ...batch, members, teams })
    } catch (error) {
        console.error('[GET /api/batches/:id]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        const { name, start_date, end_date, is_active, user_ids, team_ids } = await req.json()

        await sql.query(`
            UPDATE batches SET name = ?, start_date = ?,
            end_date = ?, is_active = ?, updated_at = NOW()
            WHERE id = ?
        `, [name, start_date, end_date, is_active ?? true, params.id])

        await sql.query('DELETE FROM batch_members WHERE batch_id = ?', [params.id]) 
        await sql.query('DELETE FROM batch_teams WHERE batch_id = ?', [params.id]) 

        if (user_ids?.length > 0) {
            for (const userId of user_ids) {
                await sql.query('INSERT INTO batch_members (batch_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE batch_id=batch_id', [params.id, userId]) 
            }
        }
        if (team_ids?.length > 0) {
            for (const teamId of team_ids) {
                await sql.query('INSERT INTO batch_teams (batch_id, team_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE batch_id=batch_id', [params.id, teamId]) 
            }
        }

        return NextResponse.json({ message: 'Batch updated' })
    } catch (error) {
        console.error('[PUT /api/batches/:id]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        await sql.query('DELETE FROM batch_members WHERE batch_id = ?', [params.id]) 
        await sql.query('DELETE FROM batch_teams WHERE batch_id = ?', [params.id]) 
        await sql.query('DELETE FROM batches WHERE id = ?', [params.id]) 

        return NextResponse.json({ message: 'Batch deleted' })
    } catch (error) {
        console.error('[DELETE /api/batches/:id]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
