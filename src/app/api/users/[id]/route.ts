import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') return null
    return session
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        const [user] = await sql`
            SELECT u.id, u.name, u.username, u.role, u.is_active,
                   u.phone, u.unit, u.access_group, u.team_id, u.created_at,
                   t.name AS team_name
            FROM users u
            LEFT JOIN teams t ON u.team_id = t.id
            WHERE u.id = ${params.id}
        `
        if (!user) return NextResponse.json({ message: 'Not found' }, { status: 404 })

        const results = await sql`
            SELECT r.id, r.score, r.total_questions, r.percentage, r.passed,
                   r.time_taken, r.completed_at, e.title AS exam_title
            FROM results r
            JOIN exams e ON r.exam_id = e.id
            WHERE r.user_id = ${params.id}
            ORDER BY r.completed_at DESC
        `
        return NextResponse.json({ ...user, results })
    } catch (error) {
        console.error('[GET /api/users/:id]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        const { name, role, phone, unit, access_group, team_id, password } = await req.json()

        if (password) {
            const hashed = await bcrypt.hash(password, 12)
            await sql`
                UPDATE users SET
                    name = ${name}, role = ${role}, phone = ${phone || null},
                    unit = ${unit || null}, access_group = ${access_group || null},
                    team_id = ${team_id || null}, password = ${hashed}, updated_at = NOW()
                WHERE id = ${params.id}
            `
        } else {
            await sql`
                UPDATE users SET
                    name = ${name}, role = ${role}, phone = ${phone || null},
                    unit = ${unit || null}, access_group = ${access_group || null},
                    team_id = ${team_id || null}, updated_at = NOW()
                WHERE id = ${params.id}
            `
        }
        return NextResponse.json({ message: 'User updated' })
    } catch (error) {
        console.error('[PUT /api/users/:id]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        const [user] = await sql`
            UPDATE users SET is_active = NOT is_active, updated_at = NOW()
            WHERE id = ${params.id}
            RETURNING is_active
        `
        return NextResponse.json({ is_active: user.is_active })
    } catch (error) {
        console.error('[PATCH /api/users/:id]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
