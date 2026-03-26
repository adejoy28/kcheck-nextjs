'use server'

import { signIn, signOut } from '@/auth'

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const username = formData.get('username') as string
        const password = formData.get('password') as string
        
        console.log('[ACTIONS] Authenticate called with:', {
            username,
            hasPassword: !!password,
            passwordLength: password?.length,
            formDataKeys: Array.from(formData.keys())
        })
        
        await signIn('credentials', { username, password, redirectTo: '/dashboard' })
    } catch (error: any) {
        console.log('[ACTIONS] SignIn error:', {
            message: error?.message,
            type: error?.type,
            isRedirect: error?.message?.includes('NEXT_REDIRECT')
        })
        
        if (error?.message?.includes('NEXT_REDIRECT')) throw error
        return 'Invalid credentials.'
    }
}

export async function logout() {
    await signOut({ redirectTo: '/login' })
}