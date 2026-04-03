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
    } catch (error: unknown) {
        console.log('[ACTIONS] SignIn error:', {
            message: error instanceof Error ? error.message : String(error),
            type: (error as { type?: string })?.type,
            isRedirect: error instanceof Error && error.message.includes('NEXT_REDIRECT')
        })
        
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) throw error
        return 'Invalid credentials.'
    }
}

export async function logout() {
    await signOut({ redirectTo: '/login' })
}