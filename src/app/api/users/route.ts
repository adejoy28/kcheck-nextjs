import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') return null
    return session
}

export async function GET() {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        const users = await sql.query(`
            SELECT
                u.id, u.name, u.username, u.role, u.is_active,
                u.phone, u.unit, u.access_group, u.created_at,
                t.name AS team_name,
                COUNT(DISTINCT r.id) AS tests_taken
            FROM users u
            LEFT JOIN teams t ON u.team_id = t.id
            LEFT JOIN results r ON r.user_id = u.id
            GROUP BY u.id, t.name
            ORDER BY u.created_at DESC
        `)
        return NextResponse.json(users)
    } catch (error) {
        console.error('[GET /api/users]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

        const { name, username, password, role, phone, unit, access_group, team_id } = await req.json()

        if (!name?.trim() || !username?.trim() || !password) {
            return NextResponse.json({ message: 'Name, username and password are required' }, { status: 400 })
        }
        if (password.length < 6) {
            return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 })
        }

        const existing = await sql.query('SELECT id FROM users WHERE username = ?', [username.toLowerCase().trim()]) 
        if (existing.length > 0) {
            return NextResponse.json({ message: 'Username already exists' }, { status: 409 })
        }

        const hashed = await bcrypt.hash(password, 12)
        const result = await sql.query(`
            INSERT INTO users (name, username, password, role, phone, unit, access_group, team_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            name.trim(),
            username.toLowerCase().trim(),
            hashed,
            role || 'STAFF',
            phone || null,
            unit || null,
            access_group || null,
            team_id || null
        ]) as any
        const user = { id: result.insertId, name: name.trim(), username: username.toLowerCase().trim(), role: role || 'STAFF' }
        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        console.error('[POST /api/users]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
