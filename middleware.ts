import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req: any) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth

    const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard')
    const isPublicRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/register'

    if (isProtectedRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', nextUrl))
    }

    if (isPublicRoute && isLoggedIn) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|images).*)'],
}
