import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        
        if (!session) {
            return NextResponse.json({ error: 'No session found' }, { status: 401 })
        }

        // In NextAuth v5, sessions are automatically refreshed
        // We can just return the current session info
        return NextResponse.json({
            user: session.user,
            expires: session.expires
        })
    } catch (error) {
        console.error('Session refresh error:', error)
        return NextResponse.json(
            { error: 'Failed to refresh session' },
            { status: 500 }
        )
    }
}
