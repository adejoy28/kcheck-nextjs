import 'server-only'
import { cache } from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

// Cached auth functions to minimize database/session calls
export const getCurrentUser = cache(async () => {
    const session = await auth()
    
    if (!session?.user?.id) {
        redirect('/login')
    }
    
    return session.user
})

export const requireAuth = cache(async () => {
    const session = await auth()
    
    if (!session?.user?.id) {
        redirect('/login')
    }
    
    return session
})

export const requireAdmin = cache(async () => {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        redirect('/dashboard')
    }
    
    return session
})

export const requireStaffOrAdmin = cache(async () => {
    const session = await auth()
    
    if (!session?.user?.id || !['STAFF', 'ADMIN'].includes(session.user.role)) {
        redirect('/login')
    }
    
    return session
})

// For API routes - return null instead of redirecting
export const apiRequireAdmin = cache(async () => {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return null
    }
    
    return session
})

export const apiRequireAuth = cache(async () => {
    const session = await auth()
    
    if (!session?.user?.id) {
        return null
    }
    
    return session
})
