import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json()
        
        console.log('[TEST-AUTH] Received:', { username, passwordLength: password?.length })
        
        // Temporary bypass for testing
        if (username === 'admin' && password === 'admin123') {
            console.log('[TEST-AUTH] Success: credentials match')
            return NextResponse.json({ 
                success: true,
                message: 'Test authentication successful',
                user: { id: 'test-id', name: 'Admin User', username: 'admin', role: 'ADMIN' }
            })
        }
        
        console.log('[TEST-AUTH] Failed: credentials do not match')
        return NextResponse.json({ 
            success: false,
            message: 'Invalid credentials' 
        }, { status: 401 })
        
    } catch (error) {
        console.error('[TEST-AUTH] Error:', error)
        return NextResponse.json({ 
            success: false,
            message: 'Server error' 
        }, { status: 500 })
    }
}
