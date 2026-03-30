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
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
        const teams = await sql`SELECT id, name, unit FROM teams ORDER BY name` 
        return NextResponse.json(teams)
    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await requireAdmin()
        if (!session) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        const { name, unit } = await req.json()
        const [team] = await sql`
            INSERT INTO teams (name, unit) VALUES (${name}, ${unit || null})
            ON CONFLICT (name) DO NOTHING RETURNING id, name, unit
        `
        if (!team) return NextResponse.json({ message: 'Team already exists' }, { status: 409 })
        return NextResponse.json(team, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
